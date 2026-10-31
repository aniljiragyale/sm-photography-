import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/gallery-store';
import { isStudioAdmin } from '@/lib/offer-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const input = await request.json() as { status?: unknown; expiresAt?: unknown };
    if (input.status !== undefined && !['draft', 'active', 'submitted', 'expired', 'archived'].includes(String(input.status))) {
      return NextResponse.json({ error: 'Choose a valid gallery status.' }, { status: 400 });
    }
    const store = await readStore();
    const gallery = store.galleries.find((item) => item.id === params.id || item.slug === params.id);
    if (!gallery) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    if (input.status !== undefined) gallery.status = input.status as typeof gallery.status;
    if (input.expiresAt !== undefined) gallery.expiresAt = input.expiresAt ? new Date(String(input.expiresAt)).toISOString() : null;
    gallery.updatedAt = new Date().toISOString();
    await writeStore(store);
    const { passwordHash, ...safeGallery } = gallery;
    return NextResponse.json({ ...safeGallery, hasPassword: Boolean(passwordHash) });
  } catch {
    return NextResponse.json({ error: 'Could not update gallery.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const store = await readStore();
    const next = store.galleries.filter((item) => item.id !== params.id && item.slug !== params.id);
    if (next.length === store.galleries.length) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    await writeStore({ galleries: next });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not delete gallery.' }, { status: 500 });
  }
}
