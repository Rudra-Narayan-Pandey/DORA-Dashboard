import React, { useState } from 'react';
import TableHeader from './TableHeader';
import TablePagination from './TablePagination';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDateTime } from '../../utils/formatDate';
import { classNames } from '../../utils/helpers';

export const WorkItemTable = ({
  data = [],
  pagination = { total: 0, page: 1, limit: 5, pages: 1 },
  onPageChange
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: 'Work Item', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'assignee', label: 'Assignee', sortable: false },
    { key: 'timestamp', label: 'Created At', sortable: true },
    { key: 'leadTime', label: 'Cycle Time', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
    
    if (sortConfig.key === 'timestamp') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const getTypeBadgeVariant = (type) => {
    switch (type?.toLowerCase()) {
      case 'feature':
        return 'info';
      case 'bug':
        return 'danger';
      case 'security':
        return 'warning';
      case 'chore':
      default:
        return 'default';
    }
  };

  const getPriorityColor = (pri) => {
    switch (pri?.toLowerCase()) {
      case 'high':
        return 'text-dora-rose font-bold text-glow-rose';
      case 'medium':
        return 'text-dora-yellow font-semibold';
      case 'low':
      default:
        return 'text-dora-text-secondary';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'done':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'todo':
        return 'warning';
      case 'backlog':
      default:
        return 'default';
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
            {sortedData.map((w) => (
              <tr 
                key={w.id} 
                className="hover:bg-slate-900/40 hover:text-dora-cyan transition-all duration-200 group border-b border-dora-border/5 last:border-b-0"
              >
                {/* ID */}
                <td className="px-5 py-3.5 font-bold text-dora-cyan text-glow-cyan">
                  {w.id}
                </td>
                
                {/* Title */}
                <td className="px-5 py-3.5 text-dora-text font-medium group-hover:text-dora-cyan transition-colors">
                  {w.title}
                </td>
                
                {/* Type */}
                <td className="px-5 py-3.5">
                  <Badge variant={getTypeBadgeVariant(w.type)}>
                    {w.type}
                  </Badge>
                </td>
                
                {/* Priority */}
                <td className="px-5 py-3.5">
                  <span className={classNames(
                    "text-[10px] uppercase font-mono tracking-wider",
                    getPriorityColor(w.priority)
                  )}>
                    {w.priority}
                  </span>
                </td>
                
                {/* Assignee Avatar */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar 
                      initials={w.assignee.split(' ').map(n=>n[0]).join('')} 
                      size="sm" 
                      status={null} 
                    />
                    <span className="text-dora-text-secondary">{w.assignee}</span>
                  </div>
                </td>
                
                {/* Created At */}
                <td className="px-5 py-3.5 text-dora-text-muted">
                  {formatDateTime(w.timestamp)}
                </td>
                
                {/* Lead Time / Cycle Time */}
                <td className="px-5 py-3.5 text-dora-text-secondary">
                  {w.leadTime ? `${w.leadTime} hrs` : (
                    <span className="text-dora-text-muted italic">[ Pending ]</span>
                  )}
                </td>
                
                {/* Status */}
                <td className="px-5 py-3.5">
                  <Badge variant={getStatusBadgeVariant(w.status)} glow={w.status === 'done'}>
                    {w.status?.replace('_', ' ')}
                  </Badge>
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
export default WorkItemTable;
