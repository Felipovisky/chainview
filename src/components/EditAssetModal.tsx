import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';

interface Props {
  isOpen: boolean;
  asset: CryptoAsset | null;
  onClose: () => void;
  onSave: (assetId: string, wallet: string, quantity: number, invested: number) => void;
  wallets: string[];
}

export const EditAssetModal: React.FC<Props> = ({ isOpen, asset, onClose, onSave, wallets }) => {
  const [wallet, setWallet] = useState(wallets[0] || 'Sem Carteira');
  const [quantity, setQuantity] = useState('');
  const [invested, setInvested] = useState('');

  useEffect(() => {
    if (asset) {
      setQuantity(asset.quantity.toString());
      setInvested(asset.investedAmount.toString());
      // Mantemos a carteira atual se houver wallets
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(asset.id, wallet, Number(quantity), Number(invested));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121824] border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-[#0b0e14]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Editar Ativo
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 bg-[#0b0e14] p-3 rounded-lg border border-slate-800 mb-2">
            <span className="text-sm font-medium text-slate-200">{asset.name}</span>
            <span className="text-xs text-slate-500">{asset.symbol}</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mover para Carteira</label>
            <select
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {wallets.length === 0 ? <option value="Sem Carteira">Sem Carteira</option> : wallets.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Saldo / Quantidade</label>
            <input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Investimento Total (USD)</label>
            <input type="number" step="any" value={invested} onChange={(e) => setInvested(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" required />
          </div>

          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all mt-4">
            Guardar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};