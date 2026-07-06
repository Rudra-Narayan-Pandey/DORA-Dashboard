import React from 'react';
import { classNames } from '../../utils/helpers';

export const Badge = ({
  children,
  variant = 'default', // default, success, danger, warning, info
  glow = false,
  className
}) => {
  const styles = {
    default: 'bg-slate-800/80 border-slate-700/80 text-dora-text-secondary',
    success: 'bg-dora-green/10 border-dora-green/30 text-dora-green',
    danger: 'bg-dora-rose/10 border-dora-rose/30 text-dora-rose',
    warning: 'bg-dora-yellow/10 border-dora-yellow/30 text-dora-yellow',
    info: 'bg-dora-cyan/10 border-dora-cyan/30 text-dora-cyan',
  };

  const glows = {
    default: '',
    success: 'shadow-neon-green/10',
    danger: 'shadow-neon-rose/10',
    warning: 'shadow-neon-yellow/10',
    info: 'shadow-neon-cyan/10'
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border font-mono tracking-wide uppercase",
        styles[variant] || styles.default,
        glow && (glows[variant] || glows.default),
        className
      )}
    >
      {children}
    </span>
  );
};
export default Badge;
