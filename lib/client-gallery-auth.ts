import { createHmac, timingSafeEqual } from 'crypto';

type GallerySession = { galleryId: string; exp: number; scope: 'client-gallery' };

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

export function createClientGallerySession(galleryId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ galleryId, scope: 'client-gallery', iat: now, exp: now + 12 * 60 * 60 });
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${createHmac('sha256', secret).update(unsigned).digest('base64url')}`;
}

export function getClientGallerySession(request: Request, galleryId: string): string | null {
  const secret = process.env.JWT_SECRET;
  const token = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith('sm_client_gallery_session='))?.slice('sm_client_gallery_session='.length);
  if (!secret || !token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
  const supplied = Buffer.from(parts[2], 'base64url');
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const session = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as GallerySession;
    if (session.scope !== 'client-gallery' || session.galleryId !== galleryId || !session.exp || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return session.galleryId;
  } catch { return null; }
}
