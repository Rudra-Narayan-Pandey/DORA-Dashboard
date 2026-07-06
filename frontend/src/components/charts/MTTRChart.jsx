import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/colors';
import { chartGridConfig, chartXAxisConfig, chartYAxisConfig, customTooltipStyle } from '../../utils/chartConfig';

export const MTTRChart = ({ data = [] }) => {
  return (
    <div className="w-full h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid {...chartGridConfig} />
          <XAxis dataKey="day" {...chartXAxisConfig} />
          <YAxis {...chartYAxisConfig} unit="m" />
          <Tooltip 
            {...customTooltipStyle}
            formatter={(value) => [`${value} mins`, 'MTTR']}
          />
          <Line
            type="monotone"
            dataKey="mttr"
            stroke={COLORS.green}
            strokeWidth={2.5}
            dot={{ r: 4, stroke: COLORS.green, strokeWidth: 1.5, fill: COLORS.bg }}
            activeDot={{ r: 6, stroke: COLORS.green, strokeWidth: 1.5, fill: COLORS.green }}
            style={{
              filter: 'drop-shadow(0px 0px 6px rgba(5, 255, 196, 0.4))'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default MTTRChart;
