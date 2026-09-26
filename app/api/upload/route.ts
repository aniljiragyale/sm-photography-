import { put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';
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