import { Song, PlaybackState, RepeatMode } from '../types/subsonic';
import { subsonicApi } from './subsonicApi';

type Listener = (state: PlaybackState) => void;

class AudioEngine {
  private audio: HTMLAudioElement;
  private state: PlaybackState = {
    currentSong: null,
    queue: [],
    queueIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    repeatMode: 'off',
    isShuffle: false,
    showVolumeHud: false,
  };
  private listeners: Set<Listener> = new Set();
  private volumeHudTimeout: any = null;
  private hasScrobbledCurrentSong = false;

  constructor() {
    this.audio = new Audio();
    this.audio.volume = this.state.volume;
    this.setupAudioListeners();
  }

  private setupAudioListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.state.currentTime = this.audio.currentTime || 0;
      this.state.duration = this.audio.duration || 0;
      this.notifyListeners();

      // Scrobble trigger when played 50% or 4 minutes
      if (!this.hasScrobbledCurrentSong && this.state.currentSong) {
        const threshold = Math.min(240, (this.state.duration || this.state.currentSong.duration || 0) * 0.5);
        if (threshold > 0 && this.state.currentTime >= threshold) {
          this.hasScrobbledCurrentSong = true;
          subsonicApi.scrobble(this.state.currentSong.id, true);
        }
      }
    });

    this.audio.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.notifyListeners();
      this.updateMediaSession();
    });

    this.audio.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.notifyListeners();
      this.updateMediaSession();
    });

    this.audio.addEventListener('ended', () => {
      this.handleSongEnded();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.state.duration = this.audio.duration || 0;
      this.notifyListeners();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.state.isPlaying = false;
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): PlaybackState {
    return { ...this.state };
  }

  public async playSong(song: Song, queue?: Song[], index?: number) {
    if (queue) {
      this.state.queue = [...queue];
      this.state.queueIndex = index !== undefined ? index : this.state.queue.findIndex((s) => s.id === song.id);
    } else if (!this.state.queue.some((s) => s.id === song.id)) {
      this.state.queue = [song];
      this.state.queueIndex = 0;
    }

    this.state.currentSong = song;
    this.hasScrobbledCurrentSong = false;
    const streamUrl = subsonicApi.getStreamUrl(song.id);

    if (streamUrl) {
      this.audio.src = streamUrl;
      try {
        await this.audio.play();
      } catch (err) {
        console.warn('Audio autoplay failed or blocked:', err);
      }
    }
    this.notifyListeners();
    this.updateMediaSession();
  }

  public togglePlay() {
    if (!this.state.currentSong && this.state.queue.length > 0) {
      const idx = this.state.queueIndex >= 0 ? this.state.queueIndex : 0;
      this.playSong(this.state.queue[idx], this.state.queue, idx);
      return;
    }
    if (this.state.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(console.warn);
    }
  }

  public pause() {
    this.audio.pause();
  }

  public play() {
    if (this.audio.src) {
      this.audio.play().catch(console.warn);
    }
  }

  public nextTrack() {
    if (this.state.queue.length === 0) return;

    if (this.state.isShuffle) {
      const nextIdx = Math.floor(Math.random() * this.state.queue.length);
      this.playSong(this.state.queue[nextIdx], this.state.queue, nextIdx);
      return;
    }

    let nextIdx = this.state.queueIndex + 1;
    if (nextIdx >= this.state.queue.length) {
      if (this.state.repeatMode === 'all') {
        nextIdx = 0;
      } else {
        return; // End of queue
      }
    }
    this.playSong(this.state.queue[nextIdx], this.state.queue, nextIdx);
  }

  public prevTrack() {
    if (this.audio.currentTime > 3) {
      // If played > 3s, restart track like classic iPod
      this.audio.currentTime = 0;
      return;
    }
    if (this.state.queue.length === 0) return;

    let prevIdx = this.state.queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = this.state.queue.length - 1;
    }
    this.playSong(this.state.queue[prevIdx], this.state.queue, prevIdx);
  }

  private handleSongEnded() {
    if (this.state.repeatMode === 'one') {
      this.audio.currentTime = 0;
      this.audio.play().catch(console.warn);
      return;
    }
    this.nextTrack();
  }

  public seek(seconds: number) {
    const target = Math.max(0, Math.min(seconds, this.audio.duration || 0));
    this.audio.currentTime = target;
    this.state.currentTime = target;
    this.notifyListeners();
  }

  public seekDelta(deltaSeconds: number) {
    this.seek(this.audio.currentTime + deltaSeconds);
  }

  public setVolume(volume: number) {
    const vol = Math.max(0, Math.min(1, volume));
    this.audio.volume = vol;
    this.state.volume = vol;
    this.state.showVolumeHud = true;
    this.notifyListeners();

    if (this.volumeHudTimeout) clearTimeout(this.volumeHudTimeout);
    this.volumeHudTimeout = setTimeout(() => {
      this.state.showVolumeHud = false;
      this.notifyListeners();
    }, 1500);
  }

  public adjustVolume(delta: number) {
    this.setVolume(this.state.volume + delta);
  }

  public toggleRepeat() {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currIdx = modes.indexOf(this.state.repeatMode);
    this.state.repeatMode = modes[(currIdx + 1) % modes.length];
    this.notifyListeners();
  }

  public toggleShuffle() {
    this.state.isShuffle = !this.state.isShuffle;
    this.notifyListeners();
  }

  private updateMediaSession() {
    if ('mediaSession' in navigator && this.state.currentSong) {
      const song = this.state.currentSong;
      const artwork = subsonicApi.getCoverArtUrl(song.coverArt, 512);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: artwork ? [{ src: artwork, sizes: '512x512', type: 'image/jpeg' }] : [],
      });

      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) this.seek(details.seekTime);
      });
    }
  }
}

export const audioEngine = new AudioEngine();
