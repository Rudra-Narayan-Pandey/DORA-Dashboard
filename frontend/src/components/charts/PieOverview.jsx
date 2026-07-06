import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { COLORS } from '../../utils/colors';
import { customTooltipStyle } from '../../utils/chartConfig';

export const PieOverview = ({ data = [] }) => {
  // Aggregate environments distribution
  const distribution = data.reduce((acc, curr) => {
    const env = curr.environment || 'Other';
    acc[env] = (acc[env] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(distribution).map(key => ({
    name: key,
    value: distribution[key]
  }));

  const colorSequence = [COLORS.cyan, COLORS.indigo, COLORS.violet, COLORS.green];

  return (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip {...customTooltipStyle} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase' }}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colorSequence[index % colorSequence.length]} 
                style={{
                  filter: `drop-shadow(0px 0px 3px ${colorSequence[index % colorSequence.length]}55)`
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default PieOverview;
