import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/colors';
import { chartGridConfig, chartXAxisConfig, chartYAxisConfig, customTooltipStyle } from '../../utils/chartConfig';

export const MonthlyChart = ({ data = [] }) => {
  // Mock incidents count per month to correlate with deployment volumes
  const chartData = data.map((d, i) => ({
    ...d,
    incidents: Math.max(1, Math.round(d.deployments * (d.failureRate / 100)))
  }));

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMonthlyDeployments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.25}/>
              <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid {...chartGridConfig} />
          <XAxis dataKey="month" {...chartXAxisConfig} />
          <YAxis yAxisId="left" {...chartYAxisConfig} label={{ value: 'Deployments', angle: -90, position: 'insideLeft', offset: 10, style: { fill: COLORS.textSecondary, fontSize: 10, fontFamily: 'monospace' } }} />
          <YAxis yAxisId="right" orientation="right" {...chartYAxisConfig} label={{ value: 'Incidents', angle: 90, position: 'insideRight', offset: 10, style: { fill: COLORS.textSecondary, fontSize: 10, fontFamily: 'monospace' } }} />
          <Tooltip {...customTooltipStyle} />
          <Legend 
            wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase' }}
          />
          <Area 
            yAxisId="left"
            name="Deployments"
            type="monotone"
            dataKey="deployments" 
            fill="url(#colorMonthlyDeployments)" 
            stroke={COLORS.cyan}
            strokeWidth={1.5}
          />
          <Line 
            yAxisId="right" 
            name="Incidents Triggered"
            type="monotone" 
            dataKey="incidents" 
            stroke={COLORS.rose} 
            strokeWidth={2}
            dot={{ r: 3 }}
            style={{
              filter: 'drop-shadow(0px 0px 4px rgba(255, 42, 95, 0.4))'
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
export default MonthlyChart;
