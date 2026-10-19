import React from 'react';
import type { CryptoAsset, Transaction } from '../types/crypto';
import { ChevronLeft, Plus, Trash2, Edit3, Maximize2 } from 'lucide-react';

interface Props {
  asset: CryptoAsset;
  transactions: Transaction[];
  onBack: () => void;
  onOpenAddModal: () => void;
  onDeleteTransaction: (txId: string) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionHistory: React.FC<Props> = ({
  asset,
  transactions,
  onBack,
  onOpenAddModal,
  onDeleteTransaction,
  onEditTransaction,
}) => {
  const assetTransactions = transactions.filter((t) => t.assetId === asset.id);

  return (
    <div className="space-y-6">
      {/* Barra Superior */}
      <div className="flex items-center justify-between bg-[#121824] border border-slate-800/80 rounded-xl px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition group shrink-0"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar
          </button>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          <span className="text-xs font-semibold text-emerald-400 border-b-2 border-emerald-400 pb-1 hidden sm:block">
            Histórico
          </span>

          <div className="flex items-center gap-2 bg-[#0b0e14] border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
              {asset.symbol.slice(0, 3)}
            </span>
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {asset.name} {asset.symbol}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
          >
            <Plus size={16} />
          </button>
          <button className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-800 text-slate-400 hover:text-white transition hidden sm:block">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Tabela de Transações (Muito mais compacta) */}
      <div className="bg-[#121824] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0f141f] text-[10px] sm:text-xs uppercase tracking-tight text-slate-400 border-b border-slate-800/80">
              <tr>
                <th className="px-2 py-3 text-center">Tipo</th>
                <th className="px-2 py-3">Data</th>
                <th className="px-2 py-3 text-right">Aporte</th>
                <th className="px-2 py-3 text-right">Cotação</th>
                <th className="px-2 py-3 text-right">Qt.</th>
                <th className="px-2 py-3 text-right">Lucro</th>
                <th className="px-2 py-3 text-right">% Lucro</th>
                <th className="px-2 py-3 text-right">Saldo</th>
                <th className="px-2 py-3 text-center">Carteira</th>
                <th className="px-2 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] sm:text-xs">
              {assetTransactions.length > 0 ? (
                assetTransactions.map((tx) => {
                  const currentTxBalance = tx.quantity * asset.currentPrice;
                  const profit = currentTxBalance - tx.amount;
                  const profitPercent = (profit / tx.amount) * 100;
                  const isProfitable = profit >= 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-2 py-3 text-center font-sans">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          {tx.type}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-white font-medium whitespace-nowrap">{tx.date}</td>
                      <td className="px-2 py-3 text-right font-semibold text-white">${tx.amount.toFixed(2)}</td>
                      <td className="px-2 py-3 text-right text-slate-300">${tx.priceAtDate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-2 py-3 text-right text-slate-200">{tx.quantity.toLocaleString('en-US', { maximumFractionDigits: 5 })}</td>

                      <td className="px-2 py-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfitable ? '+' : ''}${profit.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfitable ? '+' : ''}{profitPercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-2 py-3 text-right font-semibold text-emerald-400">${currentTxBalance.toFixed(2)}</td>
                      <td className="px-2 py-3 text-center font-sans text-slate-400 text-[10px]">{tx.wallet || '-'}</td>

                      <td className="px-2 py-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-1.5 text-slate-400">
                          <button type="button" onClick={() => onEditTransaction(tx)} className="hover:text-emerald-400 p-1 transition"><Edit3 size={14} /></button>
                          <button type="button" onClick={() => onDeleteTransaction(tx.id)} className="hover:text-rose-400 p-1 transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-2 py-6 text-center text-slate-500 text-xs">Nenhuma transação registada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};