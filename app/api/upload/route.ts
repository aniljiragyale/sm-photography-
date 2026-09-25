import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { ADMIN_PASSWORD } from '@/lib/admin-data';

export async function POST(request: Request) {
  if (request.headers.get('x-admin-password') !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    return NextResponse.json({ error: 'Image storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel.' }, { status: 503 });
  }
}