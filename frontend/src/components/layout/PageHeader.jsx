import React from 'react';
import { classNames } from '../../utils/helpers';

export const PageHeader = ({
  title,
  description,
  actions,
  className
}) => {
  return (
    <div className={classNames("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-dora-border/20 select-none", className)}>
      {/* Title & Description */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black font-mono tracking-wider uppercase text-dora-text text-glow-cyan">
          {title}
        </h1>
        {description && (
          <p className="text-xs font-mono text-dora-text-secondary">
            {description}
          </p>
        )}
      </div>

      {/* Action Button Slots */}
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
export default PageHeader;
