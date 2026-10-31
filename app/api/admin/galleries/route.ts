import { NextResponse } from 'next/server';
import { createGalleryRecord, readStore, writeStore } from '@/lib/gallery-store';
import { isStudioAdmin } from '@/lib/offer-auth';

export const dynamic = 'force-dynamic';
const clean = (value: unknown, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET(request: Request) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const store = await readStore();
    return NextResponse.json(store.galleries.map(({ passwordHash, ...gallery }) => ({
      ...gallery,
      hasPassword: Boolean(passwordHash),
      photos: gallery.photos.map((photo) => ({
        id: photo.id,
        title: photo.fileName,
        category: gallery.categories.find((item) => item.id === photo.categoryId)?.name || 'ALL',
        image_url: photo.previewUrl,
        description: '',
      })),
    })));
  } catch {
    return NextResponse.json({ error: 'Could not load galleries. Check Redis configuration.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const input = await request.json() as Record<string, unknown>;
    const clientName = clean(input.clientName);
    const galleryName = clean(input.galleryName);
    const password = clean(input.password, 128);
    if (!clientName || !galleryName || password.length < 6) return NextResponse.json({ error: 'Client name, gallery name, and a password of at least 6 characters are required.' }, { status: 400 });
    const store = await readStore();
    const gallery = createGalleryRecord({
      clientName,
      galleryName,
      eventType: clean(input.eventType) || 'Wedding',
      eventDate: clean(input.eventDate, 20),
      location: clean(input.location),
      password,
      selectionLimit: Number(input.selectionLimit) > 0 ? Number(input.selectionLimit) : null,
      allowDownload: Boolean(input.allowDownload),
      lockAfterSubmit: Boolean(input.lockAfterSubmit),
      watermarkEnabled: Boolean(input.watermarkEnabled),
      slug: clean(input.slug, 64) || undefined,
    });
    if (store.galleries.some((item) => item.slug === gallery.slug)) return NextResponse.json({ error: 'That gallery link is already in use. Choose another name.' }, { status: 409 });
    gallery.expiresAt = input.expiresAt ? new Date(String(input.expiresAt)).toISOString() : null;
    store.galleries.unshift(gallery);
    await writeStore(store);
    const { passwordHash, ...safeGallery } = gallery;
    return NextResponse.json({ ...safeGallery, hasPassword: Boolean(passwordHash) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not create gallery.' }, { status: 500 });
  }
}
