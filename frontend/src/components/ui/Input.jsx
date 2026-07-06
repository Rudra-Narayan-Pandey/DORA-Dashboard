import React from 'react';
import { classNames } from '../../utils/helpers';

export const Input = React.forwardRef(({
  type = 'text',
  placeholder,
  label,
  value,
  onChange,
  error,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs uppercase tracking-wider text-dora-text-secondary font-semibold font-mono">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={classNames(
          "w-full px-3.5 py-2.5 rounded-lg bg-dora-card/60 border border-dora-border text-dora-text text-sm placeholder-slate-500",
          "focus:outline-none focus:border-dora-cyan focus:ring-1 focus:ring-dora-cyan/30 focus:shadow-neon-cyan/20 focus:bg-slate-900/90",
          "transition-all duration-200 backdrop-blur-glass font-mono",
          error ? "border-dora-rose focus:ring-dora-rose/30" : "",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-dora-rose mt-0.5 font-mono">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
