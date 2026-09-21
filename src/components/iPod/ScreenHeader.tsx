import React from 'react';
import { Play, Pause, Star } from 'lucide-react';
import { PlaybackState } from '../../types/subsonic';

interface ScreenHeaderProps {
  title: string;
  playbackState: PlaybackState;
  batteryLevel?: number;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  playbackState,
  batteryLevel = 100,
}) => {
  const { isPlaying, currentSong } = playbackState;

  return (
    <div className="h-6 w-full ipod-header-gradient flex items-center justify-between px-2 text-[11px] font-bold text-slate-800 border-b border-slate-400 select-none shrink-0 z-20">
      {/* Left indicator: Play/Pause/Current status */}
      <div className="flex items-center space-x-1 w-1/4">
        {currentSong ? (
          isPlaying ? (
            <Play className="w-3 h-3 fill-slate-800 text-slate-800" />
          ) : (
            <Pause className="w-3 h-3 fill-slate-800 text-slate-800" />
          )
        ) : (
          <span className="text-[10px] font-semibold tracking-wider text-slate-600">iPod</span>
        )}
      </div>

      {/* Center title */}
      <div className="flex-1 text-center font-bold tracking-tight truncate px-1 text-slate-900 drop-shadow-sm">
        {title}
      </div>

      {/* Right indicator: Starred status & Battery */}
      <div className="flex items-center justify-end space-x-1.5 w-1/4">
        {currentSong?.starred && (
          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
        )}
        {/* Retro iPod Battery Icon */}
        <div className="flex items-center">
          <div className="w-4 h-2.5 border border-slate-700 rounded-sm p-[0.5px] bg-slate-100 flex items-center">
            <div
              className={`h-full rounded-[0.5px] ${
                batteryLevel > 20 ? 'bg-emerald-600' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, batteryLevel))}%` }}
            />
          </div>
          <div className="w-[1px] h-1 bg-slate-700 rounded-r-xs" />
        </div>
      </div>
    </div>
  );
};
