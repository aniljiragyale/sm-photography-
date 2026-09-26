import { NextResponse } from 'next/server';
import { readStore } from '@/lib/gallery-store';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    const selectedPhotoIds = Array.isArray(body.selectedPhotoIds) ? body.selectedPhotoIds : [];
    const store = await readStore();
    const gallery = store.galleries.find((item) => item.slug === params.slug);

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    }

    if (!selectedPhotoIds.length) {
      return NextResponse.json({ error: 'Please select at least one photo.' }, { status: 400 });
    }

    gallery.status = 'submitted';
    gallery.updatedAt = new Date().toISOString();
    gallery.submissions.push({
      id: `submission-${Date.now()}`,
      galleryId: gallery.id,
      clientName: gallery.clientName,
      clientEmail: 'client@example.com',
      clientPhone: '0000000000',
      selectedCount: selectedPhotoIds.length,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    });

    await import('@/lib/gallery-store').then(async ({ writeStore }) => writeStore({ galleries: store.galleries }));

    return NextResponse.json({ ok: true, selectedCount: selectedPhotoIds.length });
  } catch {
    return NextResponse.json({ error: 'Unable to submit the final selection.' }, { status: 500 });
  }
}
