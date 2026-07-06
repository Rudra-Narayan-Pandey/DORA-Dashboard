import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/colors';
import { chartGridConfig, chartXAxisConfig, chartYAxisConfig, customTooltipStyle } from '../../utils/chartConfig';

export const LeadTimeChart = ({ data = [] }) => {
  return (
    <div className="w-full h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLeadTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid {...chartGridConfig} />
          <XAxis dataKey="day" {...chartXAxisConfig} />
          <YAxis {...chartYAxisConfig} unit="h" />
          <Tooltip 
            {...customTooltipStyle}
            formatter={(value) => [`${value} hrs`, 'Lead Time']}
          />
          <Area
            type="monotone"
            dataKey="leadTime"
            stroke={COLORS.indigo}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLeadTime)"
            dot={{ r: 3, stroke: COLORS.indigo, strokeWidth: 1, fill: COLORS.bg }}
            activeDot={{ r: 5, stroke: COLORS.indigo, strokeWidth: 1, fill: COLORS.indigo }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default LeadTimeChart;
