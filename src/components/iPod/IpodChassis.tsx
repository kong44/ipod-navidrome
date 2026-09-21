import React from 'react';
import { IpodTheme } from './ClickWheel';

interface IpodChassisProps {
  theme: IpodTheme;
  children: React.ReactNode;
  clickWheel: React.ReactNode;
  isHold?: boolean;
  onToggleHold?: () => void;
}

export const IpodChassis: React.FC<IpodChassisProps> = ({
  theme,
  children,
  clickWheel,
  isHold = false,
  onToggleHold,
}) => {
  const getChassisBg = () => {
    switch (theme) {
      case 'black':
        return 'bg-gradient-to-b from-neutral-800 via-neutral-900 to-black text-white sm:shadow-chassis-black sm:border-neutral-700';
      case 'u2':
        return 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white sm:shadow-chassis-black sm:border-neutral-800';
      case 'silver':
      default:
        return 'bg-gradient-to-b from-[#f2f4f7] via-[#e2e5ea] to-[#cfd3db] text-slate-900 sm:shadow-chassis-silver sm:border-slate-300';
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none overflow-hidden touch-none">
      {/* Top iPod Hardware Features: Hold Switch & Headphone Jack (visible on desktop or tablet) */}
      <div className="hidden sm:flex w-[320px] sm:w-[380px] items-center justify-between px-6 mb-[-6px] z-10 shrink-0">
        {/* Headphone Jack */}
        <div className="w-5 h-2.5 bg-neutral-900 rounded-t-full border border-neutral-600 shadow-inner flex items-center justify-center">
          <div className="w-2.5 h-1.5 bg-black rounded-full" />
        </div>

        {/* Hold Switch */}
        <div
          onClick={onToggleHold}
          className="cursor-pointer flex items-center bg-neutral-700 px-1 py-0.5 rounded-t-md border-t border-x border-neutral-500 shadow-sm"
          title="Hold Switch"
        >
          <span className="text-[8px] font-black text-neutral-400 mr-1.5 uppercase">Hold</span>
          <div className="w-6 h-2 bg-neutral-900 rounded-full p-[1px] flex items-center relative">
            <div
              className={`w-2.5 h-2 rounded-full transition-transform duration-150 ${
                isHold ? 'translate-x-3 bg-amber-500' : 'translate-x-0 bg-neutral-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Main iPod Launcher Body - Edge-to-edge on mobile, framed on desktop */}
      <div
        className={`w-full h-full sm:w-[380px] sm:h-[680px] sm:max-h-[95vh] sm:rounded-[44px] p-3 sm:p-5 flex flex-col justify-between sm:border relative overflow-hidden shrink-0 ${getChassisBg()}`}
        style={{
          boxShadow:
            theme === 'silver'
              ? '0 25px 60px -12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -4px 8px rgba(0,0,0,0.2)'
              : '0 30px 70px -12px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -4px 8px rgba(0,0,0,0.8)',
        }}
      >
        {/* Subtle Brushed Metal Texture Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none sm:rounded-[44px]" />

        {/* Mobile quick hold indicator bar */}
        <div className="sm:hidden flex items-center justify-between pb-1 px-1">
          <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">iPod Classic</span>
          <button
            onClick={onToggleHold}
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full transition-colors ${
              isHold ? 'bg-amber-500 text-black' : 'bg-black/10 text-slate-500'
            }`}
          >
            {isHold ? 'Hold Locked' : 'Hold'}
          </button>
        </div>

        {/* iPod Display Window */}
        <div className="w-full flex-1 max-h-[46dvh] sm:max-h-[290px] min-h-[200px] bg-black rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-screen-bezel relative shrink-0 flex flex-col">
          {/* Glass Reflection Arc */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-xl sm:rounded-t-2xl pointer-events-none z-30" />

          {/* Screen Content Container */}
          <div className="w-full h-full bg-white rounded-lg sm:rounded-xl overflow-hidden flex flex-col shadow-inner border border-slate-700 relative font-ipod">
            {children}
          </div>
        </div>

        {/* Click Wheel Area - Scales smoothly to available screen height */}
        <div className="flex-1 flex items-center justify-center py-2 sm:py-3 shrink-0">
          {clickWheel}
        </div>
      </div>
    </div>
  );
};
