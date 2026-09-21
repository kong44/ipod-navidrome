import CryptoJS from 'crypto-js';
import { ServerConfig, Artist, Album, Song, Playlist, SearchResult } from '../types/subsonic';
import { DEMO_ARTISTS, DEMO_ALBUMS, DEMO_SONGS, DEMO_PLAYLISTS } from './mockData';

const CONFIG_KEY = 'ipod_navidrome_server_config';

export const DEFAULT_CONFIG: ServerConfig = {
  serverUrl: '',
  username: '',
  token: '',
  salt: '',
  password: '',
  clientName: 'iPodClassic',
  apiVersion: '1.16.1',
  isDemoMode: true,
};

class SubsonicApiService {
  private config: ServerConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  public getConfig(): ServerConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: Partial<ServerConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (!this.config.isDemoMode && this.config.password && !this.config.token) {
      // Generate salt and md5 token for OpenSubsonic / Navidrome auth
      const salt = Math.random().toString(36).substring(2, 10);
      const token = CryptoJS.MD5(this.config.password + salt).toString();
      this.config.salt = salt;
      this.config.token = token;
    }
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    } catch {
      // ignore local storage error
    }
  }

  private loadConfig(): ServerConfig {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  }

  private getAuthParams(): Record<string, string> {
    const params: Record<string, string> = {
      u: this.config.username,
      v: this.config.apiVersion || '1.16.1',
      c: this.config.clientName || 'iPodClassic',
      f: 'json',
    };

    if (this.config.token && this.config.salt) {
      params.t = this.config.token;
      params.s = this.config.salt;
    } else if (this.config.password) {
      const salt = Math.random().toString(36).substring(2, 10);
      params.s = salt;
      params.t = CryptoJS.MD5(this.config.password + salt).toString();
    }
    return params;
  }

  private buildUrl(endpoint: string, extraParams: Record<string, string | number | boolean> = {}): string {
    let base = this.config.serverUrl.trim();
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    if (!base.endsWith('/rest')) {
      base = `${base}/rest`;
    }

    const authParams = this.getAuthParams();
    const query = new URLSearchParams({
      ...authParams,
      ...Object.entries(extraParams).reduce((acc, [k, v]) => {
        acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>),
    });

    return `${base}/${endpoint}.view?${query.toString()}`;
  }

  private async fetchSubsonic<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (this.config.isDemoMode || !this.config.serverUrl) {
      throw new Error('Running in demo mode');
    }

    const url = this.buildUrl(endpoint, params);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    const sub = data['subsonic-response'];
    if (!sub || sub.status !== 'ok') {
      const errMsg = sub?.error?.message || 'Subsonic API error';
      throw new Error(errMsg);
    }
    return sub as T;
  }

  public getCoverArtUrl(coverId?: string, size = 400): string | undefined {
    if (!coverId) return undefined;
    if (this.config.isDemoMode || coverId.startsWith('http')) {
      return coverId;
    }
    return this.buildUrl('getCoverArt', { id: coverId, size });
  }

  public getStreamUrl(songId: string): string {
    if (this.config.isDemoMode) {
      const demo = DEMO_SONGS.find((s) => s.id === songId);
      return demo?.streamUrl || '';
    }
    return this.buildUrl('stream', { id: songId });
  }

  public async ping(): Promise<{ ok: boolean; version?: string; error?: string }> {
    if (this.config.isDemoMode) {
      return { ok: true, version: 'Demo Mode (Offline)' };
    }
    try {
      const res = await this.fetchSubsonic('ping');
      return { ok: true, version: res.version || res.serverVersion || 'Navidrome' };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Connection failed' };
    }
  }

  public async getArtists(): Promise<Artist[]> {
    if (this.config.isDemoMode) {
      return DEMO_ARTISTS;
    }
    try {
      const res = await this.fetchSubsonic('getArtists');
      const indexList = res.artists?.index || [];
      const artists: Artist[] = [];
      for (const idx of indexList) {
        if (Array.isArray(idx.artist)) {
          for (const a of idx.artist) {
            artists.push({
              id: a.id,
              name: a.name,
              albumCount: a.albumCount,
              coverArt: a.coverArt,
            });
          }
        }
      }
      return artists.sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      return DEMO_ARTISTS;
    }
  }

  public async getArtist(artistId: string): Promise<Artist> {
    if (this.config.isDemoMode) {
      const art = DEMO_ARTISTS.find((a) => a.id === artistId);
      if (art) return art;
      return { id: artistId, name: 'Unknown Artist', albums: [] };
    }
    try {
      const res = await this.fetchSubsonic('getArtist', { id: artistId });
      const a = res.artist;
      return {
        id: a.id,
        name: a.name,
        albumCount: a.albumCount,
        coverArt: a.coverArt,
        albums: (a.album || []).map((alb: any) => ({
          id: alb.id,
          name: alb.name || alb.title,
          artist: alb.artist || a.name,
          artistId: a.id,
          coverArt: alb.coverArt,
          year: alb.year,
          songCount: alb.songCount,
          duration: alb.duration,
        })),
      };
    } catch {
      return DEMO_ARTISTS[0];
    }
  }

  public async getAlbums(type: 'recent' | 'frequent' | 'starred' | 'alphabeticalByName' = 'alphabeticalByName', size = 50): Promise<Album[]> {
    if (this.config.isDemoMode) {
      return DEMO_ALBUMS;
    }
    try {
      const res = await this.fetchSubsonic('getAlbumList2', { type, size });
      const albumList = res.albumList2?.album || [];
      return albumList.map((alb: any) => ({
        id: alb.id,
        name: alb.name || alb.title,
        artist: alb.artist,
        artistId: alb.artistId,
        coverArt: alb.coverArt,
        year: alb.year,
        songCount: alb.songCount,
        duration: alb.duration,
        genre: alb.genre,
      }));
    } catch {
      return DEMO_ALBUMS;
    }
  }

  public async getAlbum(albumId: string): Promise<Album> {
    if (this.config.isDemoMode) {
      const alb = DEMO_ALBUMS.find((a) => a.id === albumId);
      if (alb) return alb;
      return { id: albumId, name: 'Unknown Album', artist: 'Unknown', songs: [] };
    }
    try {
      const res = await this.fetchSubsonic('getAlbum', { id: albumId });
      const alb = res.album;
      const songs: Song[] = (alb.song || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        album: s.album || alb.name,
        artist: s.artist || alb.artist,
        artistId: s.artistId || alb.artistId,
        albumId: alb.id,
        coverArt: s.coverArt || alb.coverArt,
        duration: s.duration || 0,
        track: s.track,
        year: s.year || alb.year,
        genre: s.genre || alb.genre,
        bitRate: s.bitRate,
        starred: s.starred,
      }));
      return {
        id: alb.id,
        name: alb.name || alb.title,
        artist: alb.artist,
        artistId: alb.artistId,
        coverArt: alb.coverArt,
        year: alb.year,
        songCount: alb.songCount || songs.length,
        duration: alb.duration,
        genre: alb.genre,
        songs,
      };
    } catch {
      return DEMO_ALBUMS[0];
    }
  }

  public async getPlaylists(): Promise<Playlist[]> {
    if (this.config.isDemoMode) {
      return DEMO_PLAYLISTS;
    }
    try {
      const res = await this.fetchSubsonic('getPlaylists');
      const list = res.playlists?.playlist || [];
      return list.map((p: any) => ({
        id: p.id,
        name: p.name,
        comment: p.comment,
        songCount: p.songCount || 0,
        duration: p.duration || 0,
        coverArt: p.coverArt,
      }));
    } catch {
      return DEMO_PLAYLISTS;
    }
  }

  public async getPlaylist(playlistId: string): Promise<Playlist> {
    if (this.config.isDemoMode) {
      const pl = DEMO_PLAYLISTS.find((p) => p.id === playlistId);
      if (pl) return pl;
      return { id: playlistId, name: 'Playlist', songCount: 0, duration: 0, songs: [] };
    }
    try {
      const res = await this.fetchSubsonic('getPlaylist', { id: playlistId });
      const pl = res.playlist;
      const songs: Song[] = (pl.entry || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        album: s.album,
        artist: s.artist,
        artistId: s.artistId,
        albumId: s.albumId,
        coverArt: s.coverArt,
        duration: s.duration || 0,
        track: s.track,
        year: s.year,
        genre: s.genre,
        starred: s.starred,
      }));
      return {
        id: pl.id,
        name: pl.name,
        comment: pl.comment,
        songCount: pl.songCount || songs.length,
        duration: pl.duration || 0,
        coverArt: pl.coverArt || songs[0]?.coverArt,
        songs,
      };
    } catch {
      return DEMO_PLAYLISTS[0];
    }
  }

  public async search(query: string): Promise<SearchResult> {
    if (!query.trim()) {
      return { artists: [], albums: [], songs: [] };
    }
    if (this.config.isDemoMode) {
      const q = query.toLowerCase();
      return {
        artists: DEMO_ARTISTS.filter((a) => a.name.toLowerCase().includes(q)),
        albums: DEMO_ALBUMS.filter((a) => a.name.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)),
        songs: DEMO_SONGS.filter((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q)),
      };
    }
    try {
      const res = await this.fetchSubsonic('search3', { query, songCount: 30, albumCount: 20, artistCount: 20 });
      const sResult = res.searchResult3 || {};
      return {
        artists: (sResult.artist || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          albumCount: a.albumCount,
          coverArt: a.coverArt,
        })),
        albums: (sResult.album || []).map((alb: any) => ({
          id: alb.id,
          name: alb.name || alb.title,
          artist: alb.artist,
          coverArt: alb.coverArt,
          year: alb.year,
        })),
        songs: (sResult.song || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          album: s.album,
          artist: s.artist,
          coverArt: s.coverArt,
          duration: s.duration || 0,
          track: s.track,
          year: s.year,
          starred: s.starred,
        })),
      };
    } catch {
      return { artists: [], albums: [], songs: [] };
    }
  }

  public async scrobble(songId: string, submission: boolean = true): Promise<void> {
    if (this.config.isDemoMode) return;
    try {
      await this.fetchSubsonic('scrobble', { id: songId, submission });
    } catch {
      // ignore
    }
  }

  public async toggleStar(songId: string, currentlyStarred: boolean): Promise<boolean> {
    if (this.config.isDemoMode) {
      const song = DEMO_SONGS.find((s) => s.id === songId);
      if (song) {
        song.starred = currentlyStarred ? undefined : new Date().toISOString();
        return !currentlyStarred;
      }
      return !currentlyStarred;
    }
    try {
      const endpoint = currentlyStarred ? 'unstar' : 'star';
      await this.fetchSubsonic(endpoint, { id: songId });
      return !currentlyStarred;
    } catch {
      return currentlyStarred;
    }
  }
}

export const subsonicApi = new SubsonicApiService();
