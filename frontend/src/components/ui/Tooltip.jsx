import React, { useState } from 'react';
import { classNames } from '../../utils/helpers';

export const Tooltip = ({
  children,
  content,
  position = 'top', // top, bottom, left, right
  className
}) => {
  const [active, setActive] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      {children}
      {active && (
        <div 
          className={classNames(
            "absolute z-50 px-2.5 py-1.5 text-xs font-mono rounded bg-slate-950 border border-dora-border text-dora-text shadow-xl whitespace-nowrap backdrop-blur-md",
            positionStyles[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
export default Tooltip;
