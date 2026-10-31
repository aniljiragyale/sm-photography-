import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/gallery-store';
import { getClientGallerySession } from '@/lib/client-gallery-auth';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    const requestedPhotoIds = Array.isArray(body.selectedPhotoIds) ? body.selectedPhotoIds.map(String) : [];
    const store = await readStore();
    const gallery = store.galleries.find((item) => item.slug === params.slug);

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    }

    if (!getClientGallerySession(request, gallery.id)) return NextResponse.json({ error: 'Sign in to submit selections.' }, { status: 401 });
    if (gallery.expiresAt && Date.parse(gallery.expiresAt) <= Date.now()) return NextResponse.json({ error: 'This gallery has expired.' }, { status: 410 });
    if (gallery.status !== 'active' || (gallery.lockAfterSubmit && gallery.submissions.length)) return NextResponse.json({ error: 'This gallery is locked.' }, { status: 403 });

    const selectedPhotoIds = gallery.selections?.[gallery.id] || [];
    if (requestedPhotoIds.some((id: string) => !selectedPhotoIds.includes(id))) return NextResponse.json({ error: 'Refresh the gallery and try submitting again.' }, { status: 400 });

    if (!selectedPhotoIds.length) {
      return NextResponse.json({ error: 'Please select at least one photo.' }, { status: 400 });
    }

    gallery.updatedAt = new Date().toISOString();
    gallery.submissions.push({
      id: `submission-${Date.now()}`,
      galleryId: gallery.id,
      clientName: gallery.clientName,
      clientEmail: '',
      clientPhone: '',
      selectedCount: selectedPhotoIds.length,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    });

    await writeStore({ galleries: store.galleries });

    return NextResponse.json({ ok: true, selectedCount: selectedPhotoIds.length });
  } catch {
    return NextResponse.json({ error: 'Unable to submit the final selection.' }, { status: 500 });
  }
}
