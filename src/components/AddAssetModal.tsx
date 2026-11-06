import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, ArrowRight, ArrowLeftRight } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Omit<CryptoAsset, 'currentPrice' | 'trend'>, type: 'Compra' | 'Venda' | 'Troca', date: string, wallet: string, sourceAsset?: CryptoAsset) => void;
  wallets: string[];
  defaultWallet: string;
  initialType?: 'Compra' | 'Venda' | 'Troca';
  sourceAsset?: CryptoAsset;
}

export const AddAssetModal: React.FC<Props> = ({ isOpen, onClose, onAdd, wallets, defaultWallet, initialType = 'Compra', sourceAsset }) => {
  const [type, setType] = useState<'Compra' | 'Venda' | 'Troca'>(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [wallet, setWallet] = useState(defaultWallet);
  const [quantity, setQuantity] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [fees, setFees] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setWallet(defaultWallet);
      if (sourceAsset && initialType === 'Troca') {
        const sourceTotalValue = sourceAsset.quantity * sourceAsset.currentPrice;
        setInvestedAmount(sourceTotalValue.toString());
        // Pré-define a quantidade exata vendida na troca para o motor não limpar o saldo todo
        // (Guardamos temporariamente no state se necessário ou tratamos no App)
      }
    } else {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedCoin(null);
      setQuantity('');
      setInvestedAmount('');
      setFees('');
    }
  }, [isOpen, initialType, defaultWallet, sourceAsset]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchQuery}`);
        const data = await res.json();
        
        if (data.coins) {
          const sortedCoins = data.coins.sort((a: any, b: any) => {
            const rankA = a.market_cap_rank || 999999;
            const rankB = b.market_cap_rank || 999999;
            return rankA - rankB;
          });
          setSearchResults(sortedCoins.slice(0, 5));
        }
      } catch (error) {
        console.error("Erro na busca", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin) return;

    const cleanName = String(selectedCoin.name || '').includes('EigenCloud') ? 'EigenLayer' : selectedCoin.name;
    const baseInvested = Number(investedAmount);
    const txFees = Number(fees) || 0;
    
    const finalInvestedAmount = type === 'Compra' 
      ? baseInvested + txFees 
      : Math.max(0, baseInvested - txFees); 

    const newAsset = {
      id: selectedCoin.id,
      symbol: selectedCoin.symbol.toUpperCase(),
      name: cleanName,
      quantity: Number(quantity),
      investedAmount: finalInvestedAmount,
    };

    onAdd(newAsset, type, transactionDate, wallet, sourceAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121824] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-[#0b0e14] shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-500 bg-emerald-500/10 p-1 rounded-md text-sm">+</span> Registar Transação
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <div className="flex p-1 bg-[#0b0e14] rounded-lg border border-slate-800 mb-6">
            <button type="button" onClick={() => setType('Compra')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${type === 'Compra' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}>COMPRA</button>
            <button type="button" onClick={() => setType('Venda')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${type === 'Venda' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}>VENDA</button>
            <button type="button" onClick={() => setType('Troca')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${type === 'Troca' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}>SWAP</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {type === 'Troca' && sourceAsset && (
              <div className="bg-[#0b0e14] border border-slate-700 rounded-lg p-3 flex items-center justify-between mb-2">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ativo de Origem (Vendido)</div>
                  <div className="font-bold text-slate-200">{sourceAsset.name} <span className="text-xs text-slate-500">{sourceAsset.symbol}</span></div>
                </div>
                <ArrowLeftRight className="text-blue-400" size={20} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Data</label>
                <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Carteira</label>
                <select value={wallet} onChange={(e) => setWallet(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                  {wallets.length === 0 ? <option value="Sem Carteira">Sem Carteira</option> : wallets.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {type === 'Troca' ? 'Ativo de Destino (Comprado)' : 'Criptoativo'}
              </label>
              
              {!selectedCoin ? (
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Pesquisar moeda (ex: Bitcoin, USDT)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  {isSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" />}
                  
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b0e14] border border-slate-700 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                      {searchResults.map((coin) => (
                        <button key={coin.id} type="button" onClick={() => setSelectedCoin(coin)} className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 transition text-left border-b border-slate-800/50 last:border-0">
                          <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full bg-slate-800" />
                          <div>
                            <div className="font-medium text-slate-200 text-sm">{String(coin.name || '').includes('EigenCloud') ? 'EigenLayer' : coin.name}</div>
                            <div className="text-xs text-slate-500 uppercase">{coin.symbol}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#0b0e14] border border-emerald-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <img src={selectedCoin.thumb} alt={selectedCoin.name} className="w-8 h-8 rounded-full bg-slate-800" />
                    <div>
                      <div className="font-bold text-emerald-400 text-sm">{String(selectedCoin.name || '').includes('EigenCloud') ? 'EigenLayer' : selectedCoin.name}</div>
                      <div className="text-xs text-slate-400 uppercase">{selectedCoin.symbol}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedCoin(null)} className="text-xs text-slate-400 hover:text-white underline">Alterar</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quantidade ({selectedCoin ? selectedCoin.symbol.toUpperCase() : 'Moedas'})</label>
                <input type="number" step="any" min="0" placeholder="0.00" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" required />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input type="number" step="any" min="0" placeholder="0.00" value={investedAmount} onChange={(e) => setInvestedAmount(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg pl-7 pr-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" required />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Taxas / Gas (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input type="number" step="any" min="0" placeholder="0.00" value={fees} onChange={(e) => setFees(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg pl-7 pr-3 py-3 text-sm text-white focus:outline-none focus:border-rose-500" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <button type="submit" disabled={!selectedCoin} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-3.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:shadow-none">
                {type === 'Compra' ? 'Registar Compra' : type === 'Venda' ? 'Registar Venda' : 'Registar Conversão'}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};