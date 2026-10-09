import React, { useState, useMemo } from 'react';
import { X, PlusCircle, Search, Check, ChevronDown } from 'lucide-react';
import type { CryptoAsset } from '../types/crypto';

// Lista ampliada com os 50 principais ativos do mercado suportados na CoinGecko
const AVAILABLE_COINS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'tether', name: 'Tether USDt', symbol: 'USDT' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'usd-coin', name: 'USDC', symbol: 'USDC' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'tron', name: 'TRON', symbol: 'TRX' },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB' },
  { id: 'sui', name: 'Sui', symbol: 'SUI' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR' },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE' },
  { id: 'aptos', name: 'Aptos', symbol: 'APT' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
  { id: 'polygon-ecosystem-token', name: 'Polygon', symbol: 'POL' },
  { id: 'kaspa', name: 'Kaspa', symbol: 'KAS' },
  { id: 'render-token', name: 'Render', symbol: 'RENDER' },
  { id: 'ethena', name: 'Ethena', symbol: 'ENA' },
  { id: 'pendle', name: 'Pendle', symbol: 'PENDLE' },
  { id: 'artificial-superintelligence-alliance', name: 'Fetch.ai / ASI', symbol: 'FET' },
  { id: 'bittensor', name: 'Bittensor', symbol: 'TAO' },
  { id: 'injective-protocol', name: 'Injective', symbol: 'INJ' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM' },
  { id: 'monero', name: 'Monero', symbol: 'XMR' },
  { id: 'fantom', name: 'Fantom', symbol: 'FTM' },
  { id: 'sei-network', name: 'Sei', symbol: 'SEI' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
  { id: 'optimism', name: 'Optimism', symbol: 'OP' },
  { id: 'maker', name: 'Maker', symbol: 'MKR' },
  { id: 'aave', name: 'Aave', symbol: 'AAVE' },
  { id: 'floki', name: 'Floki', symbol: 'FLOKI' },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK' },
  { id: 'dogwifhat', name: 'dogwifhat', symbol: 'WIF' },
  { id: 'ondo-finance', name: 'Ondo Finance', symbol: 'ONDO' },
  { id: 'celestia', name: 'Celestia', symbol: 'TIA' },
  { id: 'worldcoin-wld', name: 'Worldcoin', symbol: 'WLD' },
  { id: 'thorchain', name: 'THORChain', symbol: 'RUNE' },
  { id: 'the-graph', name: 'The Graph', symbol: 'GRT' },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO' },
  { id: 'jupiter-exchange-solana', name: 'Jupiter', symbol: 'JUP' },
  { id: 'pyth-network', name: 'Pyth Network', symbol: 'PYTH' },
  { id: 'stacks', name: 'Stacks', symbol: 'STX' },
  { id: 'filecoin', name: 'Filecoin', symbol: 'FIL' },
  { id: 'flow', name: 'Flow', symbol: 'FLOW' },
  { id: 'raydium', name: 'Raydium', symbol: 'RAY' }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newAsset: Omit<CryptoAsset, 'currentPrice' | 'trend'>) => void;
}

export const AddAssetModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [selectedCoin, setSelectedCoin] = useState(AVAILABLE_COINS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [totalInvested, setTotalInvested] = useState('');

  // Filtra as moedas pelo nome ou símbolo em tempo real
  const filteredCoins = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return AVAILABLE_COINS;
    return AVAILABLE_COINS.filter(
      (c) => c.name.toLowerCase().includes(term) || c.symbol.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const invested = parseFloat(totalInvested);

    if (isNaN(qty) || qty <= 0 || isNaN(invested) || invested <= 0) {
      alert('Introduza valores válidos para quantidade e valor investido.');
      return;
    }

    onAdd({
      id: selectedCoin.id,
      name: selectedCoin.name,
      symbol: selectedCoin.symbol,
      quantity: qty,
      investedAmount: invested,
    });

    // Limpar estado e fechar
    setQuantity('');
    setTotalInvested('');
    setSearchTerm('');
    setIsDropdownOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#121824] border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <PlusCircle size={20} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">Registar Novo Aporte</h2>
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
          {/* Seletor Customizado com Barra de Pesquisa */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Selecione o Criptoativo
            </label>

            {/* Botão que abre a pesquisa */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#0b0e14] border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between transition focus:outline-none focus:border-emerald-500"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400 flex items-center justify-center">
                  {selectedCoin.symbol.slice(0, 3)}
                </span>
                <span className="text-white font-medium">{selectedCoin.name}</span>
                <span className="text-slate-500 text-xs font-mono">({selectedCoin.symbol})</span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu Suspenso de Pesquisa */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d121c] border border-slate-800 rounded-lg shadow-xl z-20 overflow-hidden">
                {/* Campo de Busca com Lupa */}
                <div className="p-2 border-b border-slate-800/80 flex items-center gap-2">
                  <Search size={15} className="text-slate-400 ml-1" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Pesquisar moeda (ex: SOL, BTC, Pepe)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none py-1"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-slate-500 hover:text-white text-xs px-1"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Lista com scroll */}
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/40">
                  {filteredCoins.length > 0 ? (
                    filteredCoins.map((coin) => {
                      const isSelected = coin.id === selectedCoin.id;
                      return (
                        <button
                          key={coin.id}
                          type="button"
                          onClick={() => {
                            setSelectedCoin(coin);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800/60 transition ${
                            isSelected ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-[9px] font-bold flex items-center justify-center text-slate-400">
                              {coin.symbol.slice(0, 3)}
                            </span>
                            <span>{coin.name}</span>
                            <span className="text-slate-500 font-mono">({coin.symbol})</span>
                          </div>
                          {isSelected && <Check size={14} className="text-emerald-400" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Nenhuma criptomoeda encontrada.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quantidade Comprada
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="Ex: 0.05 ou 150"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Valor Total Pago (USD)
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="Ex: 50.00"
              value={totalInvested}
              onChange={(e) => setTotalInvested(e.target.value)}
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
          </div>

          {/* Previsão do Preço Médio desta compra */}
          {parseFloat(quantity) > 0 && parseFloat(totalInvested) > 0 && (
            <div className="bg-[#0b0e14]/60 border border-slate-800/80 rounded-lg p-3 text-xs flex justify-between text-slate-300">
              <span className="text-slate-400">Preço unitário desta compra:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                ${(parseFloat(totalInvested) / parseFloat(quantity)).toLocaleString('en-US', {
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
              Registar Aporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};