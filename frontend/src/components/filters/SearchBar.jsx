import React, { useContext, useEffect, useRef } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { FilterContext } from '../../context/FilterContext';
import { useSearch } from '../../hooks/useSearch';

export const SearchBar = ({ placeholder = "Search Ledgers..." }) => {
  const { filters, updateFilters } = useContext(FilterContext);
  const { value, setValue, debouncedValue } = useSearch(filters.search, 300);
  const inputRef = useRef(null);

  // Sync debounced search back to global filters
  useEffect(() => {
    updateFilters({ search: debouncedValue });
  }, [debouncedValue, updateFilters]);

  // Bind key shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dora-text-secondary">
        <RiSearchLine className="h-4 w-4 text-dora-cyan" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={
          "w-full pl-9 pr-12 py-1.5 rounded-lg bg-dora-card border border-dora-border text-dora-text text-xs placeholder-slate-500 " +
          "focus:outline-none focus:border-dora-cyan/70 focus:ring-1 focus:ring-dora-cyan/30 focus:shadow-neon-cyan/15 " +
          "transition-all duration-200 backdrop-blur-glass font-mono"
        }
      />
      {/* Keyboard Shortcut Indicator */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none select-none">
        <span className="text-[10px] bg-slate-900 border border-dora-border text-dora-text-secondary px-1.5 py-0.5 rounded font-mono uppercase">
          [ / ]
        </span>
      </div>
    </div>
  );
};
export default SearchBar;
