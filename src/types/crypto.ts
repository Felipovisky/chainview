export interface Transaction {
  id: string;
  assetId: string;
  type: 'Compra' | 'Venda';
  date: string;
  amount: number;       // Valor total em USD (aporte/saque)
  priceAtDate: number;  // Cotação na data da transação
  quantity: number;     // Quantidade de cripto
  wallet?: string;      // ex: 'Sem Carteira', 'Binance', 'Ledger'
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  quantity: number;
  investedAmount: number;
  trend: 'Alta Forte' | 'Alta' | 'Baixa' | 'Estável';
}