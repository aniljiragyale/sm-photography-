import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventCode = String(body.eventCode || '').trim().toUpperCase();

    if (!eventCode) {
      return NextResponse.json({ error: 'Event code is required.' }, { status: 400 });
    }

    const response = await fetch('http://localhost:4000/api/public/events', { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to load event data.' }, { status: 500 });
    }

    const events = (await response.json()) as Array<{ event_code?: string; event_name?: string; client_name?: string; event_date?: string }>;
    const event = events.find((item) => String(item.event_code || '').trim().toUpperCase() === eventCode);

    if (!event) {
      return NextResponse.json({ error: 'Invalid event code. Please try again.' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      slug: String(event.event_code || '').trim(),
      event: event.event_name || 'Event Gallery',
    });
  } catch {
    return NextResponse.json({ error: 'Something went wrong while opening the event gallery.' }, { status: 500 });
  }
}
