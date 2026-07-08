import React from 'react';
import { motion } from 'framer-motion';
import { RiRadio2Line } from 'react-icons/ri';
import { getRelativeTime } from '../../utils/formatDate';
import { getStatusColorClasses } from '../../utils/statusColor';
import { classNames } from '../../utils/helpers';

export const ActivityCard = ({
  title = "Recent Activity Feed",
  activities = [], // [{ id, text, type, timestamp, status }]
  className
}) => {
  return (
    <div className={classNames("glass-panel p-5 relative overflow-hidden flex flex-col gap-4 border-dora-cyan/15 shadow-neon-cyan/5", className)}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-dora-cyan/35 to-transparent" />
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <RiRadio2Line className="w-5 h-5 text-dora-cyan animate-pulse text-glow-cyan" />
        <h3 className="text-xs uppercase font-mono tracking-widest text-dora-text-secondary font-bold">
          {title}
        </h3>
      </div>

      {/* Timeline scroll container */}
      <div className="flex flex-col gap-4 overflow-y-auto max-h-[340px] pr-1">
        {activities.map((act, idx) => {
          const colors = getStatusColorClasses(act.status);
          return (
            <motion.div 
              key={act.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-3 relative group"
            >
              {/* Left Line & Node */}
              <div className="flex flex-col items-center">
                <div className={classNames("w-2 h-2 rounded-full border shadow-sm z-10", colors.dot, colors.glow)} />
                {idx !== activities.length - 1 && (
                  <div className="w-[1px] flex-1 bg-gradient-to-b from-dora-border/40 to-transparent mt-1" />
                )}
              </div>

              {/* Right text body */}
              <div className="flex-1 pb-3 -mt-1 flex flex-col gap-0.5 border-b border-dora-border/10 last:border-b-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-xs font-mono font-medium text-dora-text group-hover:text-dora-cyan transition-colors">
                    {act.text}
                  </span>
                  <span className="text-[9px] font-mono text-dora-text-muted whitespace-nowrap">
                    {getRelativeTime(act.timestamp)}
                  </span>
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <span className={classNames("text-[8px] px-1 py-0.5 rounded font-mono font-bold border uppercase tracking-wider", colors.bg, colors.border, colors.text)}>
                    {act.status}
                  </span>
                  {act.version && (
                    <span className="text-[9px] font-mono text-dora-text-secondary">
                      {act.version}
                    </span>
                  )}
                  {act.pipeline && (
                    <span className="text-[9px] font-mono text-dora-text-secondary truncate max-w-[120px]">
                      via {act.pipeline}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
export default ActivityCard;
