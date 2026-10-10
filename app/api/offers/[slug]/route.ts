import { NextResponse } from 'next/server';
import { getOffer } from '@/lib/offer-store';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const offer = await getOffer(params.slug);
  if (!offer || !offer.active || Date.parse(offer.startsAt) > Date.now() || (offer.endsAt && Date.parse(offer.endsAt) <= Date.now())) {
    return NextResponse.json({ error: 'Offer not found.' }, { status: 404 });
  }
  return NextResponse.json(offer);
}
