import 'server-only';
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';

const TOTAL_VISITS_KEY = 'sm-photography:analytics:total-visits';
const DAILY_VISIT_PREFIX = 'sm-photography:analytics:daily-visits:';
const VISIT_SESSION_PREFIX = 'sm-photography:analytics:visit-session:';
const LOCAL_ANALYTICS_FILE = path.join(process.cwd(), 'data', 'site-analytics.json');
const REDIS_DAILY_TTL_SECONDS = 60 * 60 * 24 * 400;
const VISIT_IDLE_TTL_SECONDS = 30 * 60;

export type AnalyticsSummary = {
  totalVisits: number;
  dailyVisits: Array<{ date: string; visits: number }>;
};

const hasRedisConfig = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

function getIndiaDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function recentDates(days = 30): string[] {
  return Array.from({ length: days }, (_, index) => getIndiaDate(days - index - 1));
}

async function readLocalData(): Promise<{ totalVisits: number; dailyVisits: Record<string, number>; activeVisits: Record<string, number> }> {
  try {
    const parsed = JSON.parse(await fs.readFile(LOCAL_ANALYTICS_FILE, 'utf8')) as { totalVisits?: number; dailyVisits?: Record<string, number>; activeVisits?: Record<string, number> };
    return {
      totalVisits: Number(parsed.totalVisits) || 0,
      dailyVisits: parsed.dailyVisits && typeof parsed.dailyVisits === 'object' ? parsed.dailyVisits : {},
      activeVisits: parsed.activeVisits && typeof parsed.activeVisits === 'object' ? parsed.activeVisits : {},
    };
  } catch {
    return { totalVisits: 0, dailyVisits: {}, activeVisits: {} };
  }
}

let localWriteQueue: Promise<unknown> = Promise.resolve();

async function recordLocalVisit(visitId: string): Promise<boolean> {
  const nextWrite = localWriteQueue.then(async () => {
    const data = await readLocalData();
    const now = Date.now();
    const lastActivity = data.activeVisits[visitId];
    for (const [id, timestamp] of Object.entries(data.activeVisits)) {
      if (now - timestamp >= VISIT_IDLE_TTL_SECONDS * 1000) delete data.activeVisits[id];
    }
    if (lastActivity && now - lastActivity < VISIT_IDLE_TTL_SECONDS * 1000) {
      data.activeVisits[visitId] = now;
      await fs.mkdir(path.dirname(LOCAL_ANALYTICS_FILE), { recursive: true });
      await fs.writeFile(LOCAL_ANALYTICS_FILE, JSON.stringify(data, null, 2));
      return false;
    }
    const date = getIndiaDate();
    data.totalVisits += 1;
    data.dailyVisits[date] = (data.dailyVisits[date] || 0) + 1;
    data.activeVisits[visitId] = now;
    await fs.mkdir(path.dirname(LOCAL_ANALYTICS_FILE), { recursive: true });
    await fs.writeFile(LOCAL_ANALYTICS_FILE, JSON.stringify(data, null, 2));
    return true;
  });
  localWriteQueue = nextWrite.catch(() => undefined);
  return nextWrite;
}

export async function recordSiteVisit(visitId: string): Promise<void> {
  if (!hasRedisConfig()) {
    if (process.env.VERCEL) throw new Error('Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to store analytics on Vercel.');
    await recordLocalVisit(visitId);
    return;
  }

  const redis = Redis.fromEnv();
  const sessionKey = `${VISIT_SESSION_PREFIX}${visitId}`;
  const isNewVisit = await redis.set(sessionKey, '1', { nx: true, ex: VISIT_IDLE_TTL_SECONDS });
  if (isNewVisit !== 'OK') {
    await redis.expire(sessionKey, VISIT_IDLE_TTL_SECONDS);
    return;
  }

  const dailyKey = `${DAILY_VISIT_PREFIX}${getIndiaDate()}`;
  await Promise.all([
    redis.incr(TOTAL_VISITS_KEY),
    redis.incr(dailyKey).then(() => redis.expire(dailyKey, REDIS_DAILY_TTL_SECONDS)),
  ]);
}

export async function getSiteAnalytics(): Promise<AnalyticsSummary> {
  const dates = recentDates();
  if (!hasRedisConfig()) {
    if (process.env.VERCEL) throw new Error('Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to view deployed analytics.');
    const data = await readLocalData();
    return { totalVisits: data.totalVisits, dailyVisits: dates.map((date) => ({ date, visits: data.dailyVisits[date] || 0 })) };
  }

  const redis = Redis.fromEnv();
  const [total, ...daily] = await redis.mget<number[]>(TOTAL_VISITS_KEY, ...dates.map((date) => `${DAILY_VISIT_PREFIX}${date}`));
  return {
    totalVisits: Number(total) || 0,
    dailyVisits: dates.map((date, index) => ({ date, visits: Number(daily[index]) || 0 })),
  };
}
