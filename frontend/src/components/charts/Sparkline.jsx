import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/colors';

export const Sparkline = ({ data = [], color = 'cyan' }) => {
  // Convert flat number array to object array for Recharts
  const chartData = data.map((val, idx) => ({ id: idx, value: val }));
  
  const strokeColor = COLORS[color] || COLORS.cyan;

  if (chartData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={true}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
export default Sparkline;
