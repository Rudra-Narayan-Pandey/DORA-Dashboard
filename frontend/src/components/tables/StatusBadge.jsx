import React from 'react';
import { getStatusColorClasses } from '../../utils/statusColor';
import { classNames } from '../../utils/helpers';

export const StatusBadge = ({ status }) => {
  const colors = getStatusColorClasses(status);

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider",
        colors.bg,
        colors.border,
        colors.text,
        colors.glow
      )}
    >
      <span className={classNames("w-1.5 h-1.5 rounded-full", colors.dot)} />
      <span>{status?.replace('_', ' ')}</span>
    </span>
  );
};
export default StatusBadge;
