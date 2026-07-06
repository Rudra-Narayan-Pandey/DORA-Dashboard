import { COLORS } from './colors';

export const chartGridConfig = {
  stroke: 'rgba(255, 255, 255, 0.05)',
  strokeDasharray: '3 3',
  vertical: false
};

export const chartXAxisConfig = {
  stroke: COLORS.textMuted,
  fontSize: 11,
  tickLine: false,
  dy: 10
};

export const chartYAxisConfig = {
  stroke: COLORS.textMuted,
  fontSize: 11,
  tickLine: false,
  dx: -5
};

export const customTooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(5, 8, 22, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 242, 254, 0.2)',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 242, 254, 0.1)',
    color: COLORS.text
  },
  labelStyle: {
    fontWeight: 'bold',
    color: COLORS.cyan,
    marginBottom: '4px'
  }
};
