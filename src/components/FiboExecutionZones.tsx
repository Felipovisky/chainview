import React, { useState } from 'react';
import type { CryptoAsset, Transaction } from '../types/crypto';
import { Layers, Target, Filter, Sparkles } from 'lucide-react';

interface Props {
  assets: CryptoAsset[];
  transactions: Transaction[];
  currency: 'USD' | 'BRL';
  exchangeRate: number | null;
}

interface FiboZoneConfig {
  id: 'acima' | '0.382' | '0.50' | '0.618' | '0.786';
  title: string;
  subtitle: string;
  tip: string;
  borderClass: string;
  bgClass: string;
  badgeClass: string;
  textClass: string;
}

const FIBO_ZONES: FiboZoneConfig[] = [
  {
    id: '0.786',
    title: 'Faixa 0.786+ • Desconto Extremo',
    subtitle: 'Queda superior a 78.6% do ATH',
    tip: 'Zona de capitulação máxima. Excelente para reduzir preço médio de longo prazo.',
    borderClass: 'border-purple-500/40',
    bgClass: 'bg-purple-500/5',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    textClass: 'text-purple-400',
  },
  {
    id: '0.618',
    title: 'Faixa 0.618 • Desconto Ideal (Golden Pocket)',
    subtitle: 'Queda entre 61.8% e 78.5% do ATH',
    tip: 'Zona clássica de acumulação institucional. Mantenha disciplina nos aportes parciais.',
    borderClass: 'border-indigo-500/40',
    bgClass: 'bg-indigo-500/5',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    textClass: 'text-indigo-400',
  },
  {
    id: '0.50',
    title: 'Faixa 0.50 • Preço Justo',
    subtitle: 'Queda entre 50.0% e 61.7% do ATH',
    tip: 'Equilíbrio de mercado. Evite gastar todo o caixa aqui caso o mercado busque 0.618.',
    borderClass: 'border-emerald-500/40',
    bgClass: 'bg-emerald-500/5',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    textClass: 'text-emerald-400',
  },
  {
    id: '0.382',
    title: 'Faixa 0.382 • Aproximação',
    subtitle: 'Queda entre 38.2% e 49.9% do ATH',
    tip: 'Primeira retração relevante. Ideal apenas para entradas iniciais leves.',
    borderClass: 'border-amber-500/40',
    bgClass: 'bg-amber-500/5',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    textClass: 'text-amber-400',
  },
  {
    id: 'acima',
    title: 'Acima de 0.382 • Próximo ao Topo',
    subtitle: 'Queda menor que 38.2% do ATH',
    tip: 'Compras em região esticada. Redobre a gestão de risco e evite FOMO.',
    borderClass: 'border-rose-500/40',
    bgClass: 'bg-rose-500/5',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    textClass: 'text-rose-400',
  },
];

export const FiboExecutionZones: React.FC<Props> = ({
  assets,
  transactions,
  currency,
  exchangeRate,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');

  const isStable = (id: string, symbol?: string) =>
    ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(id.toLowerCase()) ||
    (symbol ? ['USDT', 'USDC', 'DAI'].includes(symbol.toUpperCase()) : false);

  const isBrlActive = currency === 'BRL' && !!exchangeRate;

  const formatMoney = (usdValue: number) => {
    const rate = isBrlActive && exchangeRate ? exchangeRate : 1;
    const val = usdValue * rate;
    if (isBrlActive) {
      return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtra apenas transações de Compra de ativos não-stablecoin que tenham ATH disponível
  const buyExecutions = transactions
    .filter((tx) => tx.type === 'Compra' && !isStable(tx.assetId))
    .map((tx) => {
      const asset = assets.find((a) => a.id === tx.assetId);
      const ath = asset?.ath || 0;
      const buyPrice = Number(tx.priceAtDate) || 0;
      if (!asset || ath <= 0 || buyPrice <= 0) return null;

      const dropFromAth = ((buyPrice - ath) / ath) * 100; // negativo
      let zoneId: FiboZoneConfig['id'] = 'acima';
      if (dropFromAth <= -78.6) zoneId = '0.786';
      else if (dropFromAth <= -61.8) zoneId = '0.618';
      else if (dropFromAth <= -50.0) zoneId = '0.50';
      else if (dropFromAth <= -38.2) zoneId = '0.382';

      return {
        tx,
        asset,
        dropFromAth,
        zoneId,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter((item) => selectedSymbol === 'ALL' || item.asset.symbol === selectedSymbol);

  const availableSymbols = Array.from(
    new Set(
      assets
        .filter((a) => !isStable(a.id, a.symbol) && (a.ath || 0) > 0)
        .map((a) => a.symbol.toUpperCase())
    )
  );

  // Agrupa apenas as zonas que tiveram compras executadas
  const activeZones = FIBO_ZONES.map((zone) => {
    const items = buyExecutions.filter((e) => e.zoneId === zone.id);
    const totalInvested = items.reduce((acc, i) => acc + Number(i.tx.amount || 0), 0);
    const uniqueCoins = Array.from(new Set(items.map((i) => i.asset.symbol.toUpperCase())));
    return {
      ...zone,
      items,
      totalInvested,
      uniqueCoins,
    };
  }).filter((z) => z.items.length > 0);

  return (
    <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg">
      {/* Cabeçalho + Filtro por Ativo */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" /> Execução por Faixas de Fibonacci
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Janelas abertas automaticamente conforme o desconto em relação ao ATH no momento de cada compra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
            <Filter size={12} /> Ativo:
          </span>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Todos ({availableSymbols.length})</option>
            {availableSymbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Janelas dinâmicas por faixa */}
      {activeZones.length === 0 ? (
        <div className="bg-[#0b0e14] border border-slate-800/80 rounded-xl p-8 text-center">
          <Target size={24} className="text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">
            Nenhuma compra registrada com dados de ATH para exibir janelas de Fibonacci.
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Registre uma compra ou aguarde a atualização de preços da CoinGecko.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeZones.map((zone) => (
            <div
              key={zone.id}
              className={`rounded-xl border ${zone.borderClass} ${zone.bgClass} p-5 flex flex-col justify-between transition-all`}
            >
              <div>
                {/* Topo da Janela */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className={`text-sm font-bold ${zone.textClass}`}>{zone.title}</h4>
                    <span className="text-[11px] text-slate-400">{zone.subtitle}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${zone.badgeClass}`}>
                    {zone.items.length} {zone.items.length === 1 ? 'compra' : 'compras'}
                  </span>
                </div>

                {/* Resumo Financeiro da Janela */}
                <div className="flex items-center justify-between bg-[#0b0e14]/80 border border-slate-800/80 rounded-lg px-3.5 py-2.5 mb-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Total Aportado</div>
                    <div className="text-sm font-black font-mono text-white">
                      {formatMoney(zone.totalInvested)}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {zone.uniqueCoins.map((coin) => (
                      <span
                        key={coin}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-200"
                      >
                        {coin}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Últimas compras nessa janela */}
                <div className="space-y-1.5 mb-4 max-h-28 overflow-y-auto pr-1">
                  {zone.items.map(({ tx, asset, dropFromAth }) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-[11px] text-slate-300 bg-[#0b0e14]/50 px-2.5 py-1.5 rounded"
                    >
                      <span className="font-semibold">
                        {asset.symbol.toUpperCase()} • <span className="text-slate-500">{tx.date}</span>
                      </span>
                      <span className="font-mono">
                        {formatMoney(Number(tx.amount))}{' '}
                        <span className={`font-bold ${zone.textClass}`}>({dropFromAth.toFixed(1)}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dica Tática Contextual */}
              <div className="flex items-start gap-2 pt-3 border-t border-slate-800/60 text-[11px] text-slate-300">
                <Sparkles size={13} className={`${zone.textClass} shrink-0 mt-0.5`} />
                <span>{zone.tip}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};