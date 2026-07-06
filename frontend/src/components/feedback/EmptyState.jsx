import React from 'react';
import { RiInboxArchiveLine } from 'react-icons/ri';
import Button from '../ui/Button';

export const EmptyState = ({
  title = "No logs in queue",
  message = "No records were recovered matching the active filter configurations.",
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-panel border-dora-border bg-slate-950/20 rounded-xl max-w-md mx-auto my-6 gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-dora-text-secondary border border-dora-border">
        <RiInboxArchiveLine className="w-5 h-5 text-dora-cyan" />
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-dora-text font-mono">
          {title}
        </h3>
        <p className="text-xs text-dora-text-secondary mt-1 font-mono">
          {message}
        </p>
      </div>
      {onAction && actionLabel && (
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onAction}
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
