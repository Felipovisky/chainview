import type { CryptoAsset } from '../types/crypto';

export const initialAssets: CryptoAsset[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    currentPrice: 84563.53,
    quantity: 0.00094020,
    investedAmount: 74.66,
    trend: 'Alta Forte'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    currentPrice: 13.21,
    quantity: 3.2,
    investedAmount: 39.82,
    trend: 'Alta Forte'
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    currentPrice: 1.02,
    quantity: 39.48,
    investedAmount: 29.96,
    trend: 'Alta Forte'
  },
  {
    id: 'ethena',
    name: 'Ethena',
    symbol: 'ENA',
    currentPrice: 0.22,
    quantity: 162.21,
    investedAmount: 25.00,
    trend: 'Alta Forte'
  },
  {
    id: 'pendle',
    name: 'Pendle',
    symbol: 'PENDLE',
    currentPrice: 2.60,
    quantity: 14.72,
    investedAmount: 29.56,
    trend: 'Alta Forte'
  }
];