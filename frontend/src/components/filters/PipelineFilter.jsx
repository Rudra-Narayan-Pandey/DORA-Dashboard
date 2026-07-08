import React, { useContext, useEffect, useState } from 'react';
import { FilterContext } from '../../context/FilterContext';
import Select from '../ui/Select';
import { getPipelines } from '../../services/pipelineService';

export const PipelineFilter = () => {
  const { filters, updateFilters } = useContext(FilterContext);
  const [pipelines, setPipelines] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getPipelines()
      .then((items) => {
        if (!cancelled) setPipelines(items);
      })
      .catch(() => {
        if (!cancelled) setPipelines([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = [
    { label: 'All', value: 'All' },
    ...pipelines.map((pipeline) => ({
      label: pipeline.displayName || pipeline.name,
      value: pipeline.name
    }))
  ];

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
