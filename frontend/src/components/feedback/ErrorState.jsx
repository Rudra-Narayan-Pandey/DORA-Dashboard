import React from 'react';
import { RiAlertLine, RiRefreshLine } from 'react-icons/ri';
import Button from '../ui/Button';

export const ErrorState = ({ 
  title = "Grid Sync Failure", 
  message = "A telemetry connection failure interrupted dashboard synchronization.", 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-panel border-dora-rose/30 bg-dora-rose/5 rounded-xl max-w-md mx-auto my-6 gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-dora-rose/10 text-dora-rose shadow-neon-rose/10">
        <RiAlertLine className="w-6 h-6 animate-pulse" />
      </div>
      <div>
        <h3 className="text-base font-bold uppercase tracking-wider text-dora-rose font-mono">
          {title}
        </h3>
        <p className="text-xs text-dora-text-secondary mt-2 font-mono leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button 
          variant="danger" 
          size="sm" 
          onClick={onRetry}
          className="flex items-center gap-1.5 mt-2"
        >
          <RiRefreshLine className="w-4 h-4" />
          <span>Synchronize Node</span>
        </Button>
      )}
    </div>
  );
};
export default ErrorState;
