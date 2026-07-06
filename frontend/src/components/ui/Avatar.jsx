import React from 'react';
import { classNames } from '../../utils/helpers';

export const Avatar = ({
  initials = 'OP',
  status = 'active', // active, dnd, offline
  size = 'md', // sm, md, lg
  className
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const statusColors = {
    active: 'bg-dora-green shadow-neon-green',
    dnd: 'bg-dora-rose shadow-neon-rose',
    offline: 'bg-slate-600'
  };

  return (
    <div className={classNames("relative inline-block", className)}>
      <div 
        className={classNames(
          "flex items-center justify-center rounded-full font-bold font-mono border border-dora-cyan/30 text-dora-cyan",
          "bg-gradient-to-tr from-slate-900 via-dora-cyan/10 to-slate-800",
          sizeMap[size] || sizeMap.md
        )}
      >
        {initials}
      </div>
      
      {status && (
        <span 
          className={classNames(
            "absolute bottom-0 right-0 block rounded-full ring-1 ring-slate-950",
            statusColors[status] || statusColors.offline,
            size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
          )}
        />
      )}
    </div>
  );
};
export default Avatar;
