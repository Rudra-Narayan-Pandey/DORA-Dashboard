import React from 'react';
import { motion } from 'framer-motion';
import { RiCpuLine, RiArrowRightUpLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';

export const InsightCard = ({
  title = "AI Diagnostics",
  subtitle = "GRID ANOMALY DETECTION ENGINE",
  insights = [],
  className
}) => {
  return (
    <div className={classNames("glass-panel p-5 relative overflow-hidden flex flex-col gap-4 border-dora-indigo/20 shadow-neon-indigo/5", className)}>
      {/* Laser header bar */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-dora-indigo to-transparent" />
      
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-dora-indigo/10 text-dora-indigo shadow-neon-indigo/15">
          <RiCpuLine className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-dora-text font-mono text-glow-indigo">
            {title}
          </h3>
          <p className="text-[9px] uppercase tracking-widest text-dora-text-muted font-semibold font-mono">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Insight List */}
      <div className="flex flex-col gap-3">
        {insights.map((insight, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="flex items-start gap-3 p-3 rounded-lg border border-dora-border/20 bg-slate-950/30 hover:bg-slate-950/70 hover:border-dora-indigo/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="mt-1 flex items-center justify-center w-5 h-5 rounded border border-dora-indigo/30 text-[10px] text-dora-indigo font-mono font-bold bg-dora-indigo/5">
              0{idx + 1}
            </div>
            <div className="flex-1">
              <p className="text-xs font-mono text-dora-text-secondary leading-relaxed group-hover:text-dora-text transition-colors">
                {insight}
              </p>
            </div>
            <RiArrowRightUpLine className="w-4 h-4 text-dora-text-muted group-hover:text-dora-indigo transition-colors mt-0.5" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default InsightCard;
