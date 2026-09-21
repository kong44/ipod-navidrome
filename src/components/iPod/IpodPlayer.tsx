import React, { useState, useEffect, useCallback } from 'react';
import { IpodChassis } from './IpodChassis';
import { ClickWheel, IpodTheme } from './ClickWheel';
import { ScreenHeader } from './ScreenHeader';
import { MenuView } from './views/MenuView';
import { NowPlayingView } from './views/NowPlayingView';
import { CoverFlowView } from './views/CoverFlowView';
import { SearchView } from './views/SearchView';
import { SettingsView } from './views/SettingsView';
import { ServerScreenView } from './views/ServerScreenView';
import {
  MenuItem,
  NavigationScreen,
  PlaybackState,
  Song,
  Album,
  Artist,
  Playlist,
} from '../../types/subsonic';
import { subsonicApi } from '../../services/subsonicApi';
import { audioEngine } from '../../services/audioEngine';

export const IpodPlayer: React.FC = () => {
  const [theme, setTheme] = useState<IpodTheme>('silver');
  const [isHold, setIsHold] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ipod_fullscreen_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [albumsCache, setAlbumsCache] = useState<Album[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioEngine.getState());

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (isNativeFull) {
        setIsFullscreen(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ipod_fullscreen_mode', String(next));
      } catch {
        // ignore
      }

      // Try native browser fullscreen if supported (desktop / Android)
      if (next) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          (document.documentElement as any).webkitRequestFullscreen();
        }
      } else {
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          }
        }
      }

      return next;
    });
  }, []);

  // Navigation Stack
  const [navStack, setNavStack] = useState<NavigationScreen[]>([
    {
      id: 'main_menu',
      title: 'iPod',
      viewType: 'menu',
      selectedIndex: 0,
      items: [
        { id: 'music', title: 'Music', icon: 'music', hasSubmenu: true },
        { id: 'cover_flow', title: 'Cover Flow', icon: 'flow', hasSubmenu: true },
        { id: 'now_playing', title: 'Now Playing', icon: 'music', hasSubmenu: true },
        { id: 'search', title: 'Search', icon: 'search', hasSubmenu: true },
        { id: 'settings', title: 'Settings', icon: 'settings', hasSubmenu: true },
        { id: 'shuffle_songs', title: 'Shuffle Songs', icon: 'music', hasSubmenu: false },
      ],
    },
  ]);

  const currentScreen = navStack[navStack.length - 1];

  // Subscribe to Audio Engine state changes
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setPlaybackState(state);
    });
    return unsubscribe;
  }, []);

  // Pre-fetch albums for Cover Flow & Cache
  const refreshLibraryData = useCallback(async () => {
    try {
      const albums = await subsonicApi.getAlbums('alphabeticalByName', 40);
      setAlbumsCache(albums);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshLibraryData();
  }, [refreshLibraryData]);

  // Update selected index in current screen
  const updateSelectedIndex = useCallback(
    (newIndex: number) => {
      if (isHold) return;
      setNavStack((prev) => {
        const copy = [...prev];
        const last = { ...copy[copy.length - 1] };
        const max = (last.items?.length || 0) - 1;
        if (max >= 0) {
          last.selectedIndex = Math.max(0, Math.min(newIndex, max));
        } else if (last.viewType === 'cover_flow') {
          const maxAlbums = Math.max(0, albumsCache.length - 1);
          last.selectedIndex = Math.max(0, Math.min(newIndex, maxAlbums));
        } else if (last.viewType === 'settings') {
          last.selectedIndex = Math.max(0, Math.min(newIndex, 6));
        }
        copy[copy.length - 1] = last;
        return copy;
      });
    },
    [isHold, albumsCache.length]
  );

  // Wheel Clockwise rotation handler
  const handleRotateClockwise = useCallback(() => {
    if (isHold) return;
    if (currentScreen.viewType === 'now_playing') {
      audioEngine.adjustVolume(0.05);
      return;
    }
    updateSelectedIndex(currentScreen.selectedIndex + 1);
  }, [currentScreen, isHold, updateSelectedIndex]);

  // Wheel Counter-Clockwise rotation handler
  const handleRotateCounterClockwise = useCallback(() => {
    if (isHold) return;
    if (currentScreen.viewType === 'now_playing') {
      audioEngine.adjustVolume(-0.05);
      return;
    }
    updateSelectedIndex(currentScreen.selectedIndex - 1);
  }, [currentScreen, isHold, updateSelectedIndex]);

  // Push new screen to nav stack
  const pushScreen = useCallback((screen: NavigationScreen) => {
    setNavStack((prev) => [...prev, screen]);
  }, []);

  // Pop current screen (MENU button)
  const handleMenu = useCallback(() => {
    if (isHold) return;
    if (navStack.length > 1) {
      setNavStack((prev) => prev.slice(0, -1));
    }
  }, [isHold, navStack.length]);

  // Play a song and navigate to Now Playing view
  const handlePlaySong = useCallback(
    (song: Song, queue?: Song[], index?: number) => {
      audioEngine.playSong(song, queue, index);
      pushScreen({
        id: 'now_playing',
        title: 'Now Playing',
        viewType: 'now_playing',
        selectedIndex: 0,
      });
    },
    [pushScreen]
  );

  // Navigate to Artist view
  const handleSelectArtist = useCallback(
    async (artist: Artist) => {
      const fullArtist = await subsonicApi.getArtist(artist.id);
      const items: MenuItem[] = (fullArtist.albums || []).map((alb) => ({
        id: alb.id,
        title: alb.name,
        subtitle: `${alb.songCount || 0} songs`,
        hasSubmenu: true,
        icon: 'album',
        coverArt: alb.coverArt,
        targetData: alb,
      }));

      pushScreen({
        id: `artist_${artist.id}`,
        title: artist.name,
        viewType: 'menu',
        selectedIndex: 0,
        items,
        data: fullArtist,
      });
    },
    [pushScreen]
  );

  // Navigate to Album view
  const handleSelectAlbum = useCallback(
    async (album: Album) => {
      const fullAlbum = await subsonicApi.getAlbum(album.id);
      const songs = fullAlbum.songs || [];
      const items: MenuItem[] = songs.map((s, idx) => ({
        id: s.id,
        title: `${s.track ? `${s.track}. ` : ''}${s.title}`,
        subtitle: s.artist,
        hasSubmenu: false,
        icon: 'music',
        coverArt: fullAlbum.coverArt,
        action: () => handlePlaySong(s, songs, idx),
      }));

      pushScreen({
        id: `album_${album.id}`,
        title: fullAlbum.name,
        viewType: 'menu',
        selectedIndex: 0,
        items,
        data: fullAlbum,
      });
    },
    [pushScreen, handlePlaySong]
  );

  // Navigate to Playlist view
  const handleSelectPlaylist = useCallback(
    async (playlist: Playlist) => {
      const fullPlaylist = await subsonicApi.getPlaylist(playlist.id);
      const songs = fullPlaylist.songs || [];
      const items: MenuItem[] = songs.map((s, idx) => ({
        id: s.id,
        title: s.title,
        subtitle: s.artist,
        hasSubmenu: false,
        icon: 'music',
        coverArt: s.coverArt || fullPlaylist.coverArt,
        action: () => handlePlaySong(s, songs, idx),
      }));

      pushScreen({
        id: `playlist_${playlist.id}`,
        title: fullPlaylist.name,
        viewType: 'menu',
        selectedIndex: 0,
        items,
        data: fullPlaylist,
      });
    },
    [pushScreen, handlePlaySong]
  );

  // Handle Select button (Center button)
  const handleSelect = useCallback(async () => {
    if (isHold) return;

    if (currentScreen.viewType === 'now_playing') {
      // Toggle Star in Now Playing
      if (playbackState.currentSong) {
        const isStarred = !!playbackState.currentSong.starred;
        await subsonicApi.toggleStar(playbackState.currentSong.id, isStarred);
        playbackState.currentSong.starred = isStarred ? undefined : new Date().toISOString();
        setPlaybackState({ ...playbackState });
      }
      return;
    }

    if (currentScreen.viewType === 'cover_flow') {
      const selectedAlbum = albumsCache[currentScreen.selectedIndex];
      if (selectedAlbum) {
        handleSelectAlbum(selectedAlbum);
      }
      return;
    }

    if (currentScreen.viewType === 'settings') {
      // Settings row clicked
      return;
    }

    if (currentScreen.viewType === 'menu') {
      const item = currentScreen.items?.[currentScreen.selectedIndex];
      if (!item) return;

      if (item.action) {
        item.action();
        return;
      }

      switch (item.id) {
        case 'music':
          pushScreen({
            id: 'music_menu',
            title: 'Music',
            viewType: 'menu',
            selectedIndex: 0,
            items: [
              { id: 'playlists', title: 'Playlists', icon: 'playlist', hasSubmenu: true },
              { id: 'artists', title: 'Artists', icon: 'artist', hasSubmenu: true },
              { id: 'albums', title: 'Albums', icon: 'album', hasSubmenu: true },
              { id: 'songs', title: 'Songs', icon: 'music', hasSubmenu: true },
              { id: 'cover_flow', title: 'Cover Flow', icon: 'flow', hasSubmenu: true },
              { id: 'search', title: 'Search', icon: 'search', hasSubmenu: true },
            ],
          });
          break;

        case 'cover_flow':
          pushScreen({
            id: 'cover_flow',
            title: 'Cover Flow',
            viewType: 'cover_flow',
            selectedIndex: 0,
          });
          break;

        case 'now_playing':
          pushScreen({
            id: 'now_playing',
            title: 'Now Playing',
            viewType: 'now_playing',
            selectedIndex: 0,
          });
          break;

        case 'search':
          pushScreen({
            id: 'search',
            title: 'Search',
            viewType: 'search',
            selectedIndex: 0,
          });
          break;

        case 'settings':
          pushScreen({
            id: 'settings',
            title: 'Settings',
            viewType: 'settings',
            selectedIndex: 0,
          });
          break;

        case 'shuffle_songs': {
          const albums = await subsonicApi.getAlbums('alphabeticalByName', 10);
          const allSongs: Song[] = [];
          for (const a of albums) {
            const full = await subsonicApi.getAlbum(a.id);
            if (full.songs) allSongs.push(...full.songs);
          }
          if (allSongs.length > 0) {
            const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
            audioEngine.playSong(shuffled[0], shuffled, 0);
            pushScreen({
              id: 'now_playing',
              title: 'Now Playing',
              viewType: 'now_playing',
              selectedIndex: 0,
            });
          }
          break;
        }

        case 'playlists': {
          const playlists = await subsonicApi.getPlaylists();
          const pItems: MenuItem[] = playlists.map((p) => ({
            id: p.id,
            title: p.name,
            subtitle: `${p.songCount} songs`,
            icon: 'playlist',
            hasSubmenu: true,
            coverArt: p.coverArt,
            action: () => handleSelectPlaylist(p),
          }));
          pushScreen({
            id: 'playlists_menu',
            title: 'Playlists',
            viewType: 'menu',
            selectedIndex: 0,
            items: pItems,
          });
          break;
        }

        case 'artists': {
          const artists = await subsonicApi.getArtists();
          const aItems: MenuItem[] = artists.map((art) => ({
            id: art.id,
            title: art.name,
            subtitle: `${art.albumCount || 1} albums`,
            icon: 'artist',
            hasSubmenu: true,
            coverArt: art.coverArt,
            action: () => handleSelectArtist(art),
          }));
          pushScreen({
            id: 'artists_menu',
            title: 'Artists',
            viewType: 'menu',
            selectedIndex: 0,
            items: aItems,
          });
          break;
        }

        case 'albums': {
          const albums = await subsonicApi.getAlbums('alphabeticalByName', 50);
          const albItems: MenuItem[] = albums.map((alb) => ({
            id: alb.id,
            title: alb.name,
            subtitle: alb.artist,
            icon: 'album',
            hasSubmenu: true,
            coverArt: alb.coverArt,
            action: () => handleSelectAlbum(alb),
          }));
          pushScreen({
            id: 'albums_menu',
            title: 'Albums',
            viewType: 'menu',
            selectedIndex: 0,
            items: albItems,
          });
          break;
        }

        case 'songs': {
          const albums = await subsonicApi.getAlbums('alphabeticalByName', 20);
          const allSongs: Song[] = [];
          for (const a of albums) {
            const full = await subsonicApi.getAlbum(a.id);
            if (full.songs) allSongs.push(...full.songs);
          }
          const sItems: MenuItem[] = allSongs.map((s, idx) => ({
            id: s.id,
            title: s.title,
            subtitle: s.artist,
            icon: 'music',
            hasSubmenu: false,
            coverArt: s.coverArt,
            action: () => handlePlaySong(s, allSongs, idx),
          }));
          pushScreen({
            id: 'songs_menu',
            title: 'Songs',
            viewType: 'menu',
            selectedIndex: 0,
            items: sItems,
          });
          break;
        }

        default:
          if (item.targetData) {
            handleSelectAlbum(item.targetData);
          }
          break;
      }
    }
  }, [
    isHold,
    currentScreen,
    playbackState,
    albumsCache,
    pushScreen,
    handleSelectAlbum,
    handleSelectArtist,
    handleSelectPlaylist,
    handlePlaySong,
  ]);

  // Next / Prev / PlayPause handlers
  const handleNext = () => {
    if (isHold) return;
    audioEngine.nextTrack();
  };

  const handlePrev = () => {
    if (isHold) return;
    audioEngine.prevTrack();
  };

  const handlePlayPause = () => {
    if (isHold) return;
    audioEngine.togglePlay();
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          handleRotateCounterClockwise();
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          handleRotateClockwise();
          break;
        case 'Enter':
          e.preventDefault();
          handleSelect();
          break;
        case 'Escape':
        case 'Backspace':
        case 'm':
        case 'M':
          e.preventDefault();
          handleMenu();
          break;
        case ' ':
        case 'p':
        case 'P':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          handleNext();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          handlePrev();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRotateClockwise, handleRotateCounterClockwise, handleSelect, handleMenu]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <IpodChassis
        theme={theme}
        isHold={isHold}
        isFullscreen={isFullscreen}
        onToggleHold={() => setIsHold(!isHold)}
        clickWheel={
          <ClickWheel
            theme={theme}
            onMenu={handleMenu}
            onSelect={handleSelect}
            onNext={handleNext}
            onPrev={handlePrev}
            onPlayPause={handlePlayPause}
            onRotateClockwise={handleRotateClockwise}
            onRotateCounterClockwise={handleRotateCounterClockwise}
          />
        }
      >
        {/* Top LCD Header */}
        <ScreenHeader
          title={currentScreen.title}
          playbackState={playbackState}
          batteryLevel={98}
        />

        {/* Dynamic Screen View */}
        {currentScreen.viewType === 'menu' && (
          <MenuView
            items={currentScreen.items || []}
            selectedIndex={currentScreen.selectedIndex}
            onSelectItem={(_item, idx) => {
              updateSelectedIndex(idx);
              handleSelect();
            }}
            playbackState={playbackState}
            showSplitPreview={true}
          />
        )}

        {currentScreen.viewType === 'now_playing' && (
          <NowPlayingView
            playbackState={playbackState}
            onToggleStar={handleSelect}
          />
        )}

        {currentScreen.viewType === 'cover_flow' && (
          <CoverFlowView
            albums={albumsCache}
            selectedIndex={currentScreen.selectedIndex}
            onSelectAlbum={(alb) => handleSelectAlbum(alb)}
          />
        )}

        {currentScreen.viewType === 'search' && (
          <SearchView
            selectedIndex={currentScreen.selectedIndex}
            onSelectSong={(s) => handlePlaySong(s, [s], 0)}
            onSelectAlbum={handleSelectAlbum}
            onSelectArtist={handleSelectArtist}
          />
        )}

        {currentScreen.viewType === 'settings' && (
          <SettingsView
            selectedIndex={currentScreen.selectedIndex}
            theme={theme}
            onThemeChange={setTheme}
            onNavigateToServerSettings={() => {
              pushScreen({
                id: 'server_settings',
                title: 'Server Settings',
                viewType: 'server_settings',
                selectedIndex: 0,
              });
            }}
            repeatMode={playbackState.repeatMode}
            isShuffle={playbackState.isShuffle}
            onToggleRepeat={() => audioEngine.toggleRepeat()}
            onToggleShuffle={() => audioEngine.toggleShuffle()}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        {currentScreen.viewType === 'server_settings' && (
          <ServerScreenView
            onSaved={() => {
              refreshLibraryData();
              setNavStack([
                {
                  id: 'main_menu',
                  title: 'iPod',
                  viewType: 'menu',
                  selectedIndex: 0,
                  items: [
                    { id: 'music', title: 'Music', icon: 'music', hasSubmenu: true },
                    { id: 'cover_flow', title: 'Cover Flow', icon: 'flow', hasSubmenu: true },
                    { id: 'now_playing', title: 'Now Playing', icon: 'music', hasSubmenu: true },
                    { id: 'search', title: 'Search', icon: 'search', hasSubmenu: true },
                    { id: 'settings', title: 'Settings', icon: 'settings', hasSubmenu: true },
                    { id: 'shuffle_songs', title: 'Shuffle Songs', icon: 'music', hasSubmenu: false },
                  ],
                },
              ]);
            }}
          />
        )}
      </IpodChassis>
    </div>
  );
};
