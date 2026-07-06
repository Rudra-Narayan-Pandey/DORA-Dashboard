import React, { useState } from 'react';
import { RiFileCopyLine, RiCheckLine } from 'react-icons/ri';
import TableHeader from './TableHeader';
import TablePagination from './TablePagination';
import StatusBadge from './StatusBadge';
import { formatDateTime } from '../../utils/formatDate';
import { formatDurationSeconds } from '../../utils/formatNumber';
import { classNames } from '../../utils/helpers';
import { showSuccessToast } from '../feedback/ToastMessage';

export const DeploymentTable = ({
  data = [],
  pagination = { total: 0, page: 1, limit: 5, pages: 1 },
  onPageChange,
  loading
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [copiedId, setCopiedId] = useState(null);

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'pipeline', label: 'Pipeline', sortable: true },
    { key: 'environment', label: 'Environment', sortable: true },
    { key: 'triggeredBy', label: 'Operator', sortable: true },
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    { key: 'duration', label: 'Duration', sortable: true },
    { key: 'commit', label: 'Commit', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const copyToClipboard = (commit, id) => {
    navigator.clipboard.writeText(commit);
    setCopiedId(id);
    showSuccessToast(`Commit ${commit} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Local sorting
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (typeof aVal === 'string') {
      return sortConfig.direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    // Numbers/Dates
    if (sortConfig.key === 'timestamp') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="glass-panel w-full flex flex-col bg-slate-950/20 shadow-xl select-text">
      {/* Scrollable table container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[800px] border-collapse">
          <TableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          
          <tbody className="divide-y divide-dora-border/10 font-mono text-xs text-dora-text">
            {sortedData.map((d) => (
              <tr 
                key={d.id} 
                className="hover:bg-slate-900/40 hover:text-dora-cyan transition-all duration-200 group border-b border-dora-border/5 last:border-b-0"
              >
                {/* ID */}
                <td className="px-5 py-3.5 font-bold text-dora-cyan text-glow-cyan">
                  {d.id}
                </td>
                
                {/* Pipeline */}
                <td className="px-5 py-3.5 text-dora-text font-medium group-hover:text-dora-cyan transition-colors">
                  {d.pipeline}
                </td>
                
                {/* Environment */}
                <td className="px-5 py-3.5">
                  <span className={classNames(
                    "text-[10px] uppercase font-bold tracking-wider",
                    d.environment === 'Production' ? 'text-dora-violet' : d.environment === 'Canary' ? 'text-dora-cyan' : 'text-dora-text-secondary'
                  )}>
                    {d.environment}
                  </span>
                </td>
                
                {/* Operator */}
                <td className="px-5 py-3.5 text-dora-text-secondary">
                  {d.triggeredBy}
                </td>
                
                {/* Timestamp */}
                <td className="px-5 py-3.5 text-dora-text-muted">
                  {formatDateTime(d.timestamp)}
                </td>
                
                {/* Duration */}
                <td className="px-5 py-3.5 font-mono text-dora-text-secondary">
                  {formatDurationSeconds(d.duration)}
                </td>
                
                {/* Commit */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <span className="bg-slate-900 border border-dora-border/20 px-1.5 py-0.5 rounded text-[10px] text-dora-text-secondary">
                      {d.commit}
                    </span>
                    <button
                      onClick={() => copyToClipboard(d.commit, d.id)}
                      className="p-1 rounded text-dora-text-muted hover:text-dora-cyan hover:bg-slate-800 transition-colors"
                      title="Copy Commit SHA"
                    >
                      {copiedId === d.id ? <RiCheckLine className="w-3.5 h-3.5 text-dora-green" /> : <RiFileCopyLine className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                
                {/* Status */}
                <td className="px-5 py-3.5">
                  <StatusBadge status={d.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={onPageChange}
      />
    </div>
  );
};
export default DeploymentTable;
