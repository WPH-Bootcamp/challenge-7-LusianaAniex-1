import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search restaurants, food and drink',
}) => {
  return (
    <div className='flex items-center bg-white rounded-full px-4 py-2 md:px-6 md:py-3 w-full md:max-w-2xl mx-auto h-12 md:h-auto'>
      <Search className='w-5 h-5 md:w-5 md:h-5 text-gray-500 mr-1.5 md:mr-3' />
      <input
        type='text'
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className='flex-1 text-gray-600 placeholder-gray-500 outline-none text-sm md:text-md-regular font-nunito font-normal leading-7 tracking-[-0.02em]'
      />
    </div>
  );
};

export default SearchBar;
