import React from 'react';
import { classNames } from '../../utils/helpers';

export const Divider = ({
  orientation = 'horizontal', // horizontal, vertical
  glow = false,
  className
}) => {
  if (orientation === 'vertical') {
    return (
      <div 
        className={classNames(
          "w-[1px] self-stretch bg-gradient-to-b",
          glow ? "from-dora-border via-dora-cyan/30 to-dora-border" : "from-transparent via-dora-border to-transparent",
          className
        )}
      />
    );
  }

  return (
    <div 
      className={classNames(
        "h-[1px] w-full bg-gradient-to-r",
        glow ? "from-dora-border via-dora-cyan/30 to-dora-border" : "from-transparent via-dora-border to-transparent",
        className
      )}
    />
  );
};
export default Divider;
