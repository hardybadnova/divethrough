
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GameStat {
  name: string;
  value: number;
  fill: string;
}

interface GameStatsChartProps {
  data: GameStat[];
  title: string;
}

const GameStatsChart: React.FC<GameStatsChartProps> = ({ data, title }) => {
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-betster-700/30 h-full">
      <h3 className="font-semibold mb-3 text-white">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <XAxis 
              dataKey="name" 
              stroke="#9F75FF" 
              fontSize={12} 
              tickLine={false}
              axisLine={{ stroke: '#444' }}
            />
            <YAxis 
              stroke="#9F75FF" 
              fontSize={12} 
              tickLine={false}
              axisLine={{ stroke: '#444' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid #7022FF',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GameStatsChart;
