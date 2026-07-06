import React, { useContext } from 'react';
import { FilterContext } from '../../context/FilterContext';
import { PIPELINES } from '../../utils/constants';
import Select from '../ui/Select';

export const PipelineFilter = () => {
  const { filters, updateFilters } = useContext(FilterContext);

  const options = ['All', ...PIPELINES];

  return (
    <div className="min-w-[160px]">
      <Select
        value={filters.pipeline}
        onChange={(e) => updateFilters({ pipeline: e.target.value })}
        options={options}
        className="py-1.5 px-2.5 text-xs border-dora-border/60"
      />
    </div>
  );
};
export default PipelineFilter;
