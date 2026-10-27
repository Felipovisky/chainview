import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { PortfolioTable } from './components/PortfolioTable';
import { AllocationChart } from './components/AllocationChart';
import { TopPerformers } from './components/TopPerformers';
import { MarketIndicators } from './components/MarketIndicators';
import { PortfolioStrategy } from './components/PortfolioStrategy';
import { AddAssetModal } from './components/AddAssetModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { TransactionHistory } from './components/TransactionHistory';
import { fetchLivePrices } from './services/cryptoApi';
import type { CryptoAsset, Transaction } from './types/crypto';
import { Search, Plus, Eye, EyeOff, LayoutDashboard, Wallet, PieChart, Compass } from 'lucide-react';

export default function App() {
  const [assets, setAssets] = useState<CryptoAsset[]>(() => {
    const saved = localStorage.getItem('crypto_portfolio_assets');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('crypto_portfolio_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ativos' | 'graficos' | 'estrategia'>('dashboard');

  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    const saved = localStorage.getItem('crypto_portfolio_privacy');
    return saved ? JSON.parse(saved) : false;
  });

  const [portfolios, setPortfolios] = useState<{name: string, color: string}[]>(() => {
    const saved = localStorage.getItem('crypto_portfolios_list');
    return saved ? JSON.parse(saved) : [
      { name: 'Binance', color: 'bg-gradient-to-br from-yellow-400 to-amber-500' }
    ];
  });
  const [activePortfolio, setActivePortfolio] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('crypto_portfolio_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('crypto_portfolio_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('crypto_portfolio_privacy', JSON.stringify(isPrivacyMode)); }, [isPrivacyMode]);
  useEffect(() => { localStorage.setItem('crypto_portfolios_list', JSON.stringify(portfolios)); }, [portfolios]);

  const safeNum = (n: any) => { const val = Number(n); return (isNaN(val) || !isFinite(val)) ? 0 : val; };

  const parseDateForSort = (ptDate: string) => {
    const [d, m, y] = ptDate.split('/');
    return parseInt(`${y}${m}${d}`, 10) || 0;
  };

  const calculateAssetBalances = (assetId: string, txs: Transaction[]) => {
    const assetTxs = txs.filter(t => t.assetId === assetId).sort((a, b) => parseDateForSort(a.date) - parseDateForSort(b.date));
    let qty = 0; let invested = 0;
    assetTxs.forEach(t => {
      const tQty = safeNum(t.quantity);
      const tAmt = safeNum(t.amount);
      if (t.type === 'Compra') {
        qty += tQty; invested += tAmt;
      } else {
        const avgPrice = qty > 0 ? invested / qty : 0;
        qty = Math.max(0, qty - tQty);
        invested = qty * avgPrice;
      }
    });
    return { quantity: qty, investedAmount: invested };
  };

  const syncAssetsWithTransactions = (txs: Transaction[], currentAssets: CryptoAsset[]) => {
    const uniqueIds = Array.from(new Set(txs.map(t => t.assetId)));
    const newAssets = [...currentAssets];

    uniqueIds.forEach(id => {
      const { quantity, investedAmount } = calculateAssetBalances(id, txs);
      const index = newAssets.findIndex(a => a.id === id);
      if (index >= 0) {
        newAssets[index] = { ...newAssets[index], quantity, investedAmount };
      }
    });
    setAssets(newAssets);
    return newAssets;
  };

  const updatePrices = async () => {
    try {
      const coinIds = assets.map((a) => a.id);
      if (coinIds.length === 0) return;
      const livePrices = await fetchLivePrices(coinIds);
      if (livePrices) {
        setAssets((prev) => prev.map((asset) => {
          const coinData = livePrices[asset.id];
          if (coinData && coinData.usd !== undefined) {
            const price = safeNum(coinData.usd);
            const change24h = safeNum(coinData.usd_24h_change);
            return { ...asset, currentPrice: price, trend: change24h > 5 ? 'Alta Forte' : change24h > 0 ? 'Alta' : 'Baixa' };
          }
          return asset;
        }));
        setLastUpdated(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) { console.warn("Erro API", e); }
  };

  useEffect(() => {
    updatePrices();
    const interval = setInterval(updatePrices, 60000);
    return () => clearInterval(interval);
  }, [assets.length]);

  const handleAddAsset = async (newEntry: Omit<CryptoAsset, 'currentPrice' | 'trend'>, type: 'Compra' | 'Venda' | 'Troca', transactionDate: string, walletName: string, targetEntry?: Omit<CryptoAsset, 'currentPrice' | 'trend'>) => {
    const [year, month, day] = transactionDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    let updatedTxs = [...transactions];

    if (type === 'Troca' && targetEntry) {
      const txOut: Transaction = { id: `tx-out-${Date.now()}`, assetId: newEntry.id, type: 'Venda', date: formattedDate, amount: safeNum(newEntry.investedAmount), priceAtDate: 0, quantity: safeNum(newEntry.quantity), wallet: walletName };
      const txIn: Transaction = { id: `tx-in-${Date.now()}`, assetId: targetEntry.id, type: 'Compra', date: formattedDate, amount: safeNum(targetEntry.investedAmount), priceAtDate: 0, quantity: safeNum(targetEntry.quantity), wallet: walletName };
      updatedTxs = [txIn, txOut, ...updatedTxs];
    } else {
      const newTx: Transaction = { id: `tx-${Date.now()}`, assetId: newEntry.id, type: type as 'Compra'|'Venda', date: formattedDate, amount: safeNum(newEntry.investedAmount), priceAtDate: 0, quantity: safeNum(newEntry.quantity), wallet: walletName };
      updatedTxs = [newTx, ...updatedTxs];
    }
    
    setTransactions(updatedTxs);
    
    setAssets((prev) => {
      const existing = prev.find(a => a.id === newEntry.id);
      if (!existing) {
        return [...prev, { ...newEntry, currentPrice: 0, trend: 'Estável' }];
      }
      return prev;
    });

    setTimeout(() => {
      setAssets((currentAssets) => syncAssetsWithTransactions(updatedTxs, currentAssets));
      updatePrices();
    }, 50);
  };

  const handleSaveEditedTransaction = (updatedTx: Transaction) => {
    const updatedTxs = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(updatedTxs); syncAssetsWithTransactions(updatedTxs, assets);
  };

  const handleDeleteTransaction = (txId: string) => {
    const remaining = transactions.filter((t) => t.id !== txId);
    setTransactions(remaining); syncAssetsWithTransactions(remaining, assets);
  };

  const handleRemoveAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.assetId !== id));
    if (selectedAsset?.id === id) setSelectedAsset(null);
  };

  const handleCreatePortfolio = () => {
    const name = window.prompt('Introduza o nome da nova carteira (ex: Phantom, Kraken):');
    if (!name || name.trim() === '') return;
    if (portfolios.some(p => p.name.toLowerCase() === name.toLowerCase())) { alert('Já existe uma carteira com esse nome!'); return; }
    const colors = ['bg-gradient-to-br from-blue-500 to-purple-500', 'bg-gradient-to-br from-emerald-400 to-teal-500', 'bg-gradient-to-br from-rose-500 to-orange-500', 'bg-gradient-to-br from-indigo-500 to-blue-500', 'bg-gradient-to-br from-amber-500 to-red-500'];
    setPortfolios([...portfolios, { name: name.trim(), color: colors[Math.floor(Math.random() * colors.length)] }]);
  };

  const handleDeletePortfolio = (name: string) => {
    if (window.confirm(`Excluir "${name}"?\nAs transações não serão apagadas.`)) {
      setPortfolios(portfolios.filter(p => p.name !== name));
      if (activePortfolio === name) setActivePortfolio(null);
    }
  };

  const grandTotalBalance = safeNum(assets.reduce((acc, curr) => acc + safeNum(curr.quantity) * safeNum(curr.currentPrice), 0));

  const sidebarPortfolios = portfolios.map(p => {
    let balance = 0;
    const pTxs = transactions.filter(t => t.wallet === p.name);
    const uniqueIds = Array.from(new Set(pTxs.map(t => t.assetId)));
    uniqueIds.forEach(id => {
      const assetPrice = safeNum(assets.find(a => a.id === id)?.currentPrice);
      const { quantity } = calculateAssetBalances(id, pTxs);
      balance += quantity * assetPrice;
    });
    return { ...p, balance: Math.max(0, balance) };
  });

  const displayedAssets = (activePortfolio === null 
    ? assets.filter(a => {
        const balance = safeNum(a.quantity) * safeNum(a.currentPrice);
        const invested = safeNum(a.investedAmount);
        return balance >= 0.99 || invested >= 0.99;
      }) 
    : assets.map(a => {
        const { quantity, investedAmount } = calculateAssetBalances(a.id, transactions.filter(t => t.wallet === activePortfolio));
        return { ...a, quantity, investedAmount };
      }).filter(a => {
        const balance = safeNum(a.quantity) * safeNum(a.currentPrice);
        const invested = safeNum(a.investedAmount);
        return balance >= 0.99 || invested >= 0.99;
      })
  ).sort((a, b) => {
    const balanceA = safeNum(a.quantity) * safeNum(a.currentPrice);
    const balanceB = safeNum(b.quantity) * safeNum(b.currentPrice);
    return balanceB - balanceA;
  });

  const displayedTransactions = activePortfolio === null ? transactions : transactions.filter(t => t.wallet === activePortfolio);

  const totalInvested = safeNum(displayedAssets.reduce((acc, curr) => acc + safeNum(curr.investedAmount), 0));
  const currentBalance = safeNum(displayedAssets.reduce((acc, curr) => acc + safeNum(curr.quantity) * safeNum(curr.currentPrice), 0));
  const totalProfit = currentBalance - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const activeSelectedAsset = selectedAsset ? displayedAssets.find((a) => a.id === selectedAsset.id) || selectedAsset : null;

  const generateSparklines = () => {
    if (displayedTransactions.length === 0) return { aportes: [], saldo: [], lucro: [] };

    const sortedTxs = [...displayedTransactions].sort((a, b) => parseDateForSort(a.date) - parseDateForSort(b.date));
    
    let runningAporte = 0;
    const points: {date: string, aporte: number}[] = [];
    
    sortedTxs.forEach(tx => {
      const amt = safeNum(tx.amount);
      if (tx.type === 'Compra') {
        runningAporte += amt;
      } else if (tx.type === 'Venda') {
        runningAporte = Math.max(0, runningAporte - amt);
      }
      const [d, m] = tx.date.split('/');
      points.push({ date: `${d}/${m}`, aporte: runningAporte });
    });

    const uniqueDays = Array.from(new Map(points.map(p => [p.date, p])).values());
    
    if (uniqueDays.length === 1) {
      const today = new Date();
      const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
      if (uniqueDays[0].date !== todayStr) {
        uniqueDays.push({ date: todayStr, aporte: uniqueDays[0].aporte });
      }
    }
    
    const multiplier = runningAporte > 0 ? currentBalance / runningAporte : 1;

    return {
      aportes: uniqueDays.map(p => ({ date: p.date, value: p.aporte })),
      saldo: uniqueDays.map(p => ({ date: p.date, value: p.aporte * multiplier })),
      lucro: uniqueDays.map(p => ({ date: p.date, value: (p.aporte * multiplier) - p.aporte }))
    };
  };

  const sparklines = generateSparklines();

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden text-slate-100 font-sans">
      <Sidebar 
        totalBalance={grandTotalBalance} 
        portfolios={sidebarPortfolios} 
        activePortfolio={activePortfolio} 
        onSelectPortfolio={setActivePortfolio} 
        onCreatePortfolio={handleCreatePortfolio} 
        onDeletePortfolio={handleDeletePortfolio}
      />

      <main className="flex-1 overflow-y-auto bg-[#0b0e14]">
        <header className="h-20 border-b border-slate-800/80 px-8 bg-[#0d1117]/90 backdrop-blur sticky top-0 z-10 flex items-center justify-center">
          <div className="w-full max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-5">
              <h1 className="text-xl font-bold tracking-tight text-white">{activePortfolio ? `Portfolio: ${activePortfolio}` : 'Visão Geral'}</h1>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Pesquisar ativos..." className="bg-[#121824] border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-64 shadow-inner" />
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              {lastUpdated && <span className="text-xs text-slate-500 hidden sm:inline font-mono">Atualizado às {lastUpdated}</span>}
              <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition" title={isPrivacyMode ? "Mostrar Valores" : "Ocultar Valores"}>
                {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs shadow-lg shadow-emerald-500/10 active:scale-95">
                <Plus size={15} /> Nova Transação
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex justify-center w-full">
          <section className="p-8 w-full max-w-7xl">
            {activeSelectedAsset ? (
              <TransactionHistory asset={activeSelectedAsset} transactions={displayedTransactions} onBack={() => setSelectedAsset(null)} onOpenAddModal={() => setIsModalOpen(true)} onDeleteTransaction={handleDeleteTransaction} onEditTransaction={(tx) => { setEditingTransaction(tx); setIsEditModalOpen(true); }} />
            ) : (
              <>
                {/* MENU DE NAVEGAÇÃO DE ABAS */}
                <div className="flex items-center gap-8 border-b border-slate-800/80 mb-8">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <LayoutDashboard size={16} /> Resumo Geral
                  </button>
                  <button 
                    onClick={() => setActiveTab('ativos')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ativos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <Wallet size={16} /> Meus Ativos
                  </button>
                  <button 
                    onClick={() => setActiveTab('graficos')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'graficos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <PieChart size={16} /> Distribuição & Radar
                  </button>
                  <button 
                    onClick={() => setActiveTab('estrategia')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'estrategia' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <Compass size={16} /> Estratégia Analítica
                  </button>
                </div>

                {/* ABA 1: RESUMO GERAL */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <StatCard title="Aportes" value={`$${totalInvested.toFixed(2)}`} valueColor="text-white" isPrivacyMode={isPrivacyMode} sparklineData={sparklines.aportes} chartColor="#f59e0b" chartType="stepAfter" idGradient="grad-aportes" />
                      <StatCard title="Saldo" value={`$${currentBalance.toFixed(2)}`} valueColor="text-emerald-400 font-bold" isPrivacyMode={isPrivacyMode} sparklineData={sparklines.saldo} chartColor="#10b981" chartType="monotone" idGradient="grad-saldo" />
                      <StatCard title="Lucro" value={`$${totalProfit.toFixed(2)}`} valueColor={totalProfit >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"} badge={`${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(2)}%`} badgePositive={totalProfit >= 0} isPrivacyMode={isPrivacyMode} sparklineData={sparklines.lucro} chartColor={totalProfit >= 0 ? "#10b981" : "#f43f5e"} chartType="monotone" idGradient="grad-lucro" />
                    </div>
                    <TopPerformers assets={displayedAssets} />
                  </div>
                )}

                {/* ABA 2: MEUS ATIVOS */}
                {activeTab === 'ativos' && (
                  <div className="space-y-6">
                    <PortfolioTable assets={displayedAssets} onRemove={handleRemoveAsset} onSelectAsset={(asset) => setSelectedAsset(asset)} />
                  </div>
                )}

                {/* ABA 3: DISTRIBUIÇÃO & RADAR */}
                {activeTab === 'graficos' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AllocationChart assets={displayedAssets} />
                    <MarketIndicators assets={displayedAssets} />
                  </div>
                )}

                {/* ABA 4: ESTRATÉGIA */}
                {activeTab === 'estrategia' && (
                  <PortfolioStrategy assets={displayedAssets} />
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <AddAssetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddAsset} wallets={portfolios.map(p => p.name)} defaultWallet={activePortfolio || (portfolios.length > 0 ? portfolios[0].name : 'Sem Carteira')} />
      <EditTransactionModal isOpen={isEditModalOpen} transaction={editingTransaction} onClose={() => { setIsEditModalOpen(false); setEditingTransaction(null); }} onSave={handleSaveEditedTransaction} />
    </div>
  );
}