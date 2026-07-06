import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/colors';
import { chartGridConfig, chartXAxisConfig, chartYAxisConfig, customTooltipStyle } from '../../utils/chartConfig';

export const DeploymentChart = ({ data = [] }) => {
  return (
    <div className="w-full h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDeployments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid {...chartGridConfig} />
          <XAxis 
            dataKey="day" 
            {...chartXAxisConfig} 
            // Handle monthly keys too
            tickFormatter={(val) => val === undefined ? '' : val}
          />
          <YAxis 
            {...chartYAxisConfig}
            allowDecimals={false}
          />
          <Tooltip 
            {...customTooltipStyle}
            formatter={(value) => [`${value} Deploys`, 'Frequency']}
          />
          <Area
            type="monotone"
            dataKey="deployments"
            stroke={COLORS.cyan}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDeployments)"
            dot={{ r: 3, stroke: COLORS.cyan, strokeWidth: 1, fill: COLORS.bg }}
            activeDot={{ r: 5, stroke: COLORS.cyan, strokeWidth: 1, fill: COLORS.cyan }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default DeploymentChart;
