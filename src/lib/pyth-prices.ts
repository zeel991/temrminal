/**
 * Fetch live token prices from Pyth Hermes API for the trading terminal.
 * Prices are used to open/close leveraged positions (passed to contract).
 */

const HERMES = 'https://hermes.pyth.network';

export const PYTH_FEED_IDS: Record<string, string> = {
  SOL: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  ETH: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874508cc0881',
  BTC: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
};

export interface PythPrice {
  price: number;
  symbol: string;
  price18: bigint; // for contract (1e18)
}

function parsePythPrice(price: string, expo: number): number {
  return Number(price) * Math.pow(10, expo);
}

function toPrice18(price: number): bigint {
  return BigInt(Math.round(price * 1e18));
}

export async function fetchPythPrice(symbol: string): Promise<PythPrice | null> {
  const id = PYTH_FEED_IDS[symbol];
  if (!id) return null;
  try {
    const res = await fetch(
      `${HERMES}/api/latest_price_feeds?ids[]=${id}`,
      { next: { revalidate: 0 } }
    );
    const data = await res.json();
    const feed = data?.[0];
    if (!feed?.price) return null;
    const { price, expo } = feed.price;
    const num = parsePythPrice(price, expo);
    return { price: num, symbol, price18: toPrice18(num) };
  } catch {
    return null;
  }
}

export async function fetchAllPythPrices(): Promise<Record<string, PythPrice>> {
  const entries = Object.entries(PYTH_FEED_IDS);
  const params = entries.map(([, id]) => `ids[]=${id}`).join('&');
  try {
    const res = await fetch(
      `${HERMES}/api/latest_price_feeds?${params}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const out: Record<string, PythPrice> = {};
    (Array.isArray(data) ? data : []).forEach((feed: { id?: string; price?: { price: string; expo: number } }) => {
      const entry = entries.find(([, id]) => feed.id === id || feed.id === id.replace(/^0x/, ''));
      if (!entry || !feed?.price) return;
      const [sym] = entry;
      const num = parsePythPrice(feed.price.price, feed.price.expo);
      out[sym] = { price: num, symbol: sym, price18: toPrice18(num) };
    });
    return out;
  } catch {
    return {};
  }
}
