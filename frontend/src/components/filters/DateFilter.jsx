import React, { useContext } from 'react';
import { FilterContext } from '../../context/FilterContext';
import { DATE_RANGES } from '../../utils/constants';
import { classNames } from '../../utils/helpers';

export const DateFilter = () => {
  const { filters, updateFilters } = useContext(FilterContext);

  const ranges = [
    { value: DATE_RANGES.LAST_7D, label: '7 Days' },
    { value: DATE_RANGES.LAST_30D, label: '30 Days' },
    { value: DATE_RANGES.LAST_90D, label: '90 Days' },
    { value: DATE_RANGES.ALL, label: 'All History' }
  ];

  return (
    <div className="inline-flex rounded-lg border border-dora-border p-0.5 bg-slate-950/40 backdrop-blur-glass">
      {ranges.map((r) => {
        const active = filters.dateRange === r.value;
        return (
          <button
            key={r.value}
            onClick={() => updateFilters({ dateRange: r.value })}
            className={classNames(
              "px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-md transition-all duration-200",
              active 
                ? "bg-dora-cyan/20 border border-dora-cyan/30 text-dora-cyan shadow-neon-cyan/15 text-glow-cyan" 
                : "text-dora-text-secondary hover:text-dora-text border border-transparent"
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
};
export default DateFilter;
