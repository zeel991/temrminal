import { NextResponse } from 'next/server';
import { PYTH_FEED_IDS } from '@/lib/pyth-prices';

const HERMES = 'https://hermes.pyth.network';
const COINGECKO_IDS: Record<string, string> = {
  SOL: 'solana',
  ETH: 'ethereum',
  BTC: 'bitcoin',
};

// Cache configuration
const CACHE_TTL = 30; // 30 seconds cache
const STALE_WHILE_REVALIDATE = 60; // Serve stale for 60 seconds while revalidating

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { 
        signal: controller.signal,
        headers: { 
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0' // Some APIs prefer a user agent
        },
        // Next.js 13+ cache option
        next: { revalidate: CACHE_TTL }
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    const out: Record<string, { price: number; price18: string }> = {};
    
    for (const [sym, cgId] of Object.entries(COINGECKO_IDS)) {
      const usd = (data as Record<string, { usd?: number }>)[cgId]?.usd;
      if (typeof usd === 'number') out[sym] = toOut(usd);
    }
    
    return out;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchFromPyth(): Promise<Record<string, { price: number; price18: string }> | null> {
  const entries = Object.entries(PYTH_FEED_IDS);
  const searchParams = new URLSearchParams();
  entries.forEach(([, id]) => searchParams.append('ids[]', id));
  const url = `${HERMES}/v2/updates/price/latest?${searchParams.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      // Next.js 13+ cache option
      next: { revalidate: CACHE_TTL }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    const out: Record<string, { price: number; price18: string }> = {};
    const parsed = data?.parsed ?? [];

    if (!Array.isArray(parsed)) return null;

    for (const feed of parsed) {
      if (!feed?.id || !feed?.price) continue;
      
      const feedId = normalizeId(feed.id);
      const entry = entries.find(([, id]) => normalizeId(id) === feedId);
      
      if (!entry) continue;
      
      const [sym] = entry;
      const num = parsePythPrice(feed.price.price, feed.price.expo);
      out[sym] = toOut(num);
    }

    return Object.keys(out).length > 0 ? out : null;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Pyth fetch error:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Try Pyth first
    const pythPrices = await fetchFromPyth();
    
    if (pythPrices) {
      return NextResponse.json(pythPrices, {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
          'CDN-Cache-Control': `public, s-maxage=${CACHE_TTL}`,
          'Vercel-CDN-Cache-Control': `public, s-maxage=${CACHE_TTL}`,
        },
      });
    }

    // Fallback to CoinGecko
    console.warn('Pyth failed, using CoinGecko fallback');
    const fallbackPrices = await fetchFromCoinGecko();
    
    return NextResponse.json(fallbackPrices, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        'CDN-Cache-Control': `public, s-maxage=${CACHE_TTL}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${CACHE_TTL}`,
      },
    });
  } catch (error) {
    console.error('All price sources failed:', error);
    
    // Return error with appropriate headers
    return NextResponse.json(
      { error: 'Failed to fetch prices' }, 
      { 
        status: 502,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}

// Optional: Add config for edge runtime (faster cold starts)
export const runtime = 'edge';
export const dynamic = 'force-dynamic';