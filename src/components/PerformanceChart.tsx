import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

// Dados simulados históricos para cada ativo ao longo do período
const weeklyData = [
  { date: '27/08', bitcoin: 4.5, chainlink: 2.1, sui: 15.0, pendle: 6.8, ethena: 4.2 },
  { date: '03/09', bitcoin: 5.8, chainlink: 1.5, sui: 15.2, pendle: 7.2, ethena: 5.9 },
  { date: '10/09', bitcoin: -1.2, chainlink: -0.8, sui: 6.8, pendle: -6.5, ethena: -4.3 },
  { date: '17/09', bitcoin: -2.3, chainlink: -0.5, sui: 27.5, pendle: 0.5, ethena: -1.8 },
  { date: '24/09', bitcoin: 33.68, chainlink: 6.5, sui: 33.91, pendle: 42.0, ethena: 43.48 },
];

const monthlyData = [
  { date: 'Mai', bitcoin: -8.0, chainlink: -12.0, sui: 5.0, pendle: -2.0, ethena: 10.0 },
  { date: 'Jun', bitcoin: 2.0, chainlink: -4.0, sui: 12.0, pendle: 8.0, ethena: 18.0 },
  { date: 'Jul', bitcoin: 14.0, chainlink: 2.0, sui: 18.0, pendle: 22.0, ethena: 25.0 },
  { date: 'Ago', bitcoin: 20.0, chainlink: 4.5, sui: 25.0, pendle: 30.0, ethena: 32.0 },
  { date: 'Set', bitcoin: 33.68, chainlink: 6.5, sui: 33.91, pendle: 42.0, ethena: 43.48 },
];

const yearlyData = [
  { date: '2025 Q4', bitcoin: 12.0, chainlink: 8.0, sui: 10.0, pendle: 14.0, ethena: 5.0 },
  { date: '2026 Q1', bitcoin: 18.0, chainlink: 10.5, sui: 20.0, pendle: 25.0, ethena: 15.0 },
  { date: '2026 Q2', bitcoin: 10.0, chainlink: 2.0, sui: 15.0, pendle: 18.0, ethena: 20.0 },
  { date: '2026 Q3', bitcoin: 33.68, chainlink: 6.5, sui: 33.91, pendle: 42.0, ethena: 43.48 },
];

// Cores correspondentes às da imagem
const assetColors = {
  bitcoin: '#f59e0b',   // Laranja/Amarelo
  chainlink: '#6366f1', // Roxo/Índigo
  sui: '#84cc16',       // Verde-lima
  pendle: '#ec4899',    // Rosa/Vermelho claro
  ethena: '#10b981',    // Esmeralda
};

export const PerformanceChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'Semanal' | 'Mensal' | 'Anual'>('Semanal');

  const getData = () => {
    switch (timeframe) {
      case 'Mensal':
        return monthlyData;
      case 'Anual':
        return yearlyData;
      default:
        return weeklyData;
    }
  };

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Análise de Rentabilidade</h3>

        {/* Filtros de Período */}
        <div className="flex bg-[#0b0e14] p-1 rounded-lg border border-slate-800 text-xs">
          {(['Semanal', 'Mensal', 'Anual'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-md transition font-medium ${
                timeframe === t
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}%`}
              domain={[-15, 45]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f8fafc',
              }}
              formatter={(value: any, name: any) => {
                const numValue = Number(value) || 0;
                const strName = String(name || '');
                return [
                  `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`,
                  strName.charAt(0).toUpperCase() + strName.slice(1)
                ];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-400 capitalize">{String(value)}</span>}
            />

            {/* Linhas de cada Criptoativo */}
            <Line
              type="monotone"
              dataKey="bitcoin"
              stroke={assetColors.bitcoin}
              strokeWidth={2}
              dot={{ r: 3, fill: assetColors.bitcoin }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="chainlink"
              stroke={assetColors.chainlink}
              strokeWidth={2}
              dot={{ r: 3, fill: assetColors.chainlink }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="sui"
              stroke={assetColors.sui}
              strokeWidth={2}
              dot={{ r: 3, fill: assetColors.sui }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="pendle"
              stroke={assetColors.pendle}
              strokeWidth={2}
              dot={{ r: 3, fill: assetColors.pendle }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="ethena"
              stroke={assetColors.ethena}
              strokeWidth={2}
              dot={{ r: 3, fill: assetColors.ethena }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};