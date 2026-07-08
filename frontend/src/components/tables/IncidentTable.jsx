import React, { useState } from 'react';
import { RiShieldCheckLine } from 'react-icons/ri';
import TableHeader from './TableHeader';
import TablePagination from './TablePagination';
import StatusBadge from './StatusBadge';
import Button from '../ui/Button';
import { formatDateTime } from '../../utils/formatDate';
import { formatDurationMinutes } from '../../utils/formatNumber';
import { classNames } from '../../utils/helpers';
import { showSuccessToast, showErrorToast } from '../feedback/ToastMessage';

export const IncidentTable = ({
  data = [],
  pagination = { total: 0, page: 1, limit: 5, pages: 1 },
  onPageChange,
  onResolve
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'detectedAt', direction: 'desc' });

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: 'Incident', sortable: true },
    { key: 'severity', label: 'Severity', sortable: true },
    { key: 'environment', label: 'Env', sortable: true },
    { key: 'pipeline', label: 'Service', sortable: true },
    { key: 'detectedAt', label: 'Detected At', sortable: true },
    { key: 'duration', label: 'MTTR', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleResolveAction = async (id) => {
    try {
      if (onResolve) {
        await onResolve(id);
        showSuccessToast(`Incident ${id} successfully resolved`);
      }
    } catch (err) {
      showErrorToast(`Failed to resolve incident: ${err.message}`);
    }
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
    
    if (sortConfig.key === 'detectedAt') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const getSeverityClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return 'text-dora-rose font-bold text-glow-rose bg-dora-rose/10 border-dora-rose/30';
      case 'major':
        return 'text-dora-yellow font-semibold bg-dora-yellow/10 border-dora-yellow/30';
      case 'minor':
      default:
        return 'text-dora-cyan bg-dora-cyan/10 border-dora-cyan/30';
    }
  };

  return (
    <div className="glass-panel w-full flex flex-col bg-slate-950/20 shadow-xl select-text">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[850px] border-collapse">
          <TableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          
          <tbody className="divide-y divide-dora-border/10 font-mono text-xs text-dora-text">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-dora-text-muted italic">
                  No active incidents recorded for the selected telemetry parameters.
                </td>
              </tr>
            ) : (
              sortedData.map((i) => (
                <tr 
                  key={i.id} 
                  className="hover:bg-slate-900/40 hover:text-dora-cyan transition-all duration-200 group border-b border-dora-border/5 last:border-b-0"
                >
                {/* ID */}
                <td className="px-5 py-3.5 font-bold text-dora-rose text-glow-rose">
                  {i.id}
                </td>
                
                {/* Title */}
                <td className="px-5 py-3.5 text-dora-text font-medium group-hover:text-dora-cyan transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span>{i.title}</span>
                    <span className="text-[10px] text-dora-text-muted font-normal max-w-[280px] truncate">
                      {i.description}
                    </span>
                  </div>
                </td>
                
                {/* Severity */}
                <td className="px-5 py-3.5">
                  <span className={classNames(
                    "text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold",
                    getSeverityClass(i.severity)
                  )}>
                    {i.severity}
                  </span>
                </td>
                
                {/* Environment */}
                <td className="px-5 py-3.5 font-bold text-dora-text-secondary">
                  {i.environment}
                </td>
                
                {/* Pipeline Service */}
                <td className="px-5 py-3.5 text-dora-text-secondary">
                  {i.pipeline}
                </td>
                
                {/* Detected At */}
                <td className="px-5 py-3.5 text-dora-text-muted">
                  {formatDateTime(i.detectedAt)}
                </td>
                
                {/* Duration / MTTR */}
                <td className="px-5 py-3.5 font-semibold text-dora-text-secondary">
                  {i.resolvedAt ? formatDurationMinutes(i.duration) : (
                    <span className="text-dora-rose animate-pulse">ACTIVE</span>
                  )}
                </td>
                
                {/* Status */}
                <td className="px-5 py-3.5">
                  <StatusBadge status={i.status} />
                </td>
                
                {/* Actions */}
                <td className="px-5 py-3.5">
                  {i.status !== 'resolved' ? (
                    <Button
                      variant="glow"
                      size="sm"
                      onClick={() => handleResolveAction(i.id)}
                      className="py-1 px-2.5 text-[9px] uppercase tracking-wider font-bold flex items-center gap-1"
                    >
                      <RiShieldCheckLine className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </Button>
                  ) : (
                    <span className="text-dora-text-muted text-[10px] uppercase font-mono flex items-center gap-1">
                      <RiShieldCheckLine className="w-3.5 h-3.5 text-dora-green" />
                      <span>Closed</span>
                    </span>
                  )}
                </td>
              </tr>
            )))}
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
export default IncidentTable;
