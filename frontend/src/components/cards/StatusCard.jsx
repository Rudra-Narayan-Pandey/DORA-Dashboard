import React from 'react';
import { RiRadioButtonLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';

export const StatusCard = ({
  title = "Grid System Health",
  stats = [], // [{ label, value, status }]
  className
}) => {
  return (
    <div className={classNames("glass-panel p-5 relative overflow-hidden flex flex-col gap-4 border-dora-cyan/10 shadow-neon-cyan/5", className)}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-dora-cyan/30 to-transparent" />
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase font-mono tracking-widest text-dora-text-secondary font-bold">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-dora-green border border-dora-green/20 bg-dora-green/5 px-2 py-0.5 rounded uppercase tracking-wider">
          <RiRadioButtonLine className="w-3.5 h-3.5 animate-pulse text-dora-green" />
          <span>Sync OK</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="border border-dora-border/20 bg-slate-950/20 rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-dora-text-muted uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg font-bold font-mono text-dora-text text-glow-cyan">
                {stat.value}
              </span>
              {stat.status && (
                <span className={classNames(
                  "w-2 h-2 rounded-full",
                  stat.status === 'online' ? 'bg-dora-green shadow-neon-green' : stat.status === 'degraded' ? 'bg-dora-yellow shadow-neon-yellow' : 'bg-dora-rose shadow-neon-rose'
                )} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StatusCard;
