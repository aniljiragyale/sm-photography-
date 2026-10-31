import { NextResponse } from 'next/server';
import { getGalleryBySlug } from '@/lib/gallery-store';
import { getClientGallerySession } from '@/lib/client-gallery-auth';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const gallery = await getGalleryBySlug(params.slug);
    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    }
    if (!getClientGallerySession(request, gallery.id)) return NextResponse.json({ error: 'Sign in with the gallery password to view these photos.' }, { status: 401 });
    if (gallery.status !== 'active' || (gallery.expiresAt && Date.parse(gallery.expiresAt) <= Date.now())) return NextResponse.json({ error: 'This gallery is no longer available.' }, { status: 410 });

    const selectedIds = gallery.selections?.[gallery.id] || [];
    const photos = gallery.photos.map((photo, index) => ({
      id: photo.id,
      title: photo.fileName,
      image: photo.previewUrl,
      category: gallery.categories[0]?.name || 'ALL',
    }));

    return NextResponse.json({
      gallery: {
        id: gallery.id,
        slug: gallery.slug,
        clientName: gallery.clientName,
        galleryName: gallery.galleryName,
        eventType: gallery.eventType,
        eventDate: gallery.eventDate,
        status: gallery.status,
        photoCount: gallery.photos.length,
        selectedCount: selectedIds.length,
        photos,
        categories: gallery.categories.map((category) => category.name),
        selectionLimit: gallery.selectionLimit,
        allowDownload: gallery.allowDownload,
        lockAfterSubmit: gallery.lockAfterSubmit,
        watermarkEnabled: gallery.watermarkEnabled,
      },
      selectedIds,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load gallery.' }, { status: 500 });
  }
}
