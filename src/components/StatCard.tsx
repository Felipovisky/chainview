import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip } from 'recharts';

interface Props {
  title: string;
  value: string;
  valueColor?: string;
  badge?: string;
  badgePositive?: boolean;
  isPrivacyMode?: boolean;
  sparklineData?: any[];
  chartColor?: string;
  chartType?: "monotone" | "stepAfter";
  idGradient?: string;
}

export const StatCard: React.FC<Props> = ({ 
  title, 
  value, 
  valueColor = "text-white", 
  badge, 
  badgePositive,
  isPrivacyMode = false,
  sparklineData = [],
  chartColor = "#10b981",
  chartType = "monotone",
  idGradient = "grad-default"
}) => {
  const hasData = sparklineData && sparklineData.length > 0;

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-5 flex flex-col shadow-lg h-[170px] transition-all duration-300 hover:border-slate-700">
      {/* Cabeçalho do Cartão */}
      <div className="flex justify-between items-start w-full">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
            badgePositive 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {badge}
          </span>
        )}
      </div>
      
      {/* Valor Central */}
      <div className="mt-1 mb-4">
        <p className={`text-3xl font-semibold tracking-tight ${valueColor}`}>
          {isPrivacyMode ? '••••••' : value}
        </p>
      </div>

      {/* Gráfico (Recriando o design clássico) */}
      <div className="flex-1 w-full relative -mx-1">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={idGradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#1e293b" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 10 }} 
                tickMargin={8} 
                minTickGap={25}
              />
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
                itemStyle={{ color: chartColor, fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '3 3' }}
                formatter={(val: any) => [`$${Number(val || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, title] as any}
              />
              <Area 
                type={chartType} 
                dataKey="value" 
                stroke={chartColor} 
                strokeWidth={2} 
                fill={`url(#${idGradient})`} 
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-end pb-5">
            <div className="w-full h-[1px] bg-slate-800/50"></div>
          </div>
        )}
      </div>
    </div>
  );
};