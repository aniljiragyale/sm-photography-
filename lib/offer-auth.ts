import { createHmac, timingSafeEqual } from 'crypto';

export function isStudioAdmin(request: Request): boolean {
  const secret = process.env.JWT_SECRET;
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!secret || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as { alg?: string };
    if (header.alg !== 'HS256') return false;
  } catch { return false; }
  const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
  let supplied: Buffer;
  try { supplied = Buffer.from(parts[2], 'base64url'); } catch { return false; }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { exp?: number; id?: number; email?: string };
    return Boolean(payload.id && payload.email && payload.exp && payload.exp > Math.floor(Date.now() / 1000));
  } catch { return false; }
}
