export interface ServerConfig {
  serverUrl: string;
  username: string;
  token?: string;
  salt?: string;
  password?: string; // Legacy or fallback
  clientName: string;
  apiVersion: string;
  isDemoMode: boolean;
}

export interface Song {
  id: string;
  title: string;
  album: string;
  artist: string;
  artistId?: string;
  albumId?: string;
  coverArt?: string;
  duration: number; // in seconds
  track?: number;
  year?: number;
  genre?: string;
  bitRate?: number;
  starred?: string; // ISO date string if starred
  streamUrl?: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  coverArt?: string;
  songCount?: number;
  duration?: number;
  year?: number;
  genre?: string;
  songs?: Song[];
}

export interface Artist {
  id: string;
  name: string;
  albumCount?: number;
  coverArt?: string;
  albums?: Album[];
}

export interface Playlist {
  id: string;
  name: string;
  comment?: string;
  songCount: number;
  duration: number;
  coverArt?: string;
  songs?: Song[];
}

export interface SearchResult {
  artists: Artist[];
  albums: Album[];
  songs: Song[];
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaybackState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  showVolumeHud: boolean;
}

export type ViewType =
  | 'menu'
  | 'now_playing'
  | 'cover_flow'
  | 'search'
  | 'settings'
  | 'server_settings'
  | 'artists'
  | 'artist_detail'
  | 'albums'
  | 'album_detail'
  | 'songs'
  | 'playlists'
  | 'playlist_detail'
  | 'genres'
  | 'genre_detail'
  | 'recently_added'
  | 'most_played'
  | 'favorites'
  | 'about';

export interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  hasSubmenu?: boolean;
  icon?: string;
  action?: () => void;
  targetView?: ViewType;
  targetData?: any;
  coverArt?: string;
  isStarred?: boolean;
}

export interface NavigationScreen {
  id: string;
  title: string;
  viewType: ViewType;
  items?: MenuItem[];
  selectedIndex: number;
  data?: any;
}
