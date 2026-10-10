import { put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/offer-auth';

export async function POST(request: Request) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Sign in to the studio dashboard to upload images.' }, { status: 401 });
  const data = await request.formData();
  const file = data.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Choose an image smaller than 10 MB.' }, { status: 400 });
  }
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const blob = await put(`sm-photography/offers/${safeName}`, file, { access: 'public', addRandomSuffix: true });
    return NextResponse.json({ url: blob.url });
  } catch {
    if (!process.env.VERCEL) {
      try {
        const directory = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(directory, { recursive: true });
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
        await fs.writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
        return NextResponse.json({ url: `/uploads/${filename}` });
      } catch { /* return the storage error below */ }
    }
    return NextResponse.json({ error: 'Image upload failed. Check Vercel Blob configuration.' }, { status: 503 });
  }
}
