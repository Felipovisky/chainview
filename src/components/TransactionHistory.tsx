import React from 'react';
import type { CryptoAsset, Transaction } from '../types/crypto';
import { ChevronLeft, Plus, Trash2, Edit3, Maximize2 } from 'lucide-react';

interface Props {
  asset: CryptoAsset;
  transactions: Transaction[];
  onBack: () => void;
  onOpenAddModal: () => void;
  onDeleteTransaction: (txId: string) => void;
  onEditTransaction: (tx: Transaction) => void; // Ação ao clicar no lápis
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
      {/* Barra Superior da Visão de Histórico */}
      <div className="flex items-center justify-between bg-[#121824] border border-slate-800/80 rounded-xl px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

          <span className="text-xs font-semibold text-emerald-400 border-b-2 border-emerald-400 pb-1">
            Histórico de Transações
          </span>

          <div className="flex items-center gap-2 bg-[#0b0e14] border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
              {asset.symbol.slice(0, 3)}
            </span>
            <span className="text-xs font-bold text-white">{asset.name} - {asset.symbol}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
            title="Novo Aporte"
          >
            <Plus size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Ecrã Completo"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-[#121824] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0f141f] text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5 text-center">Tipo</th>
                <th className="px-6 py-3.5">Data</th>
                <th className="px-6 py-3.5 text-right">Aporte/Saque</th>
                <th className="px-6 py-3.5 text-right">Cotação</th>
                <th className="px-6 py-3.5 text-right">Qt. Cripto</th>
                <th className="px-6 py-3.5 text-right">Lucro</th>
                <th className="px-6 py-3.5 text-right">% Lucro</th>
                <th className="px-6 py-3.5 text-right">Saldo</th>
                <th className="px-6 py-3.5 text-center">Carteira</th>
                <th className="px-6 py-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {assetTransactions.length > 0 ? (
                assetTransactions.map((tx) => {
                  const currentTxBalance = tx.quantity * asset.currentPrice;
                  const profit = currentTxBalance - tx.amount;
                  const profitPercent = (profit / tx.amount) * 100;
                  const isProfitable = profit >= 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 text-center font-sans">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {tx.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-white font-medium">{tx.date}</td>

                      <td className="px-6 py-4 text-right font-semibold text-white">
                        ${tx.amount.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-300">
                        ${tx.priceAtDate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-200">
                        {tx.quantity}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium ${
                            isProfitable
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isProfitable ? '+' : ''}${profit.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium ${
                            isProfitable
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isProfitable ? '+' : ''}{profitPercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                        ${currentTxBalance.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-center font-sans text-slate-400 text-xs">
                        {tx.wallet || 'Sem Carteira'}
                      </td>

                      {/* Coluna Ações com Edição funcional */}
                      <td className="px-6 py-4 text-center font-sans">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            className="hover:text-emerald-400 p-1 rounded hover:bg-slate-700/50 transition"
                            title="Editar Transação"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="hover:text-rose-400 p-1 rounded hover:bg-slate-700/50 transition"
                            title="Eliminar Transação"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-slate-500 text-xs">
                    Nenhuma transação registada para esta moeda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};