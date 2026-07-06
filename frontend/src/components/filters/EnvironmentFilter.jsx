import React, { useContext } from 'react';
import { FilterContext } from '../../context/FilterContext';
import { ENVIRONMENTS } from '../../utils/constants';
import Select from '../ui/Select';

export const EnvironmentFilter = () => {
  const { filters, updateFilters } = useContext(FilterContext);

  const options = ['All', ...Object.values(ENVIRONMENTS)];

  return (
    <div className="min-w-[140px]">
      <Select
        value={filters.environment}
        onChange={(e) => updateFilters({ environment: e.target.value })}
        options={options}
        className="py-1.5 px-2.5 text-xs border-dora-border/60"
      />
    </div>
  );
};
export default EnvironmentFilter;
