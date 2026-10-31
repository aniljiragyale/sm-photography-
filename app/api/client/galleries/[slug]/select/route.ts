import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/gallery-store';
import { getClientGallerySession } from '@/lib/client-gallery-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    const photoId = String(body.photoId || '').trim();
    const store = await readStore();
    const gallery = store.galleries.find((item) => item.slug === params.slug);
    if (!gallery) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    if (!getClientGallerySession(request, gallery.id)) return NextResponse.json({ error: 'Sign in to select photos.' }, { status: 401 });
    if (gallery.expiresAt && Date.parse(gallery.expiresAt) <= Date.now()) return NextResponse.json({ error: 'This gallery has expired.' }, { status: 410 });
    if (gallery.status !== 'active' || (gallery.lockAfterSubmit && gallery.submissions.length)) return NextResponse.json({ error: 'This gallery is locked for selections.' }, { status: 403 });
    if (!photoId || !gallery.photos.some((photo) => photo.id === photoId)) return NextResponse.json({ error: 'Choose a photo in this gallery.' }, { status: 400 });
    const current = gallery.selections?.[gallery.id] || [];
    if (!current.includes(photoId) && gallery.selectionLimit && current.length >= gallery.selectionLimit) return NextResponse.json({ error: `Selection limit reached (${gallery.selectionLimit}).` }, { status: 400 });
    const next = [...new Set([...current, photoId])];
    gallery.selections = { ...(gallery.selections || {}), [gallery.id]: next };
    gallery.updatedAt = new Date().toISOString();
    await writeStore(store);
    return NextResponse.json({ ok: true, selected: next });
  } catch {
    return NextResponse.json({ error: 'Unable to save selection.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    const photoId = String(body.photoId || '').trim();
    const store = await readStore();
    const gallery = store.galleries.find((item) => item.slug === params.slug);
    if (!gallery) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    if (!getClientGallerySession(request, gallery.id)) return NextResponse.json({ error: 'Sign in to update selections.' }, { status: 401 });
    if (gallery.lockAfterSubmit && gallery.submissions.length) return NextResponse.json({ error: 'Selections are locked after submission.' }, { status: 403 });
    const next = (gallery.selections?.[gallery.id] || []).filter((id) => id !== photoId);
    gallery.selections = { ...(gallery.selections || {}), [gallery.id]: next };
    gallery.updatedAt = new Date().toISOString();
    await writeStore(store);
    return NextResponse.json({ ok: true, selected: next });
  } catch {
    return NextResponse.json({ error: 'Unable to remove selection.' }, { status: 500 });
  }
}
