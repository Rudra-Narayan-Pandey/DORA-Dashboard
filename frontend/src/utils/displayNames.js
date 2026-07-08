const OWNER_PATTERNS = [
  /rudra[-\s_]*narayan[-\s_]*pandey/gi,
  /rudra[-\s_]*narayan/gi
];

export const formatDisplayName = (value, fallback = 'Gargi and Rudra') => {
  if (!value) return fallback;

  const rawValue = String(value);
  if (OWNER_PATTERNS.some((pattern) => pattern.test(rawValue))) {
    return 'Gargi and Rudra';
  }

  return rawValue
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .trim() || fallback;
};
