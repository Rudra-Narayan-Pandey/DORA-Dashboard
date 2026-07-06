import React from 'react';
import { RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';

export const TableHeader = ({
  columns = [], // [{ key, label, sortable }]
  sortConfig = { key: null, direction: 'asc' }, // { key, direction: 'asc'|'desc' }
  onSort,
  className
}) => {
  return (
    <thead className={classNames("border-b border-dora-border/60 bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md", className)}>
      <tr>
        {columns.map((col) => {
          const isSorted = sortConfig.key === col.key;
          return (
            <th
              key={col.key}
              onClick={() => col.sortable && onSort && onSort(col.key)}
              className={classNames(
                "px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-dora-text-secondary select-none font-bold",
                col.sortable ? "cursor-pointer hover:text-dora-cyan hover:bg-slate-900/40 transition-colors" : ""
              )}
            >
              <div className="flex items-center gap-1">
                <span>{col.label}</span>
                {col.sortable && isSorted && (
                  <span>
                    {sortConfig.direction === 'asc' ? (
                      <RiArrowUpSLine className="w-3.5 h-3.5 text-dora-cyan" />
                    ) : (
                      <RiArrowDownSLine className="w-3.5 h-3.5 text-dora-cyan" />
                    )}
                  </span>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
export default TableHeader;
