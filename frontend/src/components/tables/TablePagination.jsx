import React from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import Button from '../ui/Button';

export const TablePagination = ({
  page = 1,
  pages = 1,
  total = 0,
  limit = 5,
  onPageChange
}) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-dora-border/20 px-5 py-3 bg-slate-950/30 backdrop-blur-sm rounded-b-xl select-none">
      {/* Current Records range text */}
      <span className="text-[10px] font-mono text-dora-text-muted">
        Records <span className="text-dora-cyan font-bold">{total > 0 ? start : 0} - {end}</span> of <span className="text-dora-text-secondary font-bold">{total}</span>
      </span>

      {/* Prev/Next Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange && onPageChange(page - 1)}
          className="p-1 px-2 text-[10px] flex items-center gap-1 uppercase tracking-wider"
        >
          <RiArrowLeftSLine className="w-3.5 h-3.5" />
          <span>Prev</span>
        </Button>
        <span className="text-[10px] font-mono text-dora-text-secondary uppercase tracking-wider px-2">
          Page {page} / {pages || 1}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange && onPageChange(page + 1)}
          className="p-1 px-2 text-[10px] flex items-center gap-1 uppercase tracking-wider"
        >
          <span>Next</span>
          <RiArrowRightSLine className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
export default TablePagination;
