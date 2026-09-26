import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/gallery-store';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    const photoId = String(body.photoId || '').trim();
    const store = await readStore();
    const gallery = store.galleries.find((item) => item.slug === params.slug);

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    }

    if (!photoId) {
      return NextResponse.json({ error: 'Photo is required.' }, { status: 400 });
    }

    const selectionKey = `${gallery.id}:demo-client`;
    const current = (globalThis as any).__smGallerySelections?.[selectionKey] || [];
    const next = [...new Set([...current, photoId])];
    (globalThis as any).__smGallerySelections = { ...((globalThis as any).__smGallerySelections || {}), [selectionKey]: next };

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

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    }

    const selectionKey = `${gallery.id}:demo-client`;
    const current = (globalThis as any).__smGallerySelections?.[selectionKey] || [];
    const next = current.filter((id: string) => id !== photoId);
    (globalThis as any).__smGallerySelections = { ...((globalThis as any).__smGallerySelections || {}), [selectionKey]: next };

    return NextResponse.json({ ok: true, selected: next });
  } catch {
    return NextResponse.json({ error: 'Unable to remove selection.' }, { status: 500 });
  }
}
