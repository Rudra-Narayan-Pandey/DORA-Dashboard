import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/colors';
import { chartGridConfig, chartXAxisConfig, chartYAxisConfig, customTooltipStyle } from '../../utils/chartConfig';

export const WeeklyChart = ({ data = [] }) => {
  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
          <CartesianGrid {...chartGridConfig} />
          <XAxis dataKey="day" {...chartXAxisConfig} />
          <YAxis yAxisId="left" {...chartYAxisConfig} label={{ value: 'Deploys', angle: -90, position: 'insideLeft', offset: 10, style: { fill: COLORS.textSecondary, fontSize: 10, fontFamily: 'monospace' } }} />
          <YAxis yAxisId="right" orientation="right" {...chartYAxisConfig} label={{ value: 'Hours', angle: 90, position: 'insideRight', offset: 10, style: { fill: COLORS.textSecondary, fontSize: 10, fontFamily: 'monospace' } }} />
          <Tooltip {...customTooltipStyle} />
          <Legend 
            wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase' }}
          />
          <Bar 
            yAxisId="left" 
            name="Deployments"
            dataKey="deployments" 
            fill={COLORS.cyan} 
            radius={[3, 3, 0, 0]}
            maxBarSize={20}
          />
          <Line 
            yAxisId="right" 
            name="Lead Time"
            type="monotone" 
            dataKey="leadTime" 
            stroke={COLORS.indigo} 
            strokeWidth={2}
            dot={{ r: 3 }}
            style={{
              filter: 'drop-shadow(0px 0px 4px rgba(93, 95, 239, 0.4))'
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
export default WeeklyChart;
