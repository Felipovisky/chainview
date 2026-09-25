import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';
import type { Transaction } from '../types/crypto';

interface Props {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (updatedTx: Transaction) => void;
}

export const EditTransactionModal: React.FC<Props> = ({
  isOpen,
  transaction,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');

  // Pré-preenche os dados da transação selecionada
  useEffect(() => {
    if (transaction) {
      setDate(transaction.date);
      setQuantity(transaction.quantity.toString());
      setAmount(transaction.amount.toString());
      setWallet(transaction.wallet || 'Sem Carteira');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const amt = parseFloat(amount);

    if (isNaN(qty) || qty <= 0 || isNaN(amt) || amt <= 0) {
      alert('Introduza valores válidos para quantidade e valor investido.');
      return;
    }

    onSave({
      ...transaction,
      date,
      quantity: qty,
      amount: amt,
      priceAtDate: amt / qty, // Recalcula a cotação histórica da compra
      wallet: wallet.trim() || 'Sem Carteira',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#121824] border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">Editar Transação</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Data da Operação
            </label>
            <input
              type="text"
              required
              placeholder="DD/MM/AAAA"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quantidade de Cripto
            </label>
            <input
              type="number"
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Valor Aportado (USD)
            </label>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Carteira / Exchange
            </label>
            <input
              type="text"
              placeholder="Ex: Binance, Ledger, Metamask..."
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Cotação calculada */}
          {parseFloat(quantity) > 0 && parseFloat(amount) > 0 && (
            <div className="bg-[#0b0e14]/60 border border-slate-800/80 rounded-lg p-3 text-xs flex justify-between text-slate-300">
              <span className="text-slate-400">Nova cotação unitária:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                ${(parseFloat(amount) / parseFloat(quantity)).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs rounded-lg transition shadow-lg shadow-emerald-500/10"
            >
              Guardar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};