import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PortfolioTable } from './components/PortfolioTable';
import { AllocationChart } from './components/AllocationChart';
import { TopPerformers } from './components/TopPerformers';
import { MarketIndicators } from './components/MarketIndicators';
import { PortfolioStrategy } from './components/PortfolioStrategy';
import { AddAssetModal } from './components/AddAssetModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { EditAssetModal } from './components/EditAssetModal';
import { TransactionHistory } from './components/TransactionHistory';
import type { CryptoAsset, Transaction } from './types/crypto';
import { Search, Plus, Eye, EyeOff, LayoutDashboard, Wallet, PieChart, Compass, Globe, Loader2 } from 'lucide-react';

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
  const [lastUpdated, setLastUpdated] = useState('');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ativos' | 'graficos' | 'estrategia'>(() => {
    return (localStorage.getItem('chainview_active_main_tab') as any) || 'dashboard';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('chainview_sidebar_collapsed') === 'true';
  });

  const [btcMacro, setBtcMacro] = useState<{ price: number, ath: number, drop: number } | null>(null);

  useEffect(() => { localStorage.setItem('chainview_active_main_tab', activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('chainview_sidebar_collapsed', String(isSidebarCollapsed)); }, [isSidebarCollapsed]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'Compra' | 'Venda' | 'Troca'>('Compra');
  const [addModalSource, setAddModalSource] = useState<CryptoAsset | undefined>(undefined);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isEditAssetModalOpen, setIsEditAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<CryptoAsset | null>(null);

  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    const saved = localStorage.getItem('crypto_portfolio_privacy');
    return saved ? JSON.parse(saved) : false;
  });

  const [portfolios, setPortfolios] = useState<{name: string, color: string}[]>(() => {
    const saved = localStorage.getItem('crypto_portfolios_list');
    return saved ? JSON.parse(saved) : [{ name: 'Binance', color: 'bg-gradient-to-br from-yellow-400 to-amber-500' }];
  });
  const [activePortfolio, setActivePortfolio] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('crypto_portfolio_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('crypto_portfolio_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('crypto_portfolio_privacy', JSON.stringify(isPrivacyMode)); }, [isPrivacyMode]);
  useEffect(() => { localStorage.setItem('crypto_portfolios_list', JSON.stringify(portfolios)); }, [portfolios]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const current = data[0].current_price;
          const ath = data[0].ath;
          const drop = ((current - ath) / ath) * 100;
          setBtcMacro({ price: current, ath, drop });
        }
      }).catch(() => {});
  }, []);

  const safeNum = (n: any) => { const val = Number(n); return (isNaN(val) || !isFinite(val)) ? 0 : val; };

  const parseDateForSort = (ptDate: string) => {
    if (!ptDate) return 0;
    if (ptDate.includes('-')) {
      const [y, m, d] = ptDate.split('-');
      return parseInt(`${y}${m}${d}`, 10) || 0;
    }
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
      } else {
        const defaultNames: Record<string, {name: string, symbol: string}> = {
          'tether': { name: 'Tether', symbol: 'USDT' },
          'usd-coin': { name: 'USD Coin', symbol: 'USDC' },
          'dai': { name: 'Dai', symbol: 'DAI' },
          'bitcoin': { name: 'Bitcoin', symbol: 'BTC' },
          'ethereum': { name: 'Ethereum', symbol: 'ETH' }
        };
        const meta = defaultNames[id] || { name: id.toUpperCase(), symbol: id.toUpperCase() };
        newAssets.push({
          id,
          symbol: meta.symbol,
          name: meta.name,
          quantity,
          investedAmount,
          currentPrice: id.includes('tether') || id.includes('usd') || id.includes('dai') ? 1 : 0,
          trend: 'Estável'
        });
      }
    });
    setAssets(newAssets);
    return newAssets;
  };

  const updatePrices = async () => {
    try {
      const coinIds = assets.map((a) => a.id);
      if (coinIds.length === 0) return;
      
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&price_change_percentage=24h,7d,30d,1y`);
      const data = await res.json();
      
      if (data && Array.isArray(data)) {
        setAssets((prev) => prev.map((asset) => {
          const coinData = data.find((c: any) => c.id === asset.id);
          const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(asset.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(asset.symbol.toUpperCase());
          if (coinData) {
            const price = isStable ? 1 : safeNum(coinData.current_price);
            const change24 = isStable ? 0 : safeNum(coinData.price_change_percentage_24h_in_currency || coinData.price_change_percentage_24h);
            const change7 = isStable ? 0 : safeNum(coinData.price_change_percentage_7d_in_currency);
            const change30 = isStable ? 0 : safeNum(coinData.price_change_percentage_30d_in_currency);
            const change1ano = isStable ? 0 : safeNum(coinData.price_change_percentage_1y_in_currency);
            
            return { 
              ...asset, 
              imageUrl: coinData.image,
              currentPrice: price > 0 ? price : asset.currentPrice, 
              trend: change24 > 5 ? 'Alta Forte' : change24 > 0 ? 'Alta' : 'Baixa',
              change24h: change24,
              change7d: change7,
              change30d: change30,
              change1y: change1ano 
            };
          }
          return asset;
        }));
        setLastUpdated(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) { console.warn("Erro API Mercado", e); }
  };

  useEffect(() => {
    updatePrices();
    const interval = setInterval(updatePrices, 60000);
    return () => clearInterval(interval);
  }, [assets.length]);

  const handleExport = () => {
    const data = { transactions, assets, portfolios };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chainview_backup.json';
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions && data.assets) {
          setTransactions(data.transactions);
          const reconstructedAssets = data.assets.map((a: any) => {
            const { quantity, investedAmount } = calculateAssetBalances(a.id, data.transactions);
            return { ...a, quantity, investedAmount };
          }).filter((a: any) => safeNum(a.quantity) > 0.000001);
          setAssets(reconstructedAssets);
          if (data.portfolios) setPortfolios(data.portfolios);
          alert('Backup importado com sucesso!');
          setTimeout(updatePrices, 500);
        } else {
          alert('Ficheiro JSON inválido.');
        }
      } catch (error) {
        alert('Erro ao ler o ficheiro.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddAsset = async (newEntry: Omit<CryptoAsset, 'currentPrice' | 'trend'>, type: 'Compra' | 'Venda' | 'Troca', transactionDate: string, walletName: string, sourceEntry?: CryptoAsset) => {
    const [year, month, day] = transactionDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    let updatedTxs = [...transactions];

    const calculatedPrice = safeNum(newEntry.quantity) > 0 ? safeNum(newEntry.investedAmount) / safeNum(newEntry.quantity) : 0;

    if (type === 'Troca' && sourceEntry) {
      const sourceTotalValue = safeNum(newEntry.investedAmount);
      const sourceCurrentPrice = sourceEntry.currentPrice || (sourceEntry.investedAmount / sourceEntry.quantity || 1);
      const exactQtySold = sourceCurrentPrice > 0 ? sourceTotalValue / sourceCurrentPrice : sourceEntry.quantity;

      const txOut: Transaction = {
        id: `tx-out-${Date.now()}`,
        assetId: sourceEntry.id,
        type: 'Venda',
        date: formattedDate,
        amount: sourceTotalValue,
        priceAtDate: sourceCurrentPrice,
        quantity: exactQtySold,
        wallet: walletName
      };
      const txIn: Transaction = {
        id: `tx-in-${Date.now()+1}`,
        assetId: newEntry.id,
        type: 'Compra',
        date: formattedDate,
        amount: safeNum(newEntry.investedAmount),
        priceAtDate: calculatedPrice,
        quantity: safeNum(newEntry.quantity),
        wallet: walletName
      };
      updatedTxs = [txIn, txOut, ...updatedTxs];
    } else {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        assetId: newEntry.id,
        type: type as 'Compra'|'Venda',
        date: formattedDate,
        amount: safeNum(newEntry.investedAmount),
        priceAtDate: calculatedPrice > 0 ? calculatedPrice : 1,
        quantity: safeNum(newEntry.quantity),
        wallet: walletName
      };
      updatedTxs = [newTx, ...updatedTxs];
    }

    setTransactions(updatedTxs);
    setTimeout(() => {
      setAssets((currentAssets) => syncAssetsWithTransactions(updatedTxs, currentAssets));
      updatePrices();
    }, 50);
  };

  const handleEditAsset = (assetId: string, newWallet: string, newQuantity: number, newInvested: number) => {
    const remainingTxs = transactions.filter(t => t.assetId !== assetId);
    if (newQuantity > 0) {
      const consolidatedTx: Transaction = {
        id: `tx-consolidated-${Date.now()}`,
        assetId: assetId,
        type: 'Compra',
        date: new Date().toLocaleDateString('pt-PT'),
        amount: safeNum(newInvested),
        priceAtDate: safeNum(newQuantity) > 0 ? safeNum(newInvested) / safeNum(newQuantity) : 0,
        quantity: safeNum(newQuantity),
        wallet: newWallet
      };
      remainingTxs.push(consolidatedTx);
    }
    setTransactions(remainingTxs);
    syncAssetsWithTransactions(remainingTxs, assets);
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

  const grandTotalBalance = safeNum(assets.reduce((acc, curr) => {
    const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(curr.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(curr.symbol.toUpperCase());
    const price = isStable ? 1 : safeNum(curr.currentPrice);
    return acc + safeNum(curr.quantity) * price;
  }, 0));

  const sidebarPortfolios = portfolios.map(p => {
    let balance = 0;
    const pTxs = transactions.filter(t => t.wallet === p.name);
    const uniqueIds = Array.from(new Set(pTxs.map(t => t.assetId)));
    uniqueIds.forEach(id => {
      const asset = assets.find(a => a.id === id);
      const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(id.toLowerCase()) || (asset && ['USDT', 'USDC', 'DAI'].includes(asset.symbol.toUpperCase()));
      const assetPrice = isStable ? 1 : safeNum(asset?.currentPrice);
      const { quantity } = calculateAssetBalances(id, pTxs);
      balance += quantity * assetPrice;
    });
    return { ...p, balance: Math.max(0, balance) };
  });

  const displayedAssets = (activePortfolio === null 
    ? assets.filter(a => safeNum(a.quantity) > 0.000001) 
    : assets.map(a => {
        const { quantity, investedAmount } = calculateAssetBalances(a.id, transactions.filter(t => t.wallet === activePortfolio));
        return { ...a, quantity, investedAmount };
      }).filter(a => safeNum(a.quantity) > 0.000001)
  ).map(a => {
    const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(a.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(a.symbol.toUpperCase());
    return {
      ...a,
      currentPrice: isStable ? 1 : a.currentPrice
    };
  }).sort((a, b) => {
    const isStableA = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(a.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(a.symbol.toUpperCase());
    const isStableB = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(b.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(b.symbol.toUpperCase());
    const priceA = isStableA ? 1 : safeNum(a.currentPrice);
    const priceB = isStableB ? 1 : safeNum(b.currentPrice);
    const balanceA = safeNum(a.quantity) * priceA;
    const balanceB = safeNum(b.quantity) * priceB;
    return balanceB - balanceA;
  });

  const displayedTransactions = activePortfolio === null ? transactions : transactions.filter(t => t.wallet === activePortfolio);

  const totalInvested = safeNum(displayedAssets.reduce((acc, curr) => acc + safeNum(curr.investedAmount), 0));
  const currentBalance = safeNum(displayedAssets.reduce((acc, curr) => {
    const isStable = ['tether', 'usd-coin', 'dai', 'usdt', 'usdc'].includes(curr.id.toLowerCase()) || ['USDT', 'USDC', 'DAI'].includes(curr.symbol.toUpperCase());
    const price = isStable ? 1 : safeNum(curr.currentPrice);
    return acc + safeNum(curr.quantity) * price;
  }, 0));
  const totalProfit = currentBalance - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const activeSelectedAsset = selectedAsset ? displayedAssets.find((a) => a.id === selectedAsset.id) || selectedAsset : null;

  const renderDashboardStats = () => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#121824] border border-slate-800/80 rounded-xl px-8 py-5 shadow-lg gap-6 mb-5">
        <div className="flex-1 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-800/80 pb-4 md:pb-0">
          <div className="text-[11px] text-slate-500 uppercase font-bold mb-1">Aportes Totais</div>
          <div className="text-2xl font-bold text-white">
            {isPrivacyMode ? '••••••' : `$${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-800/80 pb-4 md:pb-0">
          <div className="text-[11px] text-slate-500 uppercase font-bold mb-1">Saldo em Carteira</div>
          <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">
            {isPrivacyMode ? '••••••' : `$${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="text-[11px] text-slate-500 uppercase font-bold mb-1">Rentabilidade Líquida</div>
          <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPrivacyMode ? '••••••' : (
              <>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                <span className="text-sm font-medium ml-2 opacity-80">({profitPercentage > 0 ? '+' : ''}{profitPercentage.toFixed(2)}%)</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden text-slate-100 font-sans selection:bg-emerald-500/30">
      <Sidebar 
        totalBalance={grandTotalBalance} 
        portfolios={sidebarPortfolios} 
        activePortfolio={activePortfolio} 
        onSelectPortfolio={setActivePortfolio} 
        onCreatePortfolio={handleCreatePortfolio} 
        onDeletePortfolio={handleDeletePortfolio} 
        isPrivacyMode={isPrivacyMode} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="flex-1 overflow-y-auto bg-[#0b0e14]">
        <header className="h-20 border-b border-slate-800/80 px-8 bg-[#0d1117]/90 backdrop-blur sticky top-0 z-10 flex items-center justify-center">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-5">
              <h1 className="text-xl font-bold tracking-tight text-white">{activePortfolio ? `Portfolio: ${activePortfolio}` : 'Visão Geral'}</h1>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Pesquisar ativos..." className="bg-[#121824] border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-64 shadow-inner" />
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              {lastUpdated && <span className="text-xs text-slate-500 hidden sm:inline font-mono mr-4">Atualizado às {lastUpdated}</span>}
              
              <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition" title={isPrivacyMode ? "Mostrar Valores" : "Ocultar Valores"}>
                {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button onClick={() => { setAddModalType('Compra'); setAddModalSource(undefined); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs shadow-lg shadow-emerald-500/10 active:scale-95 ml-2">
                <Plus size={15} /> Nova Transação
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex justify-center w-full">
          <section className="p-8 w-full max-w-[1700px]">
            {activeSelectedAsset ? (
              <TransactionHistory asset={activeSelectedAsset} transactions={displayedTransactions} onBack={() => setSelectedAsset(null)} onOpenAddModal={() => setIsModalOpen(true)} onDeleteTransaction={handleDeleteTransaction} onEditTransaction={(tx) => { setEditingTransaction(tx); setIsEditModalOpen(true); }} />
            ) : (
              <>
                <div className="flex items-center gap-8 border-b border-slate-800/80 mb-6 w-fit">
                  <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    <LayoutDashboard size={16} /> Resumo Geral
                  </button>
                  <button onClick={() => setActiveTab('ativos')} className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ativos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    <Wallet size={16} /> Meus Ativos
                  </button>
                  <button onClick={() => setActiveTab('graficos')} className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'graficos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    <PieChart size={16} /> Gráficos & Radar
                  </button>
                  <button onClick={() => setActiveTab('estrategia')} className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'estrategia' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    <Compass size={16} /> Estratégia Analítica
                  </button>
                </div>

                {/* ABA HUD AMPLIADA SEM SCROLL */}
                {activeTab === 'dashboard' && (
                  <div className="w-full flex flex-col gap-5 animate-in fade-in duration-300">
                    {renderDashboardStats()}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* Fibo Ampliado */}
                      <div className="bg-[#121824] border border-slate-800/80 rounded-xl p-6 shadow-lg h-[260px] flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Globe size={16} className="text-blue-500" /> Termómetro Fibo (BTC)
                          </h3>
                          {btcMacro && (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${btcMacro.drop < -38.2 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                              {btcMacro.drop.toFixed(2)}%
                            </span>
                          )}
                        </div>

                        {btcMacro ? (
                          <div className="my-auto py-2">
                             <div className="text-4xl font-black text-white mb-4 tracking-tight">${btcMacro.price.toLocaleString()}</div>
                             <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner mb-3">
                               <div className="h-full bg-rose-500" style={{width: '38.2%'}}></div>
                               <div className="h-full bg-amber-500" style={{width: '11.8%'}}></div>
                               <div className="h-full bg-emerald-500" style={{width: '11.8%'}}></div>
                               <div className="h-full bg-indigo-500" style={{width: '16.8%'}}></div>
                               <div className="h-full bg-purple-500" style={{width: '21.4%'}}></div>
                               <div className="absolute top-0 w-1.5 h-full bg-white shadow-lg" style={{ left: `calc(${Math.min(100, Math.max(0, Math.abs(btcMacro.drop)))}% - 3px)` }}></div>
                             </div>
                             <div className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
                               Distância do Topo Histórico (ATH)
                             </div>
                          </div>
                        ) : (
                           <Loader2 className="animate-spin text-slate-500 mx-auto my-auto" />
                        )}
                      </div>

                      {/* Distribuição Compacta Ampliada */}
                      <div className="h-[260px]">
                        <AllocationChart assets={displayedAssets} variant="compact" />
                      </div>

                      {/* Radar de Sentimento Ampliado */}
                      <div className="h-[260px]">
                        <MarketIndicators assets={displayedAssets} variant="compact" />
                      </div>

                    </div>

                    {/* Top 5 Movimentações Ampliado (Mantido apenas no Resumo Geral) */}
                    <div className="mt-1">
                      <TopPerformers assets={displayedAssets} />
                    </div>

                  </div>
                )}

                {/* OUTRAS ABAS */}
                {activeTab === 'ativos' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <PortfolioTable 
                      assets={displayedAssets} 
                      onRemove={handleRemoveAsset} 
                      onSelectAsset={(asset) => setSelectedAsset(asset)} 
                      onEditAsset={(asset) => { setAssetToEdit(asset); setIsEditAssetModalOpen(true); }}
                      onSwapAsset={(asset) => { setAddModalSource(asset); setAddModalType('Troca'); setIsModalOpen(true); }}
                    />
                  </div>
                )}

                {activeTab === 'graficos' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="h-[550px]">
                        <AllocationChart assets={displayedAssets} variant="full" />
                      </div>
                      <div className="h-[550px]">
                        <MarketIndicators assets={displayedAssets} variant="full" />
                      </div>
                    </div>
                    {/* TopPerformers removido daqui conforme solicitado */}
                  </div>
                )}

                {activeTab === 'estrategia' && (
                  <div className="animate-in fade-in duration-300">
                    <PortfolioStrategy assets={displayedAssets} />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <AddAssetModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setAddModalSource(undefined); setAddModalType('Compra'); }} 
        onAdd={handleAddAsset} 
        wallets={portfolios.map(p => p.name)} 
        defaultWallet={activePortfolio || (portfolios.length > 0 ? portfolios[0].name : 'Sem Carteira')} 
        initialType={addModalType}
        sourceAsset={addModalSource}
      />
      <EditTransactionModal isOpen={isEditModalOpen} transaction={editingTransaction} onClose={() => { setIsEditModalOpen(false); setEditingTransaction(null); }} onSave={handleSaveEditedTransaction} />
      
      <EditAssetModal
        isOpen={isEditAssetModalOpen}
        asset={assetToEdit}
        onClose={() => { setIsEditAssetModalOpen(false); setAssetToEdit(null); }}
        onSave={handleEditAsset}
        wallets={portfolios.map(p => p.name)}
      />
    </div>
  );
}