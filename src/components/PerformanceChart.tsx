import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { CryptoAsset } from '../types/crypto';

interface Props {
  assets?: CryptoAsset[];
}

export const PerformanceChart: React.FC<Props> = ({ assets = [] }) => {
  const chartData = useMemo(() => {
    if (!assets || assets.length === 0) return [];

    return assets
      .map(asset => {
        const invested = Number(asset.investedAmount) || 0;
        const currentVal = Number(asset.quantity) * Number(asset.currentPrice);
        let profitPct = 0;
        
        if (invested > 0) {
          profitPct = ((currentVal - invested) / invested) * 100;
        }

        return {
          name: asset.name,
          symbol: asset.symbol,
          roi: Number(profitPct.toFixed(2)),
        };
      })
      .filter(a => a.symbol !== 'USDT' && a.symbol !== 'USDC') // Remove Caixa
      .sort((a, b) => b.roi - a.roi);
  }, [assets]);

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-5 flex flex-col h-[380px] shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Desempenho por Ativo (ROI %)</h3>
      </div>

      <div className="flex-1 w-full relative -ml-2">
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs">
            <span className="text-3xl mb-3 opacity-50">📊</span>
            Sem dados suficientes.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
              
              <XAxis 
                type="number" 
                stroke="#475569" 
                fontSize={10} 
                tickFormatter={(val) => `${val}%`}
                axisLine={false}
                tickLine={false}
              />
              
              <YAxis 
                dataKey="symbol" 
                type="category" 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight={600}
                width={50} 
                axisLine={false}
                tickLine={false}
              />
              
              <Tooltip 
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
                formatter={(value: any) => [`${Number(value || 0) >= 0 ? '+' : ''}${value}%`, 'Rentabilidade'] as any}
              />
              
              <ReferenceLine x={0} stroke="#334155" strokeWidth={2} />
              
              <Bar dataKey="roi" barSize={8} animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.roi >= 0 ? '#10b981' : '#f43f5e'} 
                    radius={(entry.roi >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]) as any}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};