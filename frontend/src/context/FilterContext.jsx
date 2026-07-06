import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    dateRange: '7d',
    environment: 'All',
    pipeline: 'All',
    status: 'All',
    search: '',
  });

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: '7d',
      environment: 'All',
      pipeline: 'All',
      status: 'All',
      search: '',
    });
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};
