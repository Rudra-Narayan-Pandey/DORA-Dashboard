export const calculateTrendPercent = (current, previous) => {
  if (!current || !previous) return 0;
  const curr = typeof current === 'string' ? parseFloat(current) : current;
  const prev = typeof previous === 'string' ? parseFloat(previous) : previous;
  if (prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
};

export const getTrendDirection = (trendValue, lowerIsBetter = false) => {
  if (trendValue === 0) return 'neutral';
  if (lowerIsBetter) {
    return trendValue < 0 ? 'improvement' : 'regression';
  }
  return trendValue > 0 ? 'improvement' : 'regression';
};
