import React from 'react';

export const NoData = ({ message = "No telemetry signals found." }) => {
  return (
    <div className="flex items-center justify-center p-6 text-center w-full h-full">
      <span className="text-xs font-mono text-dora-text-muted uppercase tracking-wider">
        [ {message} ]
      </span>
    </div>
  );
};
export default NoData;
