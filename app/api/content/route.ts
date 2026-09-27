import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { ADMIN_PASSWORD, DEFAULT_BANNER_IMAGE, defaultBranches, defaultPackages, defaultServices, type BranchItem, type GalleryItem, type PackageItem, type ServiceItem } from '@/lib/admin-data';

const CONTENT_KEY = 'sm-photography:published-content';
const CONTENT_FILE = path.join(process.cwd(), 'data', 'published-content.json');

export type PublishedContent = {
  packages: PackageItem[];
  services: ServiceItem[];
  gallery: GalleryItem[];
  branches: BranchItem[];
  bannerImage?: string;
};

const getDefaults = (): PublishedContent => ({ packages: defaultPackages, services: defaultServices, gallery: [], branches: defaultBranches, bannerImage: DEFAULT_BANNER_IMAGE });
const hasRedisConfig = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let localContent: PublishedContent | null = null;

const withDefaultPackages = (content: PublishedContent): PublishedContent => {
  const packageMap = new Map(defaultPackages.map((item) => [item.name, item]));
  content.packages.forEach((item) => packageMap.set(item.name, item));
  return { ...content, packages: [...packageMap.values()], bannerImage: content.bannerImage || DEFAULT_BANNER_IMAGE };
};

async function readLocalContent(): Promise<PublishedContent | null> {
  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PublishedContent>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      packages: Array.isArray(parsed.packages) ? parsed.packages as PackageItem[] : defaultPackages,
      services: Array.isArray(parsed.services) ? parsed.services as ServiceItem[] : defaultServices,
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery as GalleryItem[] : [],
      branches: Array.isArray(parsed.branches) ? parsed.branches as BranchItem[] : defaultBranches,
      bannerImage: typeof parsed.bannerImage === 'string' ? parsed.bannerImage : DEFAULT_BANNER_IMAGE,
    };
  } catch {
    return null;
  }
}

async function writeLocalContent(content: PublishedContent) {
  await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true });
  await fs.writeFile(CONTENT_FILE, JSON.stringify(content, null, 2));
  localContent = content;
}

async function clearLocalContent() {
  try { await fs.unlink(CONTENT_FILE); } catch { /* no-op */ }
  localContent = null;
}

export async function GET() {
  if (!hasRedisConfig()) {
    const saved = localContent || (await readLocalContent()) || getDefaults();
    return NextResponse.json(withDefaultPackages(saved));
  }

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
    const payload: PublishedContent = {
      ...content,
      packages: content.packages,
      services: content.services,
      gallery: content.gallery,
      branches: content.branches,
      bannerImage: content.bannerImage || DEFAULT_BANNER_IMAGE,
    };

    if (!hasRedisConfig()) {
      await writeLocalContent(payload);
      return NextResponse.json({ ok: true, shared: false });
    }
    await Redis.fromEnv().set(CONTENT_KEY, payload);
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
    await clearLocalContent();
    return NextResponse.json({ ok: true, shared: false });
  }

  try {
    await Redis.fromEnv().del(CONTENT_KEY);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to reset content.' }, { status: 500 });
  }
}