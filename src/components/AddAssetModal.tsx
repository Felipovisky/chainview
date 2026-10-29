import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Check, ChevronDown, Loader2 } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    newEntry: Omit<CryptoAsset, 'currentPrice' | 'trend'>,
    type: 'Compra' | 'Venda' | 'Troca',
    transactionDate: string,
    walletName: string
  ) => void;
  wallets: string[];
  defaultWallet: string;
}

// Lista base rápida apenas para quando a pesquisa está vazia
const POPULAR_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether USDT' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
];

export const AddAssetModal: React.FC<Props> = ({ isOpen, onClose, onAdd, wallets, defaultWallet }) => {
  const [type, setType] = useState<'Compra' | 'Venda'>('Compra');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [wallet, setWallet] = useState(defaultWallet);
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');

  // Estados do Dropdown com Pesquisa API
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof POPULAR_COINS>([]);
  const [selectedCoin, setSelectedCoin] = useState(POPULAR_COINS[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpa a pesquisa ao fechar o modal
  useEffect(() => {
    if (!isDropdownOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isDropdownOpen]);

  // Motor de Pesquisa ao vivo (CoinGecko Search API com Debounce)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchQuery}`);
        const data = await res.json();
        
        if (data.coins) {
          const results = data.coins.slice(0, 15).map((c: any) => ({
            id: c.id,
            symbol: c.symbol.toUpperCase(),
            name: c.name
          }));
          setSearchResults(results);
        }
      } catch (e) {
        console.error("Erro ao procurar moedas:", e);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms de atraso para não causar erro 429 na API

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayCoins = searchQuery.trim().length >= 2 
    ? searchResults 
    : POPULAR_COINS.filter(coin => 
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || !amount || !selectedCoin) return;

    onAdd(
      {
        id: selectedCoin.id,
        symbol: selectedCoin.symbol,
        name: selectedCoin.name,
        quantity: Number(quantity),
        investedAmount: Number(amount),
      },
      type,
      date,
      wallet
    );
    
    setQuantity('');
    setAmount('');
    setType('Compra');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121824] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-[#0b0e14]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">+</div>
            Registar Transação
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex bg-[#0b0e14] p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setType('Compra')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                type === 'Compra' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              COMPRA
            </button>
            <button
              type="button"
              onClick={() => setType('Venda')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                type === 'Venda' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              VENDA
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Data da Transação</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Carteira</label>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
              >
                {wallets.length === 0 ? <option value="Sem Carteira">Sem Carteira</option> : wallets.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector Dinâmico de Criptoativos */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Criptoativo</label>
            
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white flex items-center justify-between cursor-pointer hover:border-slate-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedCoin.name}</span>
                <span className="text-slate-500 text-xs">({selectedCoin.symbol})</span>
              </span>
              <ChevronDown size={16} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-[#1a2235] border border-slate-600 rounded-lg shadow-2xl overflow-hidden">
                <div className="p-2 bg-[#0b0e14] border-b border-slate-700">
                  <div className="flex items-center gap-2 bg-[#121824] px-2 py-2 rounded-md border border-slate-700 focus-within:border-emerald-500 transition-colors">
                    <Search size={14} className="text-slate-500" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Procurar qualquer moeda na rede..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>
                
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {isSearching ? (
                    <div className="px-4 py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Loader2 size={20} className="animate-spin text-emerald-500" />
                      <span className="text-xs">A ligar ao mercado...</span>
                    </div>
                  ) : displayCoins.length > 0 ? (
                    displayCoins.map(coin => (
                      <div
                        key={coin.id}
                        onClick={() => {
                          setSelectedCoin(coin);
                          setIsDropdownOpen(false);
                        }}
                        className="px-4 py-2.5 hover:bg-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200">{coin.name}</span>
                          <span className="text-xs text-slate-500">{coin.symbol}</span>
                        </div>
                        {selectedCoin.id === coin.id && <Check size={14} className="text-emerald-500" />}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-slate-500 text-center">Ativo não encontrado.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quantidade
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ex: 0.5"
                className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Valor Total (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Confirmar Transação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};