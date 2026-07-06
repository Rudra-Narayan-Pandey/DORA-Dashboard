export const COLORS = {
  cyan: '#00f2fe',
  blue: '#0070f3',
  electric: '#00d2ff',
  indigo: '#5d5fef',
  violet: '#8b5cf6',
  green: '#05ffc4',
  rose: '#ff2a5f',
  yellow: '#f59e0b',
  bg: '#050816',
  card: 'rgba(10, 15, 30, 0.45)',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b'
};

export const RGBA_COLORS = {
  cyan: (opacity = 0.2) => `rgba(0, 242, 254, ${opacity})`,
  blue: (opacity = 0.2) => `rgba(0, 112, 243, ${opacity})`,
  indigo: (opacity = 0.2) => `rgba(93, 95, 239, ${opacity})`,
  violet: (opacity = 0.2) => `rgba(139, 92, 246, ${opacity})`,
  green: (opacity = 0.2) => `rgba(5, 255, 196, ${opacity})`,
  rose: (opacity = 0.2) => `rgba(255, 42, 95, ${opacity})`,
  yellow: (opacity = 0.2) => `rgba(245, 158, 11, ${opacity})`
};
