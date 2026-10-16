import 'server-only';
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';

const TOTAL_VIEWS_KEY = 'sm-photography:analytics:total-views';
const DAILY_VIEW_PREFIX = 'sm-photography:analytics:daily-views:';
const LOCAL_ANALYTICS_FILE = path.join(process.cwd(), 'data', 'site-analytics.json');
const REDIS_DAILY_TTL_SECONDS = 60 * 60 * 24 * 400;

export type AnalyticsSummary = {
  totalViews: number;
  dailyViews: Array<{ date: string; views: number }>;
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

async function readLocalData(): Promise<{ totalViews: number; dailyViews: Record<string, number> }> {
  try {
    const parsed = JSON.parse(await fs.readFile(LOCAL_ANALYTICS_FILE, 'utf8')) as { totalViews?: number; dailyViews?: Record<string, number> };
    return {
      totalViews: Number(parsed.totalViews) || 0,
      dailyViews: parsed.dailyViews && typeof parsed.dailyViews === 'object' ? parsed.dailyViews : {},
    };
  } catch {
    return { totalViews: 0, dailyViews: {} };
  }
}

let localWriteQueue: Promise<unknown> = Promise.resolve();

async function recordLocalView(): Promise<void> {
  const nextWrite = localWriteQueue.then(async () => {
    const data = await readLocalData();
    const date = getIndiaDate();
    data.totalViews += 1;
    data.dailyViews[date] = (data.dailyViews[date] || 0) + 1;
    await fs.mkdir(path.dirname(LOCAL_ANALYTICS_FILE), { recursive: true });
    await fs.writeFile(LOCAL_ANALYTICS_FILE, JSON.stringify(data, null, 2));
  });
  localWriteQueue = nextWrite.catch(() => undefined);
  await nextWrite;
}

export async function recordSiteView(): Promise<void> {
  if (!hasRedisConfig()) {
    if (process.env.VERCEL) throw new Error('Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to store analytics on Vercel.');
    await recordLocalView();
    return;
  }

  const redis = Redis.fromEnv();
  const dailyKey = `${DAILY_VIEW_PREFIX}${getIndiaDate()}`;
  await Promise.all([
    redis.incr(TOTAL_VIEWS_KEY),
    redis.incr(dailyKey).then(() => redis.expire(dailyKey, REDIS_DAILY_TTL_SECONDS)),
  ]);
}

export async function getSiteAnalytics(): Promise<AnalyticsSummary> {
  const dates = recentDates();
  if (!hasRedisConfig()) {
    if (process.env.VERCEL) throw new Error('Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to view deployed analytics.');
    const data = await readLocalData();
    return { totalViews: data.totalViews, dailyViews: dates.map((date) => ({ date, views: data.dailyViews[date] || 0 })) };
  }

  const redis = Redis.fromEnv();
  const [total, ...daily] = await redis.mget<number[]>(TOTAL_VIEWS_KEY, ...dates.map((date) => `${DAILY_VIEW_PREFIX}${date}`));
  return {
    totalViews: Number(total) || 0,
    dailyViews: dates.map((date, index) => ({ date, views: Number(daily[index]) || 0 })),
  };
}
