import React from 'react';
import { classNames } from '../../utils/helpers';

export const SummaryCard = ({
  title,
  items = [], // [{ label, value, subtext, color }]
  className
}) => {
  return (
    <div className={classNames("glass-panel p-5 relative overflow-hidden flex flex-col gap-4 border-dora-border shadow-md", className)}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-dora-cyan/20 to-transparent" />
      
      {title && (
        <h3 className="text-xs uppercase font-mono tracking-widest text-dora-text-secondary font-bold border-b border-dora-border/20 pb-3">
          {title}
        </h3>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1 border-r last:border-r-0 border-dora-border/20 pr-4 last:pr-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-dora-text-muted">
              {item.label}
            </span>
            <span className={classNames(
              "text-xl font-bold font-mono text-glow-cyan",
              item.color === 'green' ? 'text-dora-green' : item.color === 'rose' ? 'text-dora-rose' : item.color === 'yellow' ? 'text-dora-yellow' : 'text-dora-text'
            )}>
              {item.value}
            </span>
            {item.subtext && (
              <span className="text-[9px] font-mono text-dora-text-secondary">
                {item.subtext}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default SummaryCard;
