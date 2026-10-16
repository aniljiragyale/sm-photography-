import { NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/offer-auth';
import { getSiteAnalytics, recordSiteView } from '@/lib/site-analytics';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { path?: string };
    if (typeof body.path !== 'string' || !body.path.startsWith('/') || body.path.startsWith('//')) {
      return NextResponse.json({ error: 'Invalid page path.' }, { status: 400 });
    }
    await recordSiteView();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to record site visit.';
    return NextResponse.json({ error: message }, { status: process.env.VERCEL ? 503 : 500 });
  }
}

export async function GET(request: Request) {
  if (!isStudioAdmin(request)) return NextResponse.json({ error: 'Sign in to view website analytics.' }, { status: 401 });
  try {
    return NextResponse.json(await getSiteAnalytics());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load website analytics.';
    return NextResponse.json({ error: message }, { status: process.env.VERCEL ? 503 : 500 });
  }
}
