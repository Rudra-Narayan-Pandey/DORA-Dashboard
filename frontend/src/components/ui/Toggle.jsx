import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '../../utils/helpers';

export const Toggle = ({
  checked,
  onChange,
  disabled = false,
  label,
  className
}) => {
  return (
    <label className={classNames("inline-flex items-center gap-3 cursor-pointer select-none", disabled ? "opacity-50 pointer-events-none" : "", className)}>
      <div className="relative">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => !disabled && onChange && onChange(e.target.checked)} 
          className="sr-only" 
        />
        
        {/* Track */}
        <div 
          className={classNames(
            "w-10 h-5 rounded-full transition-colors border",
            checked 
              ? "bg-dora-cyan/20 border-dora-cyan/40 shadow-neon-cyan/20" 
              : "bg-slate-900 border-dora-border"
          )}
        />
        
        {/* Thumb */}
        <motion.div 
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={classNames(
            "absolute top-[2.5px] left-0 w-3.5 h-3.5 rounded-full transition-colors",
            checked ? "bg-dora-cyan shadow-neon-cyan" : "bg-dora-text-secondary"
          )}
        />
      </div>
      
      {label && (
        <span className="text-xs font-mono uppercase tracking-wider text-dora-text-secondary font-semibold">
          {label}
        </span>
      )}
    </label>
  );
};
export default Toggle;
