import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/colors';
import { chartGridConfig, chartXAxisConfig, chartYAxisConfig, customTooltipStyle } from '../../utils/chartConfig';

export const FailureRateChart = ({ data = [] }) => {
  return (
    <div className="w-full h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid {...chartGridConfig} />
          <XAxis dataKey="day" {...chartXAxisConfig} />
          <YAxis {...chartYAxisConfig} unit="%" />
          <Tooltip 
            {...customTooltipStyle}
            formatter={(value) => [`${value}%`, 'Failure Rate']}
          />
          <Bar
            dataKey="failureRate"
            fill={COLORS.violet}
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
            // Add custom visual glow style through SVG properties
            style={{
              filter: 'drop-shadow(0px 0px 4px rgba(139, 92, 246, 0.4))'
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default FailureRateChart;
