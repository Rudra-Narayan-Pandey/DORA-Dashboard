import React from 'react';
import { classNames } from '../../utils/helpers';

export const Select = React.forwardRef(({
  label,
  value,
  onChange,
  options = [], // [{ value, label }] or string array
  error,
  className,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs uppercase tracking-wider text-dora-text-secondary font-semibold font-mono">
          {label}
        </label>
      )}
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        className={classNames(
          "px-3.5 py-2.5 rounded-lg bg-dora-card/60 border border-dora-border text-dora-text text-sm",
          "focus:outline-none focus:border-dora-cyan focus:ring-1 focus:ring-dora-cyan/30 focus:shadow-neon-cyan/20 focus:bg-slate-900/90",
          "transition-all duration-200 backdrop-blur-glass font-mono cursor-pointer appearance-none",
          error ? "border-dora-rose focus:ring-dora-rose/30" : "",
          className
        )}
        {...props}
      >
        {options.map((opt, i) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={i} value={val} className="bg-[#050816] text-dora-text">
              {lbl}
            </option>
          );
        })}
      </select>
      {error && (
        <span className="text-xs text-dora-rose mt-0.5 font-mono">{error}</span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
