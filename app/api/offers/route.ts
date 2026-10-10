import { NextResponse } from 'next/server';
import { deleteOffer, getOffers, offersAreShared, saveOffer } from '@/lib/offer-store';
import { isStudioAdmin } from '@/lib/offer-auth';
import { OFFER_PACKAGES, type Offer } from '@/lib/offer-types';

export const dynamic = 'force-dynamic';

function validate(input: Partial<Offer>): string | null {
  if (!input.title?.trim() || input.title.length > 100) return 'Offer title is required and must be under 100 characters.';
  if (!input.description?.trim() || input.description.length > 1000) return 'Description is required and must be under 1,000 characters.';
  if (!input.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) return 'Offer link must use a valid lowercase slug.';
  if (!input.startsAt || !Number.isFinite(Date.parse(input.startsAt))) return 'Choose a valid start date.';
  if (input.endsAt && (!Number.isFinite(Date.parse(input.endsAt)) || Date.parse(input.endsAt) <= Date.parse(input.startsAt))) return 'Expiry must be after the start date.';
  if (!['percentage', 'fixed', 'none'].includes(input.discountType || '')) return 'Select a valid discount type.';
  if (input.discountType === 'percentage' && (!Number.isFinite(input.discountValue) || Number(input.discountValue) < 1 || Number(input.discountValue) > 100)) return 'Percentage discount must be between 1 and 100.';
  if (input.discountType === 'fixed' && (!Number.isFinite(input.discountValue) || Number(input.discountValue) <= 0 || Number(input.discountValue) > 10000000)) return 'Fixed discount must be greater than zero.';
  if (!Array.isArray(input.packages) || input.packages.length === 0 || input.packages.some((item) => !(OFFER_PACKAGES as readonly string[]).includes(item))) return 'Select at least one valid package.';
  if (typeof input.active !== 'boolean' || typeof input.featured !== 'boolean' || !['', 'Special Offer', 'Limited Time Offer'].includes(input.label || '')) return 'Invalid offer status or label.';
  if (input.image && !(input.image.startsWith('https://') || (input.image.startsWith('/') && !input.image.startsWith('//')))) return 'Offer image must use a secure URL.';
  return null;
}

export async function GET(request: Request) {
  try {
    const manage = new URL(request.url).searchParams.get('manage') === '1';
    if (manage && !isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    const admin = manage;
    const offers = await getOffers();
    return NextResponse.json(admin ? offers : offers.filter((offer) => offer.active && Date.parse(offer.startsAt) <= Date.now() && (!offer.endsAt || Date.parse(offer.endsAt) > Date.now())));
  } catch {
    return NextResponse.json({ error: 'Unable to load offers.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Sign in to the studio dashboard to manage offers.' }, { status: 401 });
  if (!offersAreShared() && process.env.VERCEL) return NextResponse.json({ error: 'Configure Upstash Redis before managing offers on Vercel.' }, { status: 503 });
  try {
    const input = await request.json() as Partial<Offer> & { existingId?: string };
    const error = validate(input);
    if (error) return NextResponse.json({ error }, { status: 400 });
    const existingOffers = await getOffers();
    const previous = existingOffers.find((offer) => offer.slug === input.slug);
    if (previous && input.existingId !== previous.id) return NextResponse.json({ error: 'That offer link is already in use.' }, { status: 409 });
    const now = new Date().toISOString();
    const offer: Offer = {
      id: previous?.id || crypto.randomUUID(), slug: input.slug!, title: input.title!.trim(), description: input.description!.trim(),
      image: input.image || '', discountType: input.discountType!, discountValue: input.discountType === 'none' ? 0 : Number(input.discountValue),
      packages: [...new Set(input.packages!)], startsAt: new Date(input.startsAt!).toISOString(), endsAt: input.endsAt ? new Date(input.endsAt).toISOString() : null,
      active: input.active!, featured: input.featured!, label: input.label || '', createdAt: previous?.createdAt || now, updatedAt: now,
    };
    if (offer.featured) {
      for (const other of existingOffers.filter((item) => item.slug !== offer.slug && item.featured)) {
        await saveOffer({ ...other, featured: false, updatedAt: now });
      }
    }
    await saveOffer(offer);
    return NextResponse.json(offer, { status: previous ? 200 : 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to save offer.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!offersAreShared() && process.env.VERCEL) return NextResponse.json({ error: 'Configure Upstash Redis before managing offers on Vercel.' }, { status: 503 });
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Offer link is required.' }, { status: 400 });
  await deleteOffer(slug);
  return NextResponse.json({ ok: true });
}
