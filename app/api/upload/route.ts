import { put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/offer-auth';

export async function POST(request: Request) {
  if (!isStudioAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Configure BLOB_READ_WRITE_TOKEN to upload images on Vercel.' }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Please upload an image file.' }, { status: 400 });
  }

  try {
    const blob = await put(`sm-photography/${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch {
    if (process.env.VERCEL) {
      return NextResponse.json({ error: 'Vercel Blob could not store this image. Check the Blob store and BLOB_READ_WRITE_TOKEN configuration.' }, { status: 503 });
    }
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const filePath = path.join(uploadDir, safeName);
      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));
      return NextResponse.json({ url: `/uploads/${safeName}` });
    } catch (fallbackError) {
      return NextResponse.json({ error: 'Image storage is not configured and local upload also failed.' }, { status: 503 });
    }
  }
}
