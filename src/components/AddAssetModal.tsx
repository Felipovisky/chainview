import React, { useState, useEffect } from 'react';
import { X, Calendar, Wallet } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    newEntry: { id: string; symbol: string; name: string; quantity: number; investedAmount: number },
    type: 'Compra' | 'Venda' | 'Troca',
    transactionDate: string,
    walletName: string
  ) => void;
  wallets: string[];
  defaultWallet: string;
}

// Lista das principais moedas para o modo manual
const commonCoins = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether USDt' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol' },
  { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai' },
  { id: 'eigenlayer', symbol: 'EIGEN', name: 'EigenLayer' },
  { id: 'sui', symbol: 'SUI', name: 'Sui' },
  { id: 'ethena', symbol: 'ENA', name: 'Ethena' },
  { id: 'pendle', symbol: 'PENDLE', name: 'Pendle' }
];

export const AddAssetModal: React.FC<Props> = ({ isOpen, onClose, onAdd, wallets, defaultWallet }) => {
  const [type, setType] = useState<'Compra' | 'Venda'>('Compra');
  const [selectedCoinId, setSelectedCoinId] = useState('bitcoin');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [wallet, setWallet] = useState(defaultWallet);

  // Garante que a carteira padrão é selecionada ao abrir
  useEffect(() => {
    if (isOpen) {
      setWallet(defaultWallet || (wallets.length > 0 ? wallets[0] : 'Sem Carteira'));
      setDate(new Date().toISOString().split('T')[0]);
      setQuantity('');
      setAmount('');
    }
  }, [isOpen, defaultWallet, wallets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coin = commonCoins.find(c => c.id === selectedCoinId);
    if (!coin || !quantity || !amount || !date || !wallet) return;

    onAdd(
      {
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        quantity: Number(quantity),
        investedAmount: Number(amount)
      },
      type,
      date,
      wallet
    );
    
    onClose();
  };

  const unitPrice = Number(quantity) > 0 ? Number(amount) / Number(quantity) : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121824] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              +
            </div>
            <h2 className="text-lg font-bold text-white">Registar Transação</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition rounded-md hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex gap-2 border-b border-slate-800/80 bg-[#0b0e14]/50">
          <button
            type="button"
            onClick={() => setType('Compra')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              type === 'Compra' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            COMPRA
          </button>
          <button
            type="button"
            onClick={() => setType('Venda')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              type === 'Venda' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            VENDA
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data da Transação</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Carteira</label>
              <div className="relative">
                <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition appearance-none"
                  required
                >
                  {wallets.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                  {wallets.length === 0 && <option value="Sem Carteira">Sem Carteira</option>}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Criptoativo</label>
            <select
              value={selectedCoinId}
              onChange={(e) => setSelectedCoinId(e.target.value)}
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
              required
            >
              {commonCoins.map(coin => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Quantidade {type === 'Compra' ? 'Comprada' : 'Vendida'}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 0.05"
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Total (USD)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 150.00"
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
              required
            />
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center bg-[#0b0e14] p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400">Preço unitário desta operação:</span>
              <span className="text-sm font-bold text-emerald-400">
                ${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-bold text-black bg-emerald-500 hover:bg-emerald-600 rounded-lg transition shadow-lg shadow-emerald-500/20"
            >
              Registar {type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};