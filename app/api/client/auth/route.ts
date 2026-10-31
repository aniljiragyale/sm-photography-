import { NextResponse } from 'next/server';
import { readStore } from '@/lib/gallery-store';
import { createClientGallerySession } from '@/lib/client-gallery-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const galleryId = String(body.galleryId || '').trim();
    const password = String(body.password || '').trim();

    if (!galleryId || !password) {
      return NextResponse.json({ error: 'Gallery ID and password are required.' }, { status: 400 });
    }

    const store = await readStore();
    const gallery = store.galleries.find((item) => item.id === galleryId || item.slug === galleryId || item.galleryName.toLowerCase() === galleryId.toLowerCase());

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    }

    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    if (gallery.passwordHash !== hash) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, slug: gallery.slug });
    response.cookies.set('sm_client_gallery_session', createClientGallerySession(gallery.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/client/galleries',
      maxAge: 12 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Something went wrong while opening the gallery.' }, { status: 500 });
  }
}
