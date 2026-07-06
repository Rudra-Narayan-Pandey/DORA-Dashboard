import React from 'react';
import { classNames } from '../../utils/helpers';

export const GradientGlow = ({ 
  children, 
  color = 'cyan', 
  intensity = 'medium', 
  animate = false,
  className 
}) => {
  const colorMap = {
    cyan: 'from-dora-cyan/20 to-dora-blue/5',
    indigo: 'from-dora-indigo/20 to-dora-violet/5',
    violet: 'from-dora-violet/20 to-dora-electric/5',
    green: 'from-dora-green/20 to-dora-cyan/5',
    rose: 'from-dora-rose/20 to-dora-violet/5',
  };

  const intensityMap = {
    low: 'blur-md opacity-40',
    medium: 'blur-xl opacity-60',
    high: 'blur-2xl opacity-80',
  };

  return (
    <div className={classNames("relative group", className)}>
      {/* Background glow shape */}
      <div 
        className={classNames(
          "absolute -inset-0.5 bg-gradient-to-r rounded-xl transition duration-500",
          colorMap[color] || colorMap.cyan,
          intensityMap[intensity] || intensityMap.medium,
          animate && "animate-pulse-slow",
          "group-hover:opacity-100 group-hover:duration-200"
        )} 
      />
      {/* Foreground card */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
export default GradientGlow;
