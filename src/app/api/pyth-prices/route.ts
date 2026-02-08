import { NextResponse } from 'next/server';
import { PYTH_FEED_IDS } from '@/lib/pyth-prices';

const HERMES = 'https://hermes.pyth.network';
const COINGECKO_IDS: Record<string, string> = {
  SOL: 'solana',
  ETH: 'ethereum',
  BTC: 'bitcoin',
};

function parsePythPrice(price: string, expo: number): number {
  return Number(price) * Math.pow(10, expo);
}

function normalizeId(id: string): string {
  return id.replace(/^0x/i, '').toLowerCase();
}

function toOut(price: number): { price: number; price18: string } {
  return { price, price18: String(BigInt(Math.round(price * 1e18))) };
}

async function fetchFromCoinGecko(): Promise<Record<string, { price: number; price18: string }>> {
  const ids = Object.values(COINGECKO_IDS).join(',');
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
    { cache: 'no-store', headers: { Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = await res.json();
  const out: Record<string, { price: number; price18: string }> = {};
  for (const [sym, cgId] of Object.entries(COINGECKO_IDS)) {
    const usd = (data as Record<string, { usd?: number }>)[cgId]?.usd;
    if (typeof usd === 'number') out[sym] = toOut(usd);
  }
  return out;
}

export async function GET() {
  const entries = Object.entries(PYTH_FEED_IDS);
  const searchParams = new URLSearchParams();
  entries.forEach(([, id]) => searchParams.append('ids[]', id));
  const url = `${HERMES}/v2/updates/price/latest?${searchParams.toString()}`;
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const out: Record<string, { price: number; price18: string }> = {};
      const parsed = data?.parsed ?? [];
      (Array.isArray(parsed) ? parsed : []).forEach((feed: { id?: string; price?: { price: string; expo: number } }) => {
        const feedId = feed.id ? normalizeId(feed.id) : '';
        const entry = entries.find(([, id]) => normalizeId(id) === feedId);
        if (!entry || !feed?.price) return;
        const [sym] = entry;
        const num = parsePythPrice(feed.price.price, feed.price.expo);
        out[sym] = toOut(num);
      });
      if (Object.keys(out).length > 0) return NextResponse.json(out);
    }
    const fallback = await fetchFromCoinGecko();
    return NextResponse.json(fallback);
  } catch (e) {
    console.error('Pyth fetch error', e);
    try {
      const fallback = await fetchFromCoinGecko();
      return NextResponse.json(fallback);
    } catch (e2) {
      console.error('CoinGecko fallback error', e2);
      return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 502 });
    }
  }
}
