export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  investedAmount: number;
  currentPrice: number;
  trend?: string;
  change24h?: number;
  change7d?: number;
  change30d?: number;
  change1y?: number;
}

export interface Transaction {
  id: string;
  assetId: string;
  type: 'Compra' | 'Venda';
  date: string;
  amount: number;
  priceAtDate: number;
  quantity: number;
  wallet: string;
}