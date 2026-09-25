import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { ADMIN_PASSWORD, defaultBranches, defaultPackages, defaultServices, type BranchItem, type GalleryItem, type PackageItem, type ServiceItem } from '@/lib/admin-data';

const CONTENT_KEY = 'sm-photography:published-content';

export type PublishedContent = {
  packages: PackageItem[];
  services: ServiceItem[];
  gallery: GalleryItem[];
  branches: BranchItem[];
};

const getDefaults = (): PublishedContent => ({ packages: defaultPackages, services: defaultServices, gallery: [], branches: defaultBranches });
const hasRedisConfig = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

export async function GET() {
  if (!hasRedisConfig()) return NextResponse.json(getDefaults());

  try {
    const content = await Redis.fromEnv().get<PublishedContent>(CONTENT_KEY);
    return NextResponse.json(content || getDefaults());
  } catch {
    return NextResponse.json(getDefaults());
  }
}

export async function POST(request: Request) {
  if (request.headers.get('x-admin-password') !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasRedisConfig()) {
    return NextResponse.json({ error: 'Shared storage is not configured in Vercel.' }, { status: 503 });
  }

  try {
    const content = (await request.json()) as PublishedContent;
    if (!Array.isArray(content.packages) || !Array.isArray(content.services) || !Array.isArray(content.gallery) || !Array.isArray(content.branches)) {
      return NextResponse.json({ error: 'Invalid content.' }, { status: 400 });
    }
    await Redis.fromEnv().set(CONTENT_KEY, content);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to save content.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (request.headers.get('x-admin-password') !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasRedisConfig()) {
    return NextResponse.json({ error: 'Shared storage is not configured in Vercel.' }, { status: 503 });
  }

  try {
    await Redis.fromEnv().del(CONTENT_KEY);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to reset content.' }, { status: 500 });
  }
}