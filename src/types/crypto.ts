export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  investedAmount: number;
  currentPrice: number;
  trend?: string;
  athChange?: number; // Nova propriedade para o desconto histórico
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