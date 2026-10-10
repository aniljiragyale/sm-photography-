import 'server-only';
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';
import type { Offer } from './offer-types';

const KEY = 'sm-photography:offers';
const FILE = path.join(process.cwd(), 'data', 'offers.json');
const hasRedis = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

async function localRead(): Promise<Offer[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, 'utf8')) as Offer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

async function localWrite(offers: Offer[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(offers, null, 2));
}

export async function getOffers(): Promise<Offer[]> {
  if (!hasRedis()) return localRead();
  const records = await Redis.fromEnv().hgetall<Record<string, Offer>>(KEY);
  return Object.values(records || {}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOffer(slug: string): Promise<Offer | null> {
  if (!hasRedis()) return (await localRead()).find((offer) => offer.slug === slug) || null;
  return (await Redis.fromEnv().hget<Offer>(KEY, slug)) || null;
}

export async function saveOffer(offer: Offer): Promise<void> {
  if (!hasRedis()) {
    const offers = await localRead();
    const next = offers.some((item) => item.slug === offer.slug)
      ? offers.map((item) => item.slug === offer.slug ? offer : item)
      : [offer, ...offers];
    await localWrite(next);
    return;
  }
  await Redis.fromEnv().hset(KEY, { [offer.slug]: offer });
}

export async function deleteOffer(slug: string): Promise<void> {
  if (!hasRedis()) {
    await localWrite((await localRead()).filter((offer) => offer.slug !== slug));
    return;
  }
  await Redis.fromEnv().hdel(KEY, slug);
}

export function offersAreShared(): boolean { return hasRedis(); }
