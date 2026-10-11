import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.JWT_SECRET;
  if (!email || !password || !secret) {
    return NextResponse.json({ error: 'Admin login is not configured for this deployment. Set ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET in the hosting project’s server environment, then redeploy.' }, { status: 503 });
  }

  try {
    const input = await request.json() as { email?: string; password?: string };
    const suppliedEmail = Buffer.from(String(input.email || '').trim().toLowerCase());
    const expectedEmail = Buffer.from(email.trim().toLowerCase());
    const suppliedPassword = Buffer.from(String(input.password || ''));
    const expectedPassword = Buffer.from(password);
    const emailMatches = suppliedEmail.length === expectedEmail.length && timingSafeEqual(suppliedEmail, expectedEmail);
    const passwordMatches = suppliedPassword.length === expectedPassword.length && timingSafeEqual(suppliedPassword, expectedPassword);
    if (!emailMatches || !passwordMatches) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const now = Math.floor(Date.now() / 1000);
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const header = encode({ alg: 'HS256', typ: 'JWT' });
    const payload = encode({ id: 1, email: email.trim().toLowerCase(), iat: now, exp: now + 7 * 24 * 60 * 60 });
    const unsignedToken = `${header}.${payload}`;
    const signature = createHmac('sha256', secret).update(unsignedToken).digest('base64url');
    return NextResponse.json({ token: `${unsignedToken}.${signature}` });
  } catch {
    return NextResponse.json({ error: 'Unable to process admin login.' }, { status: 400 });
  }
}
