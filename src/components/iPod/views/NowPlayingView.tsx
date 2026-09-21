import React from 'react';
import { Volume2, Shuffle, Repeat, Disc, Star } from 'lucide-react';
import { PlaybackState } from '../../../types/subsonic';
import { subsonicApi } from '../../../services/subsonicApi';

interface NowPlayingViewProps {
  playbackState: PlaybackState;
  onToggleStar?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  playbackState,
  onToggleStar,
}) => {
  const {
    currentSong,
    currentTime,
    duration,
    volume,
    showVolumeHud,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
  } = playbackState;

  if (!currentSong) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-4 text-center">
        <Disc className="w-16 h-16 text-slate-300 animate-spin-slow mb-2" />
        <span className="text-sm font-bold text-slate-700">No Song Playing</span>
        <span className="text-xs text-slate-400 mt-1">Select a track from the Music menu</span>
      </div>
    );
  }

  const effectiveDuration = duration || currentSong.duration || 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));
  const remainingTime = Math.max(0, effectiveDuration - currentTime);
  const coverUrl = subsonicApi.getCoverArtUrl(currentSong.coverArt, 400);

  return (
    <div className="flex-1 flex flex-col justify-between bg-white px-3 py-2 select-none relative overflow-hidden">
      {/* Top Track info banner */}
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 border-b border-slate-100 pb-1">
        <span>
          {queueIndex >= 0 ? `${queueIndex + 1} of ${queue.length || 1}` : 'Now Playing'}
        </span>
        <div className="flex items-center space-x-2">
          {isShuffle && <Shuffle className="w-3 h-3 text-slate-700" />}
          {repeatMode !== 'off' && (
            <span className="flex items-center text-[9px] font-bold text-slate-700">
              <Repeat className="w-3 h-3 mr-0.5" />
              {repeatMode === 'one' && '1'}
            </span>
          )}
          <button
            onClick={onToggleStar}
            className="hover:scale-110 transition-transform"
            title="Star track"
          >
            <Star
              className={`w-3 h-3 ${
                currentSong.starred
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-slate-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Content: Album Cover + Song Meta */}
      <div className="flex items-center my-auto space-x-3">
        {/* Cover Art */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-slate-100 rounded shadow-md border border-slate-300 overflow-hidden flex items-center justify-center">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={currentSong.album}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Disc className="w-12 h-12 text-slate-400" />
          )}
        </div>

        {/* Track Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
          <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate drop-shadow-xs">
            {currentSong.title}
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-700 truncate">
            {currentSong.artist}
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">
            {currentSong.album}
          </div>
          {currentSong.year && (
            <div className="text-[9px] text-slate-400">
              {currentSong.year} {currentSong.genre ? `• ${currentSong.genre}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timeline Scrubber */}
      <div className="w-full pt-1 pb-1">
        {/* Progress Bar */}
        <div className="relative w-full h-2.5 bg-slate-200 border border-slate-400 rounded-xs overflow-hidden shadow-inner flex items-center">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Diamond scrubber head */}
          <div
            className="absolute w-2 h-3.5 bg-gradient-to-b from-white to-slate-300 border border-slate-600 shadow-sm transform -translate-x-1/2 pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Timestamps */}
        <div className="flex justify-between text-[10px] font-bold text-slate-600 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(remainingTime)}</span>
        </div>
      </div>

      {/* Volume Overlay HUD popup when rotating wheel in Now Playing */}
      {showVolumeHud && (
        <div className="absolute inset-x-4 top-1/2 transform -translate-y-1/2 bg-slate-900/90 backdrop-blur-sm text-white rounded-lg p-3 shadow-xl border border-slate-700 flex flex-col items-center justify-center animate-fade-in z-30">
          <div className="flex items-center space-x-2 w-full">
            <Volume2 className="w-4 h-4 text-slate-300 shrink-0" />
            <div className="flex-1 h-3 bg-slate-700 rounded-sm overflow-hidden border border-slate-600 p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-xs"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-300 mt-1.5">
            Volume {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
