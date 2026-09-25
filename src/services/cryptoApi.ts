export interface SimplePriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

export async function fetchLivePrices(coinIds: string[]): Promise<SimplePriceResponse | null> {
  if (coinIds.length === 0) return {};

  try {
    const idsString = encodeURIComponent(coinIds.join(','));
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(`Erro na API CoinGecko: ${response.statusText}`);
    }

    const data: SimplePriceResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Falha ao obter cotações em tempo real:', error);
    return null;
  }
}