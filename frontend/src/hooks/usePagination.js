import { useState } from 'react';

export const usePagination = (initialPage = 1, totalPages = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const goToPage = (pageNumber) => {
    const page = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    currentPage,
    setCurrentPage,
    goToPage,
    nextPage,
    prevPage,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages
  };
};
export default usePagination;
