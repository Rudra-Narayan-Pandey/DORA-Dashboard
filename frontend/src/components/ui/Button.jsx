import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '../../utils/helpers';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, danger, glow, outline
  size = 'md', // sm, md, lg
  disabled = false,
  className,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition duration-250 focus:outline-none focus:ring-1 focus:ring-dora-cyan disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-dora-cyan/80 to-dora-blue/80 text-[#050816] hover:from-dora-cyan hover:to-dora-blue shadow-neon-cyan/20 shadow-md border border-dora-cyan/30',
    secondary: 'bg-dora-card text-dora-text hover:bg-slate-800 border border-dora-border backdrop-blur-glass',
    danger: 'bg-dora-rose/25 text-dora-rose hover:bg-dora-rose/40 border border-dora-rose/40',
    glow: 'bg-gradient-to-r from-dora-indigo/80 to-dora-violet/80 text-dora-text hover:from-dora-indigo hover:to-dora-violet shadow-neon-indigo/30 shadow-md border border-dora-indigo/30',
    outline: 'border border-dora-border text-dora-text hover:bg-dora-cyan/15 hover:border-dora-cyan/50 hover:text-dora-cyan',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames(baseStyle, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};
export default Button;
