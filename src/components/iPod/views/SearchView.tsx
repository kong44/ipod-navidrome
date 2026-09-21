import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Music, Disc, Mic2, X } from 'lucide-react';
import { SearchResult, Song, Album, Artist } from '../../../types/subsonic';
import { subsonicApi } from '../../../services/subsonicApi';

interface SearchViewProps {
  onSelectSong: (song: Song) => void;
  onSelectAlbum: (album: Album) => void;
  onSelectArtist: (artist: Artist) => void;
  selectedIndex: number;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSelectSong,
  onSelectAlbum,
  onSelectArtist,
  selectedIndex,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ artists: [], albums: [], songs: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ artists: [], albums: [], songs: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await subsonicApi.search(query);
        setResults(res);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Flattened results for wheel navigation
  const flatItems: Array<{ type: 'artist' | 'album' | 'song'; data: any }> = [
    ...results.artists.map((a) => ({ type: 'artist' as const, data: a })),
    ...results.albums.map((a) => ({ type: 'album' as const, data: a })),
    ...results.songs.map((s) => ({ type: 'song' as const, data: s })),
  ];

  const handleItemClick = (item: { type: 'artist' | 'album' | 'song'; data: any }) => {
    if (item.type === 'song') onSelectSong(item.data);
    else if (item.type === 'album') onSelectAlbum(item.data);
    else if (item.type === 'artist') onSelectArtist(item.data);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden text-slate-800">
      {/* Search Input Box */}
      <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center">
        <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-md px-2 py-1 shadow-inner">
          <SearchIcon className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artists, songs..."
            className="w-full text-xs outline-none bg-transparent text-slate-900 placeholder-slate-400"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-400">Searching Navidrome...</div>
        ) : flatItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 italic">
            {query.trim() ? 'No matching tracks or artists' : 'Type to search library'}
          </div>
        ) : (
          flatItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={`${item.type}-${item.data.id || idx}`}
                onClick={() => handleItemClick(item)}
                className={`flex items-center px-3 py-1.5 cursor-pointer border-b border-slate-100 text-xs ${
                  isSelected ? 'ipod-selected-row font-bold' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                {item.type === 'artist' && <Mic2 className="w-3.5 h-3.5 mr-2 shrink-0 opacity-70" />}
                {item.type === 'album' && <Disc className="w-3.5 h-3.5 mr-2 shrink-0 opacity-70" />}
                {item.type === 'song' && <Music className="w-3.5 h-3.5 mr-2 shrink-0 opacity-70" />}
                
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">
                    {item.type === 'song' ? item.data.title : item.type === 'album' ? item.data.name : item.data.name}
                  </div>
                  {item.type !== 'artist' && (
                    <div className="text-[10px] opacity-75 truncate">
                      {item.data.artist} {item.type === 'song' ? `• ${item.data.album}` : ''}
                    </div>
                  )}
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60 ml-2 px-1 rounded bg-black/5">
                  {item.type}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
