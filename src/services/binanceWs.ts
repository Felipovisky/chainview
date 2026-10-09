const SYMBOL_TO_BINANCE: Record<string, string> = {
  bitcoin: 'btcusdt',
  ethereum: 'ethusdt',
  solana: 'solusdt',
  chainlink: 'linkusdt',
  sui: 'suiusdt',
  ethena: 'enausdt',
  pendle: 'pendleusdt',
  cardano: 'adausdt',
  'avalanche-2': 'avaxusdt',
  polkadot: 'dotusdt',
  near: 'nearusdt',
  dogecoin: 'dogeusdt',
  pepe: 'pepeusdt',
  raydium: 'rayusdt',
};

export type PriceCallback = (updates: { [assetId: string]: number }) => void;

export function connectBinancePrices(
  assetIds: string[],
  onPriceUpdate: PriceCallback
): () => void {
  const streams = assetIds
    .map((id) => SYMBOL_TO_BINANCE[id])
    .filter(Boolean)
    .map((s) => `${s}@miniTicker`)
    .join('/');

  if (!streams) return () => {};

  const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data && data.s && data.c) {
        const symbolReceived = data.s.toLowerCase();
        const matchedId = Object.keys(SYMBOL_TO_BINANCE).find(
          (id) => SYMBOL_TO_BINANCE[id] === symbolReceived
        );

        if (matchedId) {
          const newPrice = parseFloat(data.c);
          onPriceUpdate({ [matchedId]: newPrice });
        }
      }
    } catch (err) {
      console.error('Erro ao processar mensagem do WebSocket:', err);
    }
  };

  ws.onerror = (err) => {
    console.warn('Erro na ligação WebSocket Binance:', err);
  };

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}