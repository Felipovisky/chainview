import React, { useState, useMemo, useEffect } from 'react';
import { X, PlusCircle, Search, Check, ChevronDown, ArrowDownRight, ArrowUpRight, ArrowRightLeft, ArrowDown, Loader2 } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';

// Mantemos os principais como Fallback de segurança (caso a API falhe)
const FALLBACK_COINS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'tether', name: 'Tether USDt', symbol: 'USDT' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'usd-coin', name: 'USDC', symbol: 'USDC' },
];

export type TransactionType = 'Compra' | 'Venda' | 'Troca';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    newAsset: Omit<CryptoAsset, 'currentPrice' | 'trend'>, 
    type: TransactionType, 
    date: string,
    targetAsset?: Omit<CryptoAsset, 'currentPrice' | 'trend'>
  ) => void;
}

export const AddAssetModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [transactionType, setTransactionType] = useState<TransactionType>('Compra');
  const [fullCoinList, setFullCoinList] = useState(FALLBACK_COINS);
  const [isLoadingCoins, setIsLoadingCoins] = useState(false);
  
  // Estado da Moeda Principal (Entrada ou Saída)
  const [selectedCoin, setSelectedCoin] = useState(FALLBACK_COINS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  
  // Estado da Moeda de Destino (Para Swaps)
  const [targetCoin, setTargetCoin] = useState(FALLBACK_COINS[1]);
  const [targetSearchTerm, setTargetSearchTerm] = useState('');
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [targetQuantity, setTargetQuantity] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalInvested, setTotalInvested] = useState(''); // Valor em USD

  useEffect(() => {
    if (!isOpen) return;

    const fetchAllCoins = async () => {
      try {
        setIsLoadingCoins(true);
        const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
        if (!response.ok) throw new Error('API Rate Limit');
        const data = await response.json();
        setFullCoinList(data.map((coin: any) => ({ id: coin.id, name: coin.name, symbol: coin.symbol.toUpperCase() })));
      } catch (error) {
        console.warn('A usar lista de fallback devido a falha/limite da API.');
      } finally {
        setIsLoadingCoins(false);
      }
    };

    if (fullCoinList.length === FALLBACK_COINS.length) {
      fetchAllCoins();
    }
  }, [isOpen, fullCoinList.length]);

const filteredCoins = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return fullCoinList.slice(0, 100); 
    
    return fullCoinList
      .filter((c) => c.name.toLowerCase().includes(term) || c.symbol.toLowerCase().includes(term))
      .sort((a, b) => {
        // 1. Prioridade Máxima: Símbolo exato (ex: "USDT" === "USDT")
        const aExactSymbol = a.symbol.toLowerCase() === term;
        const bExactSymbol = b.symbol.toLowerCase() === term;
        if (aExactSymbol && !bExactSymbol) return -1;
        if (!aExactSymbol && bExactSymbol) return 1;

        // 2. Prioridade Secundária: Estar na lista de principais (FALLBACK_COINS)
        const aIsMain = FALLBACK_COINS.some(f => f.id === a.id);
        const bIsMain = FALLBACK_COINS.some(f => f.id === b.id);
        if (aIsMain && !bIsMain) return -1;
        if (!aIsMain && bIsMain) return 1;

        // 3. Desempate: Nomes mais curtos primeiro (evita os "Bridged" gigantes)
        return a.name.length - b.name.length;
      })
      .slice(0, 100);
  }, [searchTerm, fullCoinList]);

  const filteredTargetCoins = useMemo(() => {
    const term = targetSearchTerm.toLowerCase().trim();
    if (!term) return fullCoinList.slice(0, 100); 
    
    return fullCoinList
      .filter((c) => c.name.toLowerCase().includes(term) || c.symbol.toLowerCase().includes(term))
      .sort((a, b) => {
        const aExactSymbol = a.symbol.toLowerCase() === term;
        const bExactSymbol = b.symbol.toLowerCase() === term;
        if (aExactSymbol && !bExactSymbol) return -1;
        if (!aExactSymbol && bExactSymbol) return 1;

        const aIsMain = FALLBACK_COINS.some(f => f.id === a.id);
        const bIsMain = FALLBACK_COINS.some(f => f.id === b.id);
        if (aIsMain && !bIsMain) return -1;
        if (!aIsMain && bIsMain) return 1;

        return a.name.length - b.name.length;
      })
      .slice(0, 100);
  }, [targetSearchTerm, fullCoinList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const invested = parseFloat(totalInvested);

    if (isNaN(qty) || qty <= 0 || isNaN(invested) || invested <= 0) {
      alert('Introduza valores válidos para quantidade e valor em USD.');
      return;
    }

    if (transactionType === 'Troca') {
      const targetQty = parseFloat(targetQuantity);
      if (isNaN(targetQty) || targetQty <= 0) {
        alert('Introduza a quantidade recebida da moeda de destino.');
        return;
      }
      onAdd(
        { id: selectedCoin.id, name: selectedCoin.name, symbol: selectedCoin.symbol, quantity: qty, investedAmount: invested },
        transactionType, 
        date,
        { id: targetCoin.id, name: targetCoin.name, symbol: targetCoin.symbol, quantity: targetQty, investedAmount: invested }
      );
    } else {
      onAdd(
        { id: selectedCoin.id, name: selectedCoin.name, symbol: selectedCoin.symbol, quantity: qty, investedAmount: invested },
        transactionType, 
        date
      );
    }

    // Limpar estado
    setTransactionType('Compra'); 
    setQuantity(''); 
    setTargetQuantity(''); 
    setTotalInvested('');
    setSearchTerm(''); 
    setTargetSearchTerm(''); 
    setDate(new Date().toISOString().split('T')[0]);
    setIsDropdownOpen(false); 
    setIsTargetDropdownOpen(false); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#121824] border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <PlusCircle size={20} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">Registar Transação</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition">
            <X size={18} />
          </button>
        </div>

        {/* Abas Compra / Venda / Troca */}
        <div className="flex p-4 pb-0 gap-2">
          <button type="button" onClick={() => setTransactionType('Compra')} className={`flex-1 py-2 text-xs font-semibold rounded-lg flex justify-center items-center gap-1.5 transition ${transactionType === 'Compra' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border border-transparent hover:text-white'}`}>
            <ArrowDownRight size={14} /> COMPRA
          </button>
          <button type="button" onClick={() => setTransactionType('Venda')} className={`flex-1 py-2 text-xs font-semibold rounded-lg flex justify-center items-center gap-1.5 transition ${transactionType === 'Venda' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800/50 text-slate-400 border border-transparent hover:text-white'}`}>
            <ArrowUpRight size={14} /> VENDA
          </button>
          <button type="button" onClick={() => setTransactionType('Troca')} className={`flex-1 py-2 text-xs font-semibold rounded-lg flex justify-center items-center gap-1.5 transition ${transactionType === 'Troca' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 border border-transparent hover:text-white'}`}>
            <ArrowRightLeft size={14} /> TROCA
          </button>
        </div>

        {/* Formulário com Scroll para não cortar em ecrãs pequenos */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Data da Transação</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono" style={{ colorScheme: 'dark' }} />
          </div>

          {/* Moeda Principal */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
              <span>{transactionType === 'Troca' ? 'Moeda Vendida (Saída)' : 'Selecione o Criptoativo'}</span>
              {isLoadingCoins && <span className="text-emerald-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> API...</span>}
            </label>
            <button type="button" onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsTargetDropdownOpen(false); }} className="w-full bg-[#0b0e14] border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between transition focus:outline-none focus:border-emerald-500">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400 flex items-center justify-center overflow-hidden">{selectedCoin.symbol.slice(0, 3)}</span>
                <span className="text-white font-medium">{selectedCoin.name}</span>
                <span className="text-slate-500 text-xs font-mono">({selectedCoin.symbol})</span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d121c] border border-slate-800 rounded-lg shadow-xl z-30 overflow-hidden">
                <div className="p-2 border-b border-slate-800/80 flex items-center gap-2">
                  <Search size={15} className="text-slate-400 ml-1" />
                  <input type="text" autoFocus placeholder="Pesquisar moeda..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none py-1" />
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar">
                  {filteredCoins.length > 0 ? filteredCoins.map((coin) => {
                    const isSelected = coin.id === selectedCoin.id;
                    return (
                      <button key={coin.id} type="button" onClick={() => { setSelectedCoin(coin); setIsDropdownOpen(false); setSearchTerm(''); }} className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800/60 transition ${isSelected ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300'}`}>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-[9px] font-bold text-slate-400 flex justify-center items-center overflow-hidden">{coin.symbol.slice(0, 3)}</span>
                          <span>{coin.name}</span>
                          <span className="text-slate-500 font-mono">({coin.symbol})</span>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-400" />}
                      </button>
                    );
                  }) : <div className="p-4 text-center text-xs text-slate-500">Nenhuma moeda encontrada.</div>}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quantidade {transactionType === 'Compra' ? 'Comprada' : transactionType === 'Venda' ? 'Vendida' : 'de Saída'}</label>
            <input type="number" step="any" required placeholder="Ex: 0.05" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono" />
          </div>

          {/* Secção específica de Troca (Moeda Destino) */}
          {transactionType === 'Troca' && (
            <div className="pt-2 border-t border-slate-800/80 mt-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#121824] px-2 text-slate-500"><ArrowDown size={16}/></div>
              
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Moeda Comprada (Entrada)</label>
              <button type="button" onClick={() => { setIsTargetDropdownOpen(!isTargetDropdownOpen); setIsDropdownOpen(false); }} className="w-full bg-[#0b0e14] border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between transition focus:outline-none focus:border-indigo-500">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-indigo-400 flex items-center justify-center overflow-hidden">{targetCoin.symbol.slice(0, 3)}</span>
                  <span className="text-white font-medium">{targetCoin.name}</span>
                  <span className="text-slate-500 text-xs font-mono">({targetCoin.symbol})</span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isTargetDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTargetDropdownOpen && (
                <div className="absolute top-[80px] left-0 right-0 mt-2 bg-[#0d121c] border border-slate-800 rounded-lg shadow-xl z-30 overflow-hidden">
                  <div className="p-2 border-b border-slate-800/80 flex items-center gap-2">
                    <Search size={15} className="text-slate-400 ml-1" />
                    <input type="text" autoFocus placeholder="Pesquisar destino..." value={targetSearchTerm} onChange={(e) => setTargetSearchTerm(e.target.value)} className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none py-1" />
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar">
                    {filteredTargetCoins.length > 0 ? filteredTargetCoins.map((coin) => {
                      const isSelected = coin.id === targetCoin.id;
                      return (
                        <button key={coin.id} type="button" onClick={() => { setTargetCoin(coin); setIsTargetDropdownOpen(false); setTargetSearchTerm(''); }} className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800/60 transition ${isSelected ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300'}`}>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-[9px] font-bold text-slate-400 flex justify-center items-center overflow-hidden">{coin.symbol.slice(0, 3)}</span>
                            <span>{coin.name}</span>
                            <span className="text-slate-500 font-mono">({coin.symbol})</span>
                          </div>
                          {isSelected && <Check size={14} className="text-indigo-400" />}
                        </button>
                      );
                    }) : <div className="p-4 text-center text-xs text-slate-500">Nenhuma moeda encontrada.</div>}
                  </div>
                </div>
              )}

              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Quantidade Recebida</label>
              <input type="number" step="any" required placeholder="Ex: 1500" value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition font-mono" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Valor da Operação em Dólar (USD)</label>
            <input type="number" step="any" required placeholder="Ex: 50.00" value={totalInvested} onChange={(e) => setTotalInvested(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono" />
            {transactionType === 'Troca' && <span className="text-[10px] text-slate-500 mt-1 block leading-tight">Este valor base serve apenas para calcular o preço médio histórico de ambas as moedas no seu portefólio.</span>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition">Cancelar</button>
            <button 
              type="submit" 
              className={`px-4 py-2 font-semibold text-xs rounded-lg transition shadow-lg ${
                transactionType === 'Compra' ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/10' : 
                transactionType === 'Venda' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10' : 
                'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/10'
              }`}
            >
              Registar {transactionType}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};