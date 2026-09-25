import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { PortfolioTable } from './components/PortfolioTable';
import { AllocationChart } from './components/AllocationChart';
import { PerformanceChart } from './components/PerformanceChart';
import { AddAssetModal } from './components/AddAssetModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { TransactionHistory } from './components/TransactionHistory';
import { initialAssets } from './data/mockCrypto';
import { initialTransactions } from './data/mockTransactions';
import { fetchLivePrices } from './services/cryptoApi';
import { connectBinancePrices } from './services/binanceWs';
import type { CryptoAsset, Transaction } from './types/crypto';
import { Search, RefreshCw, Plus } from 'lucide-react';

export default function App() {
  const [assets, setAssets] = useState<CryptoAsset[]>(() => {
    const saved = localStorage.getItem('crypto_portfolio_assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('crypto_portfolio_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('crypto_portfolio_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('crypto_portfolio_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Consulta manual ou periódica via CoinGecko para dados complementares (tendência e variações)
  const updatePrices = async () => {
    setLoading(true);
    const coinIds = assets.map((a) => a.id);
    const livePrices = await fetchLivePrices(coinIds);

    if (livePrices) {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const coinData = livePrices[asset.id];
          if (coinData && coinData.usd) {
            const price = coinData.usd;
            const change24h = coinData.usd_24h_change ?? 0;

            let trend: 'Alta Forte' | 'Alta' | 'Baixa' | 'Estável' = 'Estável';
            if (change24h > 5) trend = 'Alta Forte';
            else if (change24h > 0) trend = 'Alta';
            else trend = 'Baixa';

            return {
              ...asset,
              currentPrice: price,
              trend,
            };
          }
          return asset;
        })
      );
      setLastUpdated(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
    setLoading(false);
  };

  // Conexão em tempo real via WebSocket da Binance
  useEffect(() => {
    updatePrices();

    const assetIds = assets.map((a) => a.id);
    const disconnectWs = connectBinancePrices(assetIds, (priceMap) => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          if (priceMap[asset.id] !== undefined) {
            return {
              ...asset,
              currentPrice: priceMap[asset.id],
            };
          }
          return asset;
        })
      );
      setLastUpdated(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    // Contingência: atualização a cada 60s pela API REST
    const interval = setInterval(updatePrices, 60000);

    return () => {
      disconnectWs();
      clearInterval(interval);
    };
  }, [assets.length]);

  const handleAddAsset = async (newEntry: Omit<CryptoAsset, 'currentPrice' | 'trend'>) => {
    const priceData = await fetchLivePrices([newEntry.id]);
    const currentPrice = priceData?.[newEntry.id]?.usd ?? (newEntry.investedAmount / newEntry.quantity);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      assetId: newEntry.id,
      type: 'Compra',
      date: new Date().toLocaleDateString('pt-BR'),
      amount: newEntry.investedAmount,
      priceAtDate: currentPrice,
      quantity: newEntry.quantity,
      wallet: 'Sem Carteira',
    };
    setTransactions((prev) => [newTx, ...prev]);

    setAssets((prev) => {
      const existingIndex = prev.findIndex((a) => a.id === newEntry.id);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updatedList = [...prev];
        updatedList[existingIndex] = {
          ...existing,
          quantity: existing.quantity + newEntry.quantity,
          investedAmount: existing.investedAmount + newEntry.investedAmount,
          currentPrice: currentPrice > 0 ? currentPrice : existing.currentPrice,
        };
        return updatedList;
      } else {
        const newAsset: CryptoAsset = {
          ...newEntry,
          currentPrice,
          trend: 'Estável',
        };
        return [...prev, newAsset];
      }
    });
  };

  const handleSaveEditedTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find((t) => t.id === updatedTx.id);
    if (!oldTx) return;

    const updatedTransactions = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(updatedTransactions);

    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === updatedTx.assetId) {
          const assetTxs = updatedTransactions.filter((t) => t.assetId === asset.id);
          const totalQty = assetTxs.reduce((sum, t) => sum + t.quantity, 0);
          const totalInvestedAmount = assetTxs.reduce((sum, t) => sum + t.amount, 0);

          return {
            ...asset,
            quantity: totalQty,
            investedAmount: totalInvestedAmount,
          };
        }
        return asset;
      })
    );
  };

  const handleDeleteTransaction = (txId: string) => {
    const txToDelete = transactions.find((t) => t.id === txId);
    if (!txToDelete) return;

    const remainingTransactions = transactions.filter((t) => t.id !== txId);
    setTransactions(remainingTransactions);

    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === txToDelete.assetId) {
          const assetTxs = remainingTransactions.filter((t) => t.assetId === asset.id);
          const totalQty = assetTxs.reduce((sum, t) => sum + t.quantity, 0);
          const totalInvestedAmount = assetTxs.reduce((sum, t) => sum + t.amount, 0);
          return {
            ...asset,
            quantity: totalQty,
            investedAmount: totalInvestedAmount,
          };
        }
        return asset;
      })
    );
  };

  const handleRemoveAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.assetId !== id));
    if (selectedAsset?.id === id) {
      setSelectedAsset(null);
    }
  };

  const totalInvested = assets.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const currentBalance = assets.reduce((acc, curr) => acc + curr.quantity * curr.currentPrice, 0);
  const totalProfit = currentBalance - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const activeSelectedAsset = selectedAsset
    ? assets.find((a) => a.id === selectedAsset.id) || selectedAsset
    : null;

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden text-slate-100 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Barra Superior */}
        <header className="h-20 border-b border-slate-800/80 flex items-center justify-between px-8 bg-[#0d1117]/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <h1 className="text-xl font-bold tracking-tight text-white">Portfolio</h1>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Pesquisar ativos..."
                className="bg-[#121824] border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition w-64 shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {lastUpdated && (
              <span className="text-xs text-slate-500 hidden sm:inline font-mono">
                Atualizado às {lastUpdated}
              </span>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs transition shadow-lg shadow-emerald-500/10 active:scale-95"
            >
              <Plus size={15} />
              Novo Aporte
            </button>

            <button
              onClick={updatePrices}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surfaceLight border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : ''} />
              {loading ? 'A atualizar...' : 'Atualizar'}
            </button>
          </div>
        </header>

        {/* Dashboard */}
        <section className="p-8 space-y-6 max-w-7xl">
          {activeSelectedAsset ? (
            <TransactionHistory
              asset={activeSelectedAsset}
              transactions={transactions}
              onBack={() => setSelectedAsset(null)}
              onOpenAddModal={() => setIsModalOpen(true)}
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsEditModalOpen(true);
              }}
            />
          ) : (
            <>
              {/* Métricas Principais com Sparklines e Datas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Aportes" 
                  value={`$${totalInvested.toFixed(2)}`}
                  valueColor="text-white"
                  sparklineData={[
                    { date: '25/08', value: 74.66 },
                    { date: '31/08', value: 74.66 },
                    { date: '06/09', value: 74.66 },
                    { date: '12/09', value: 140.00 },
                    { date: '18/09', value: 140.00 },
                    { date: '24/09', value: totalInvested }
                  ]}
                  chartColor="#f59e0b"
                  chartType="stepAfter"
                  idGradient="grad-aportes"
                />
                
                <StatCard 
                  title="Saldo" 
                  value={`$${currentBalance.toFixed(2)}`} 
                  valueColor="text-emerald-400 font-bold"
                  sparklineData={[
                    { date: '25/08', value: 70.00 },
                    { date: '31/08', value: 71.20 },
                    { date: '06/09', value: 72.50 },
                    { date: '12/09', value: 145.00 },
                    { date: '18/09', value: 160.00 },
                    { date: '24/09', value: currentBalance }
                  ]}
                  chartColor="#10b981"
                  chartType="monotone"
                  idGradient="grad-saldo"
                />
                
                <StatCard
                  title="Lucro"
                  value={`$${totalProfit.toFixed(2)}`}
                  valueColor="text-emerald-400 font-bold"
                  badge={`${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(2)}%`}
                  badgePositive={totalProfit >= 0}
                  sparklineData={[
                    { date: '25/08', value: 1.50 },
                    { date: '31/08', value: -1.20 },
                    { date: '06/09', value: 2.10 },
                    { date: '12/09', value: 0.80 },
                    { date: '18/09', value: 4.50 },
                    { date: '24/09', value: totalProfit }
                  ]}
                  chartColor={totalProfit >= 0 ? "#10b981" : "#f43f5e"}
                  chartType="monotone"
                  idGradient="grad-lucro"
                />
              </div>

              {/* Tabela de Moedas */}
              <PortfolioTable
                assets={assets}
                onRemove={handleRemoveAsset}
                onSelectAsset={(asset) => setSelectedAsset(asset)}
              />

              {/* Distribuição e Gráficos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AllocationChart assets={assets} />
                <PerformanceChart />
              </div>
            </>
          )}
        </section>
      </main>

      {/* Modal de Criação */}
      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddAsset}
      />

      {/* Modal de Edição */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        transaction={editingTransaction}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveEditedTransaction}
      />
    </div>
  );
}