import React from 'react';
import { IpodTheme } from '../ClickWheel';
import { RepeatMode } from '../../../types/subsonic';
import { subsonicApi } from '../../../services/subsonicApi';
import { soundEffects } from '../../../services/soundEffects';

interface SettingsViewProps {
  selectedIndex: number;
  theme: IpodTheme;
  onThemeChange: (theme: IpodTheme) => void;
  onNavigateToServerSettings: () => void;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  selectedIndex,
  theme,
  onThemeChange,
  onNavigateToServerSettings,
  repeatMode,
  isShuffle,
  onToggleRepeat,
  onToggleShuffle,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const config = subsonicApi.getConfig();
  const isSoundEnabled = soundEffects.getEnabled();

  const handleToggleSound = () => {
    soundEffects.setEnabled(!isSoundEnabled);
  };

  const cycleTheme = () => {
    const themes: IpodTheme[] = ['silver', 'black', 'u2'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    onThemeChange(themes[nextIdx]);
  };

  const settingsItems = [
    {
      id: 'server',
      label: 'Navidrome Server',
      value: config.isDemoMode ? 'Demo Mode' : config.serverUrl ? 'Connected' : 'Configure',
      action: onNavigateToServerSettings,
    },
    {
      id: 'theme',
      label: 'Body Theme',
      value: theme === 'silver' ? 'Classic Silver' : theme === 'black' ? 'Space Black' : 'U2 Edition',
      action: cycleTheme,
    },
    {
      id: 'fullscreen',
      label: 'Full Screen',
      value: isFullscreen ? 'On' : 'Off',
      action: onToggleFullscreen,
    },
    {
      id: 'sound',
      label: 'Wheel Clicker',
      value: isSoundEnabled ? 'On' : 'Off',
      action: handleToggleSound,
    },
    {
      id: 'shuffle',
      label: 'Shuffle',
      value: isShuffle ? 'Songs' : 'Off',
      action: onToggleShuffle,
    },
    {
      id: 'repeat',
      label: 'Repeat',
      value: repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'All' : 'One',
      action: onToggleRepeat,
    },
    {
      id: 'backlight',
      label: 'Backlight Timer',
      value: 'Always On',
      action: () => {},
    },
    {
      id: 'about',
      label: 'About',
      value: 'iPod Classic v1.1',
      action: () => {},
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto scrollbar-thin text-slate-800">
      {settingsItems.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <div
            key={item.id}
            onClick={item.action}
            className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-slate-100 text-xs font-semibold ${
              isSelected ? 'ipod-selected-row' : 'hover:bg-slate-50'
            }`}
          >
            <span className="truncate">{item.label}</span>
            <span
              className={`text-[11px] font-medium ml-2 ${
                isSelected ? 'text-white' : 'text-slate-500'
              }`}
            >
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
