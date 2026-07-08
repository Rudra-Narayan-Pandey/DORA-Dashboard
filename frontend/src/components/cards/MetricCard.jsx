import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';
import Sparkline from '../charts/Sparkline';
import { classNames } from '../../utils/helpers';

// Simple lightweight local Counter for WOW numeric countups
const AnimatedCounter = ({ targetValue, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericTarget = parseFloat(targetValue);
    if (isNaN(numericTarget)) {
      setDisplayValue(targetValue);
      return;
    }

    const duration = 1200; // ms
    const startTime = performance.now();

    const updateCounter = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = easeProgress * numericTarget;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(numericTarget);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [targetValue]);

  const format = () => {
    if (typeof displayValue === 'string') return displayValue;
    const hasDecimals = parseFloat(targetValue) % 1 !== 0;
    return (hasDecimals ? displayValue.toFixed(1) : Math.round(displayValue).toString()) + suffix;
  };

  return <span>{format()}</span>;
};

export const MetricCard = ({
  title,
  value,
  unit,
  rating, // Elite, High, Medium, Low
  trend, // percentage
  trendDirection, // up, down
  sparklineData = [],
  color = 'cyan', // cyan, indigo, violet, green, rose
  onClick
}) => {
  const isGoodTrend = (color === 'green' || color === 'cyan') ? trendDirection === 'up' : trendDirection === 'down'; // higher deployments = good, lower mttr/cfr/leadtime = good

  const colorStyles = {
    cyan: 'border-dora-cyan/20 group-hover:border-dora-cyan/40 shadow-neon-cyan/5 hover:shadow-neon-cyan/15 text-dora-cyan',
    indigo: 'border-dora-indigo/20 group-hover:border-dora-indigo/40 shadow-neon-indigo/5 hover:shadow-neon-indigo/15 text-dora-indigo',
    violet: 'border-dora-violet/20 group-hover:border-dora-violet/40 shadow-neon-violet/5 hover:shadow-neon-violet/15 text-dora-violet',
    green: 'border-dora-green/20 group-hover:border-dora-green/40 shadow-neon-green/5 hover:shadow-neon-green/15 text-dora-green',
    rose: 'border-dora-rose/20 group-hover:border-dora-rose/40 shadow-neon-rose/5 hover:shadow-neon-rose/15 text-dora-rose',
  };

  const badgeStyles = {
    Elite: 'bg-dora-green/10 border-dora-green/30 text-dora-green shadow-neon-green/10',
    High: 'bg-dora-cyan/10 border-dora-cyan/30 text-dora-cyan shadow-neon-cyan/10',
    Medium: 'bg-dora-yellow/10 border-dora-yellow/30 text-dora-yellow shadow-neon-yellow/10',
    Low: 'bg-dora-rose/10 border-dora-rose/30 text-dora-rose shadow-neon-rose/10'
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onClick={onClick}
      className={classNames(
        "group cursor-pointer relative glass-panel p-5 overflow-hidden transition-all duration-300",
        colorStyles[color] || colorStyles.cyan,
        onClick ? "hover:bg-slate-900/40" : ""
      )}
    >
      {/* Aurora Glow behind card */}
      <div className={classNames(
        "absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity bg-current",
        color === 'indigo' ? 'text-dora-indigo' : color === 'violet' ? 'text-dora-violet' : color === 'green' ? 'text-dora-green' : color === 'rose' ? 'text-dora-rose' : 'text-dora-cyan'
      )} />

      {/* Holographic Border Scan */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-dora-cyan/40 to-transparent transform -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />

      {/* Header */}
      <div className="flex justify-between items-start">
        <span className="text-xs uppercase font-mono tracking-widest text-dora-text-secondary font-semibold">
          {title}
        </span>
        <span className={classNames("text-[10px] px-2 py-0.5 rounded border font-mono font-bold tracking-wider", badgeStyles[rating] || badgeStyles.Elite)}>
          {rating}
        </span>
      </div>

      {/* Body / Count */}
      <div className="mt-4 flex items-baseline gap-1.5">
        <h2 className="text-3xl font-extrabold font-mono tracking-tight text-glow-cyan text-dora-text">
          <AnimatedCounter targetValue={value} />
        </h2>
        <span className="text-xs font-mono text-dora-text-secondary font-semibold">
          {unit}
        </span>
      </div>

      {/* Footer / Trend & Sparkline */}
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-dora-border/20 pt-4">
        {/* Trend percentage */}
        <div className="flex items-center gap-1">
          {trendDirection === 'up' ? (
            <RiArrowUpLine className={classNames("w-4 h-4", isGoodTrend ? "text-dora-green" : "text-dora-rose")} />
          ) : (
            <RiArrowDownLine className={classNames("w-4 h-4", isGoodTrend ? "text-dora-green" : "text-dora-rose")} />
          )}
          <span className={classNames(
            "text-xs font-mono font-semibold",
            isGoodTrend ? "text-dora-green" : "text-dora-rose"
          )}>
            {trendDirection === 'up' ? '+' : ''}{trend}%
          </span>
        </div>

        {/* Sparkline widget */}
        <div className="w-24 h-8">
          <Sparkline data={sparklineData} color={color} />
        </div>
      </div>
    </motion.div>
  );
};
export default MetricCard;
