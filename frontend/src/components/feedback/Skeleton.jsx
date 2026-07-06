import React from 'react';
import { classNames } from '../../utils/helpers';

export const Skeleton = ({
  variant = 'text', // text, circle, rect
  width,
  height,
  className
}) => {
  const styles = {
    text: 'h-4 w-full rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg'
  };

  return (
    <div
      className={classNames(
        "animate-pulse bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-800/40",
        styles[variant] || styles.text,
        className
      )}
      style={{ width, height }}
    />
  );
};

// Shimmer helper container to represent full card skeletons
export const CardSkeleton = () => (
  <div className="glass-panel p-5 flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <Skeleton variant="text" className="w-1/3 h-5" />
      <Skeleton variant="circle" className="w-6 h-6" />
    </div>
    <Skeleton variant="rect" className="w-full h-16" />
    <div className="flex justify-between items-center gap-2">
      <Skeleton variant="text" className="w-1/2 h-3" />
      <Skeleton variant="text" className="w-1/4 h-3" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-4">
    <div className="flex gap-4 border-b border-dora-border pb-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="text" className="h-6 w-1/4" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-2 border-b border-dora-border/20">
        <Skeleton variant="text" className="h-4 w-1/6" />
        <Skeleton variant="text" className="h-4 w-2/6" />
        <Skeleton variant="text" className="h-4 w-1/6" />
        <Skeleton variant="text" className="h-4 w-2/6" />
      </div>
    ))}
  </div>
);

export default Skeleton;
