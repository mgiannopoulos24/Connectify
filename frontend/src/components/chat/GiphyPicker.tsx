import React, { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid, IGif } from '@giphy/react-components';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY || '');

interface GiphyPickerProps {
  onGifClick: (gif: IGif, e: React.SyntheticEvent<HTMLElement>) => void;
}

const GiphyPicker: React.FC<GiphyPickerProps> = ({ onGifClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchGifs = (offset: number) => {
    if (debouncedSearchTerm) {
      return gf.search(debouncedSearchTerm, { offset, limit: 10 });
    }
    return gf.trending({ offset, limit: 10 });
  };

  return (
    <div className="flex flex-col h-80">
      <div className="p-2">
        <Input
          placeholder="Search for GIFs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <Grid
          key={debouncedSearchTerm}
          onGifClick={onGifClick}
          fetchGifs={fetchGifs}
          width={320}
          columns={3}
          gutter={6}
        />
      </div>
    </div>
  );
};

export default GiphyPicker;
