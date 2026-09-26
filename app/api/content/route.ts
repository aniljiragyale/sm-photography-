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

let localContent: PublishedContent | null = null;
const withDefaultPackages = (content: PublishedContent): PublishedContent => {
  const packageMap = new Map(defaultPackages.map((item) => [item.name, item]));
  content.packages.forEach((item) => packageMap.set(item.name, item));
  return { ...content, packages: [...packageMap.values()] };
};

export async function GET() {
  if (!hasRedisConfig()) return NextResponse.json(localContent ? withDefaultPackages(localContent) : getDefaults());

  try {
    const content = await Redis.fromEnv().get<PublishedContent>(CONTENT_KEY);
    return NextResponse.json(content ? withDefaultPackages(content) : getDefaults());
  } catch {
    return NextResponse.json(getDefaults());
  }
}

export async function POST(request: Request) {
  if (request.headers.get('x-admin-password') !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const content = (await request.json()) as PublishedContent;
    if (!Array.isArray(content.packages) || !Array.isArray(content.services) || !Array.isArray(content.gallery) || !Array.isArray(content.branches)) {
      return NextResponse.json({ error: 'Invalid content.' }, { status: 400 });
    }
    if (!hasRedisConfig()) {
      localContent = content;
      return NextResponse.json({ ok: true, shared: false });
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
    localContent = null;
    return NextResponse.json({ ok: true, shared: false });
  }

  try {
    await Redis.fromEnv().del(CONTENT_KEY);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to reset content.' }, { status: 500 });
  }
}