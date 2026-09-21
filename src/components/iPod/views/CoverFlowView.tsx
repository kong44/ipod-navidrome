import React from 'react';
import { Album } from '../../../types/subsonic';
import { subsonicApi } from '../../../services/subsonicApi';
import { Disc } from 'lucide-react';

interface CoverFlowViewProps {
  albums: Album[];
  selectedIndex: number;
  onSelectAlbum: (album: Album) => void;
}

export const CoverFlowView: React.FC<CoverFlowViewProps> = ({
  albums,
  selectedIndex,
  onSelectAlbum,
}) => {
  if (!albums || albums.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black text-white p-4">
        <Disc className="w-12 h-12 text-slate-500 animate-spin-slow mb-2" />
        <span className="text-xs font-semibold text-slate-400">Loading Cover Flow...</span>
      </div>
    );
  }

  const currentAlbum = albums[selectedIndex] || albums[0];

  return (
    <div className="flex-1 flex flex-col justify-between bg-neutral-950 text-white select-none relative overflow-hidden">
      {/* 3D Stage */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden coverflow-stage">
        <div className="relative w-full h-full flex items-center justify-center">
          {albums.map((album, idx) => {
            const offset = idx - selectedIndex;
            // Only render visible neighborhood for performance and clean aesthetic
            if (Math.abs(offset) > 4) return null;

            let transform = '';
            let zIndex = 10 - Math.abs(offset);
            let opacity = 1;

            if (offset === 0) {
              transform = 'translateX(0px) translateZ(80px) rotateY(0deg) scale(1.1)';
            } else if (offset < 0) {
              const distance = Math.max(offset, -3);
              transform = `translateX(${distance * 40 - 50}px) translateZ(${distance * 25}px) rotateY(55deg) scale(0.85)`;
              opacity = Math.max(0.3, 1 - Math.abs(offset) * 0.2);
            } else {
              const distance = Math.min(offset, 3);
              transform = `translateX(${distance * 40 + 50}px) translateZ(${-distance * 25}px) rotateY(-55deg) scale(0.85)`;
              opacity = Math.max(0.3, 1 - Math.abs(offset) * 0.2);
            }

            const coverUrl = subsonicApi.getCoverArtUrl(album.coverArt, 300);

            return (
              <div
                key={album.id || idx}
                onClick={() => onSelectAlbum(album)}
                className="absolute w-24 h-24 sm:w-28 sm:h-28 transition-all duration-300 ease-out cursor-pointer"
                style={{
                  transform,
                  zIndex,
                  opacity,
                }}
              >
                {/* Album Cover Tile with Reflection */}
                <div className="w-full h-full bg-neutral-800 rounded border border-neutral-700/80 shadow-2xl overflow-hidden relative cover-reflection">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={album.name}
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 p-1 text-center">
                      <Disc className="w-8 h-8 text-neutral-500 mb-1" />
                      <span className="text-[8px] text-neutral-400 font-semibold truncate w-full">
                        {album.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Album Info Bar at Bottom */}
      <div className="h-10 bg-neutral-900/90 border-t border-neutral-800 flex flex-col items-center justify-center px-4 py-1 text-center z-20">
        <div className="text-xs font-bold text-white truncate max-w-full drop-shadow">
          {currentAlbum?.name}
        </div>
        <div className="text-[10px] text-neutral-400 font-medium truncate max-w-full">
          {currentAlbum?.artist} {currentAlbum?.year ? `(${currentAlbum.year})` : ''}
        </div>
      </div>
    </div>
  );
};
