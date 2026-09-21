import React from 'react';
import { IpodTheme } from './ClickWheel';

interface IpodChassisProps {
  theme: IpodTheme;
  children: React.ReactNode;
  clickWheel: React.ReactNode;
  isHold?: boolean;
  onToggleHold?: () => void;
  isFullscreen?: boolean;
}

export const IpodChassis: React.FC<IpodChassisProps> = ({
  theme,
  children,
  clickWheel,
  isHold = false,
  onToggleHold,
  isFullscreen = false,
}) => {
  const getChassisBg = () => {
    switch (theme) {
      case 'black':
        return `bg-gradient-to-b from-neutral-800 via-neutral-900 to-black text-white ${
          isFullscreen ? '' : 'shadow-chassis-black border border-neutral-700/80'
        }`;
      case 'u2':
        return `bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white ${
          isFullscreen ? '' : 'shadow-chassis-black border border-neutral-800/80'
        }`;
      case 'silver':
      default:
        return `bg-gradient-to-b from-[#f5f7fa] via-[#e4e7ec] to-[#cfd4dc] text-slate-900 ${
          isFullscreen ? '' : 'shadow-chassis-silver border border-slate-300/80'
        }`;
    }
  };

  if (isFullscreen) {
    return (
      <div
        className={`w-full h-full fixed inset-0 flex flex-col justify-between select-none overflow-hidden touch-none p-3 pb-6 pt-[max(calc(env(safe-area-inset-top,0px)+32px),58px)] ${getChassisBg()}`}
      >
        {/* Fullscreen Mobile iPod Display */}
        <div className="w-full flex-1 max-h-[48dvh] min-h-[220px] bg-black rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-screen-bezel relative shrink-0 flex flex-col">
          {/* Glass Reflection Arc */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-xl sm:rounded-t-2xl pointer-events-none z-30" />

          {/* Screen Content Container */}
          <div className="w-full h-full bg-white rounded-lg sm:rounded-xl overflow-hidden flex flex-col shadow-inner border border-slate-700 relative font-ipod">
            {children}
          </div>
        </div>

        {/* Fullscreen Click Wheel Area */}
        <div className="w-full flex-1 flex items-center justify-center my-auto py-2">
          {clickWheel}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none overflow-hidden touch-none p-2 sm:p-4">
      {/* Cohesive iPod Device Container (Normal Mode) */}
      <div className="flex flex-col items-center shrink-0 my-auto">
        {/* Top iPod Hardware Features: Hold Switch & Headphone Jack */}
        <div className="w-[290px] sm:w-[330px] flex items-center justify-between px-5 -mb-[1px] z-10 shrink-0">
          {/* Headphone Jack */}
          <div className="w-5 h-2.5 bg-neutral-900 rounded-t-full border border-neutral-600 shadow-inner flex items-center justify-center">
            <div className="w-2.5 h-1.5 bg-black rounded-full" />
          </div>

          {/* Hold Switch */}
          <div
            onClick={onToggleHold}
            className="cursor-pointer flex items-center bg-neutral-700 px-1.5 py-0.5 rounded-t-md border-t border-x border-neutral-500 shadow-sm transition-transform active:scale-95"
            title="Hold Switch"
          >
            <span className="text-[8px] font-black text-neutral-300 mr-1.5 uppercase tracking-wider">Hold</span>
            <div className="w-6 h-2 bg-neutral-900 rounded-full p-[1px] flex items-center relative">
              <div
                className={`w-2.5 h-2 rounded-full transition-transform duration-150 ${
                  isHold ? 'translate-x-3 bg-amber-500' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Main Realistic iPod Unit Body */}
        <div
          className={`w-[310px] sm:w-[350px] h-[550px] sm:h-[590px] rounded-[36px] sm:rounded-[40px] p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden shrink-0 transition-all duration-300 ${getChassisBg()}`}
          style={{
            boxShadow:
              theme === 'silver'
                ? '0 25px 60px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -4px 8px rgba(0,0,0,0.25)'
                : '0 30px 70px -12px rgba(0, 0, 0, 0.85), inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -4px 8px rgba(0,0,0,0.85)',
          }}
        >
          {/* Subtle Brushed Metal Texture Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none rounded-[36px] sm:rounded-[40px]" />

          {/* iPod Display Window */}
          <div className="w-full h-[205px] sm:h-[230px] bg-black rounded-xl p-2 sm:p-2.5 shadow-screen-bezel relative shrink-0 flex flex-col">
            {/* Glass Reflection Arc */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-xl pointer-events-none z-30" />

            {/* Screen Content Container */}
            <div className="w-full h-full bg-white rounded-lg overflow-hidden flex flex-col shadow-inner border border-slate-700 relative font-ipod">
              {children}
            </div>
          </div>

          {/* Click Wheel Area */}
          <div className="flex-1 flex items-center justify-center my-auto py-2">
            {clickWheel}
          </div>
        </div>
      </div>
    </div>
  );
};
