import { NextResponse } from 'next/server';
import { bookingsAreShared, getBooking, listBookings, saveBooking, type Booking, type BookingStatus } from '@/lib/booking-store';
import { isStudioAdmin } from '@/lib/offer-auth';

export const dynamic = 'force-dynamic';

const text = (value: unknown, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function POST(request: Request) {
  if (!bookingsAreShared() && process.env.VERCEL) {
    return NextResponse.json({ error: 'Booking storage is not configured. Connect Upstash Redis and redeploy.' }, { status: 503 });
  }
  try {
    const input = await request.json() as Record<string, unknown>;
    const booking: Booking = {
      id: crypto.randomUUID(),
      firstName: text(input.firstName, 100),
      lastName: text(input.lastName, 100),
      email: text(input.email, 254).toLowerCase(),
      phone: text(input.phone, 40),
      eventType: text(input.eventType, 120),
      packageName: text(input.packageName, 120),
      eventDate: text(input.eventDate, 20),
      venue: text(input.venue, 240),
      schedule: text(input.schedule, 1000),
      referral: text(input.referral, 120),
      offer: text(input.offer, 200),
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!booking.firstName || !booking.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email) || !booking.phone || !booking.eventType || !booking.packageName || !/^\d{4}-\d{2}-\d{2}$/.test(booking.eventDate) || !booking.venue || !booking.schedule) {
      return NextResponse.json({ error: 'Complete all required booking fields with a valid email and event date.' }, { status: 400 });
    }
    await saveBooking(booking);
    return NextResponse.json({ ok: true, id: booking.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to save the booking request. Please try again.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    return NextResponse.json(await listBookings());
  } catch {
    return NextResponse.json({ error: 'Unable to load bookings.' }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!bookingsAreShared() && process.env.VERCEL) {
    return NextResponse.json({ error: 'Booking storage is not configured. Connect Upstash Redis and redeploy.' }, { status: 503 });
  }
  try {
    const input = await request.json() as { id?: unknown; status?: unknown };
    const id = text(input.id, 80);
    const status = input.status as BookingStatus;
    if (!id || !['new', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Choose a valid booking status.' }, { status: 400 });
    }
    const booking = await getBooking(id);
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    const updated = { ...booking, status, updatedAt: new Date().toISOString() };
    await saveBooking(updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Unable to update booking.' }, { status: 500 });
  }
}
