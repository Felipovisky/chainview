import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export interface SparklinePoint {
  date: string;
  value: number;
}

interface StatCardProps {
  title: string;
  value: string;
  valueColor?: string; // Cor personalizada do valor (ex: verde para Saldo e Lucro)
  badge?: string;
  badgePositive?: boolean;
  sparklineData?: SparklinePoint[];
  chartColor?: string;
  chartType?: 'monotone' | 'stepAfter';
  idGradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  valueColor = 'text-white',
  badge,
  badgePositive,
  sparklineData,
  chartColor = '#10b981',
  chartType = 'monotone',
  idGradient = 'grad-default',
}) => {
  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between shadow-sm min-h-[170px]">
      {/* Título e Valor */}
      <div>
        <span className="text-slate-400 text-xs font-medium tracking-wide">{title}</span>
        <div className="flex items-center gap-2.5 mt-2">
          <span className={`text-2xl font-bold tracking-tight ${valueColor}`}>{value}</span>
          {badge && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                badgePositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Gráfico com Linhas Tracejadas Verticais, Datas e Gradiente */}
      {sparklineData && (
        <div className="w-full h-24 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={idGradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Linhas verticais tracejadas de referência */}
              <CartesianGrid
                stroke="#1e293b"
                strokeDasharray="3 3"
                horizontal={false}
                vertical={true}
              />

              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />

              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />

              <Area
                type={chartType}
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#${idGradient})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};