export const formatPercent = (value) => {
  if (value === undefined || value === null) return '-';
  const val = typeof value === 'string' ? parseFloat(value) : value;
  return `${val.toFixed(1)}%`;
};

export const formatDecimal = (value, precision = 1) => {
  if (value === undefined || value === null) return '-';
  const val = typeof value === 'string' ? parseFloat(value) : value;
  return val.toFixed(precision);
};

export const formatDurationSeconds = (seconds) => {
  if (seconds === undefined || seconds === null) return '-';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

export const formatDurationMinutes = (minutes) => {
  if (minutes === undefined || minutes === null) return '-';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};
