import React, { useEffect, useRef } from 'react';
import { ChevronRight, Music, Disc, Mic2, ListMusic, Settings, Search, Sparkles } from 'lucide-react';
import { MenuItem, PlaybackState } from '../../../types/subsonic';
import { subsonicApi } from '../../../services/subsonicApi';

interface MenuViewProps {
  items: MenuItem[];
  selectedIndex: number;
  onSelectItem: (item: MenuItem, index: number) => void;
  playbackState: PlaybackState;
  showSplitPreview?: boolean;
}

export const MenuView: React.FC<MenuViewProps> = ({
  items,
  selectedIndex,
  onSelectItem,
  playbackState,
  showSplitPreview = true,
}) => {
  const selectedRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll so selected row is always visible
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = selectedRef.current;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elemTop = element.offsetTop;
      const elemBottom = elemTop + element.clientHeight;

      if (elemTop < containerTop) {
        container.scrollTop = elemTop;
      } else if (elemBottom > containerBottom) {
        container.scrollTop = elemBottom - container.clientHeight;
      }
    }
  }, [selectedIndex]);

  const currentItem = items[selectedIndex];
  const previewCover = currentItem?.coverArt
    ? subsonicApi.getCoverArtUrl(currentItem.coverArt, 300)
    : playbackState.currentSong?.coverArt
    ? subsonicApi.getCoverArtUrl(playbackState.currentSong.coverArt, 300)
    : undefined;

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'music': return <Music className="w-3.5 h-3.5 mr-1 text-slate-500" />;
      case 'album': return <Disc className="w-3.5 h-3.5 mr-1 text-slate-500" />;
      case 'artist': return <Mic2 className="w-3.5 h-3.5 mr-1 text-slate-500" />;
      case 'playlist': return <ListMusic className="w-3.5 h-3.5 mr-1 text-slate-500" />;
      case 'settings': return <Settings className="w-3.5 h-3.5 mr-1 text-slate-500" />;
      case 'search': return <Search className="w-3.5 h-3.5 mr-1 text-slate-500" />;
      case 'flow': return <Sparkles className="w-3.5 h-3.5 mr-1 text-slate-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full bg-white">
      {/* Left Menu Column */}
      <div
        ref={containerRef}
        className={`h-full overflow-y-auto overflow-x-hidden ${
          showSplitPreview ? 'w-1/2 border-r border-slate-300' : 'w-full'
        } scrollbar-thin`}
      >
        {items.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 italic">
            No items found
          </div>
        ) : (
          items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.id || idx}
                ref={isSelected ? selectedRef : null}
                onClick={() => onSelectItem(item, idx)}
                className={`flex items-center justify-between px-2.5 py-1.5 cursor-pointer text-xs font-semibold select-none border-b border-slate-100 ${
                  isSelected
                    ? 'ipod-selected-row'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center min-w-0 flex-1 mr-1">
                  {!isSelected && getIcon(item.icon)}
                  <span className="truncate">{item.title}</span>
                </div>
                {item.hasSubmenu !== false && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Right Column: iPod Classic 5th/6th Gen artwork preview */}
      {showSplitPreview && (
        <div className="w-1/2 h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-50 to-slate-200 overflow-hidden relative">
          {previewCover ? (
            <div className="relative group flex flex-col items-center">
              <img
                src={previewCover}
                alt="Artwork Preview"
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded shadow-md border border-slate-300/80"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="mt-2 text-center max-w-[120px]">
                <div className="text-[11px] font-bold text-slate-800 truncate">
                  {currentItem?.title || playbackState.currentSong?.title}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentItem?.subtitle || playbackState.currentSong?.artist}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-300">
              <Disc className="w-16 h-16 stroke-[1.2]" />
              <span className="text-[10px] mt-2 font-medium text-slate-400">iPod Music</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
