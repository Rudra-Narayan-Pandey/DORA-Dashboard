export const formatDisplayName = (value, fallback = 'Unknown') => {
  if (!value) return fallback;
  const rawValue = String(value);
  return rawValue
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .trim() || fallback;
};
