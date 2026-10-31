import 'server-only';
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';

export type BookingStatus = 'new' | 'confirmed' | 'cancelled';
export type Booking = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventType: string;
  packageName: string;
  eventDate: string;
  venue: string;
  schedule: string;
  referral: string;
  offer: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

const KEY = 'sm-photography:bookings';
const FILE = path.join(process.cwd(), 'data', 'bookings.json');
const hasRedis = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

async function readLocal(): Promise<Booking[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, 'utf8')) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

async function writeLocal(bookings: Booking[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(bookings, null, 2));
}

export async function listBookings(): Promise<Booking[]> {
  if (!hasRedis()) return (await readLocal()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const records = await Redis.fromEnv().hgetall<Record<string, Booking>>(KEY);
  return Object.values(records || {}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (!hasRedis()) return (await readLocal()).find((booking) => booking.id === id) || null;
  return (await Redis.fromEnv().hget<Booking>(KEY, id)) || null;
}

export async function saveBooking(booking: Booking): Promise<void> {
  if (!hasRedis()) {
    const bookings = await readLocal();
    await writeLocal([booking, ...bookings.filter((item) => item.id !== booking.id)]);
    return;
  }
  await Redis.fromEnv().hset(KEY, { [booking.id]: booking });
}

export function bookingsAreShared() { return hasRedis(); }
