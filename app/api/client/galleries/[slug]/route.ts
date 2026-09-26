import { NextResponse } from 'next/server';
import { getGalleryBySlug, readStore } from '@/lib/gallery-store';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const gallery = await getGalleryBySlug(params.slug);
    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    }

    const selectedIds = (globalThis as any).__smGallerySelections?.[`${gallery.id}:demo-client`] || [];
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
