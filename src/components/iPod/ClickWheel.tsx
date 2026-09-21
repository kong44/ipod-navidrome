import React from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useClickWheel } from '../../hooks/useClickWheel';
import { soundEffects } from '../../services/soundEffects';

export type IpodTheme = 'silver' | 'black' | 'u2';

interface ClickWheelProps {
  theme: IpodTheme;
  onMenu: () => void;
  onSelect: () => void;
  onNext: () => void;
  onPrev: () => void;
  onPlayPause: () => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
}

export const ClickWheel: React.FC<ClickWheelProps> = ({
  theme,
  onMenu,
  onSelect,
  onNext,
  onPrev,
  onPlayPause,
  onRotateClockwise,
  onRotateCounterClockwise,
}) => {
  const { wheelRef, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel } =
    useClickWheel({
      onRotateClockwise,
      onRotateCounterClockwise,
      sensitivityDegrees: 18,
    });

  const getWheelClass = () => {
    switch (theme) {
      case 'black':
        return 'click-wheel-dark text-slate-400';
      case 'u2':
        return 'click-wheel-u2 text-black';
      case 'silver':
      default:
        return 'click-wheel-surface text-slate-500';
    }
  };

  const getCenterButtonClass = () => {
    switch (theme) {
      case 'black':
      case 'u2':
        return 'center-button-dark border-neutral-700/80 active:brightness-90';
      case 'silver':
      default:
        return 'center-button border-slate-300/80 active:brightness-95';
    }
  };

  const handleButtonClick = (action: () => void) => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    soundEffects.playButtonPress();
    action();
  };

  return (
    <div className="relative flex items-center justify-center my-auto select-none touch-none">
      {/* Outer Click Wheel */}
      <div
        ref={wheelRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={`w-[min(54vw,220px)] h-[min(54vw,220px)] sm:w-56 sm:h-56 rounded-full flex items-center justify-center relative cursor-grab active:cursor-grabbing border border-black/10 select-none touch-none ${getWheelClass()}`}
      >
        {/* Top: MENU */}
        <button
          onClick={handleButtonClick(onMenu)}
          className="absolute top-2 sm:top-2.5 px-5 py-1 text-xs sm:text-xs font-black tracking-wider hover:opacity-80 active:scale-95 transition-transform touch-manipulation"
        >
          MENU
        </button>

        {/* Right: NEXT */}
        <button
          onClick={handleButtonClick(onNext)}
          className="absolute right-2 sm:right-2.5 p-2 hover:opacity-80 active:scale-95 transition-transform touch-manipulation"
        >
          <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
        </button>

        {/* Left: PREV */}
        <button
          onClick={handleButtonClick(onPrev)}
          className="absolute left-2 sm:left-2.5 p-2 hover:opacity-80 active:scale-95 transition-transform touch-manipulation"
        >
          <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
        </button>

        {/* Bottom: PLAY / PAUSE */}
        <button
          onClick={handleButtonClick(onPlayPause)}
          className="absolute bottom-2 sm:bottom-2.5 p-2 flex items-center space-x-0.5 hover:opacity-80 active:scale-95 transition-transform touch-manipulation"
        >
          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
        </button>

        {/* Center Select Button */}
        <button
          data-center-button="true"
          onClick={handleButtonClick(onSelect)}
          className={`w-[min(21vw,86px)] h-[min(21vw,86px)] sm:w-22 sm:h-22 rounded-full border shadow-md flex items-center justify-center transition-transform active:scale-[0.97] touch-manipulation ${getCenterButtonClass()}`}
          title="Select"
        >
          <div className="w-full h-full rounded-full flex items-center justify-center opacity-0 hover:opacity-10 transition-opacity bg-black" />
        </button>
      </div>
    </div>
  );
};
