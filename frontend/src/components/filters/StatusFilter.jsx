import React, { useContext } from 'react';
import { FilterContext } from '../../context/FilterContext';
import Select from '../ui/Select';

export const StatusFilter = ({ type = 'deployment' }) => {
  const { filters, updateFilters } = useContext(FilterContext);

  const deploymentStatuses = ['All', 'Success', 'Failed', 'Rolling_Back', 'In_Progress'];
  const incidentStatuses = ['All', 'Resolved', 'Investigating'];

  const options = type === 'incident' ? incidentStatuses : deploymentStatuses;

  return (
    <div className="min-w-[130px]">
      <Select
        value={filters.status}
        onChange={(e) => updateFilters({ status: e.target.value })}
        options={options}
        className="py-1.5 px-2.5 text-xs border-dora-border/60"
      />
    </div>
  );
};
export default StatusFilter;
