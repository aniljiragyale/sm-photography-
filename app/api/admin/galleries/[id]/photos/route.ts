import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/gallery-store';
import { isStudioAdmin } from '@/lib/offer-auth';

export const dynamic = 'force-dynamic';
const clean = (value: unknown, max = 180) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const input = await request.json() as { title?: unknown; category?: unknown; description?: unknown; imageUrl?: unknown };
    const imageUrl = clean(input.imageUrl, 2000);
    if (!imageUrl || !(imageUrl.startsWith('https://') || (imageUrl.startsWith('/') && !imageUrl.startsWith('//')))) return NextResponse.json({ error: 'Upload a valid image first.' }, { status: 400 });
    const store = await readStore();
    const gallery = store.galleries.find((item) => item.id === params.id || item.slug === params.id);
    if (!gallery) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    const categoryName = clean(input.category, 80) || 'ALL';
    let category = gallery.categories.find((item) => item.name.toLowerCase() === categoryName.toLowerCase());
    if (!category) {
      category = { id: `${gallery.slug}-${crypto.randomUUID()}`, galleryId: gallery.id, name: categoryName, sortOrder: gallery.categories.length + 1 };
      gallery.categories.push(category);
    }
    const photo = {
      id: crypto.randomUUID(), galleryId: gallery.id, categoryId: category.id,
      fileName: clean(input.title, 180) || 'Event photo', storagePath: imageUrl, previewUrl: imageUrl,
      width: 0, height: 0, sortOrder: gallery.photos.length + 1, createdAt: new Date().toISOString(),
    };
    gallery.photos.push(photo);
    gallery.updatedAt = new Date().toISOString();
    await writeStore(store);
    return NextResponse.json({ ...photo, title: photo.fileName, category: category.name, description: clean(input.description, 500) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Could not add photo to gallery.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const photoId = new URL(request.url).searchParams.get('photoId');
    const store = await readStore();
    const gallery = store.galleries.find((item) => item.id === params.id || item.slug === params.id);
    if (!gallery) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    const photos = gallery.photos.filter((photo) => photo.id !== photoId);
    if (photos.length === gallery.photos.length) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });
    gallery.photos = photos;
    gallery.updatedAt = new Date().toISOString();
    await writeStore(store);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not remove photo.' }, { status: 500 });
  }
}
