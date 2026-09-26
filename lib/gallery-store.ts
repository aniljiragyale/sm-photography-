import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export type GalleryStatus = 'draft' | 'active' | 'submitted' | 'expired' | 'archived';

export type GalleryPhoto = {
  id: string;
  galleryId: string;
  categoryId: string | null;
  fileName: string;
  storagePath: string;
  previewUrl: string;
  width: number;
  height: number;
  sortOrder: number;
  createdAt: string;
};

export type GalleryCategory = {
  id: string;
  galleryId: string;
  name: string;
  sortOrder: number;
};

export type GallerySelection = {
  id: string;
  galleryId: string;
  photoId: string;
  clientSessionId: string;
  createdAt: string;
  updatedAt: string;
};

export type GallerySubmission = {
  id: string;
  galleryId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  selectedCount: number;
  submittedAt: string;
  status: 'pending' | 'submitted' | 'locked';
};

export type ClientGallery = {
  id: string;
  slug: string;
  clientName: string;
  galleryName: string;
  eventType: string;
  eventDate: string;
  location: string;
  passwordHash: string;
  selectionLimit: number | null;
  allowDownload: boolean;
  lockAfterSubmit: boolean;
  watermarkEnabled: boolean;
  status: GalleryStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  photos: GalleryPhoto[];
  categories: GalleryCategory[];
  submissions: GallerySubmission[];
};

export type GalleryStore = {
  galleries: ClientGallery[];
};

const STORE_PATH = path.join(process.cwd(), 'data', 'gallery-store.json');

const hashText = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'gallery';

const defaultCategories = ['BRIDE', 'GROOM', 'COUPLE', 'FAMILY', 'CEREMONY'];

const seedGallery = (): ClientGallery => {
  const now = new Date().toISOString();
  const photos: GalleryPhoto[] = [
    { id: 'seed-photo-1', galleryId: 'seed-gallery', categoryId: null, fileName: 'Wedding (34).JPG', storagePath: '/images/Wedding (34).JPG', previewUrl: '/images/Wedding (34).JPG', width: 1200, height: 1600, sortOrder: 1, createdAt: now },
    { id: 'seed-photo-2', galleryId: 'seed-gallery', categoryId: null, fileName: 'Prewedding (23).jpg', storagePath: '/images/Prewedding (23).jpg', previewUrl: '/images/Prewedding (23).jpg', width: 1200, height: 1600, sortOrder: 2, createdAt: now },
    { id: 'seed-photo-3', galleryId: 'seed-gallery', categoryId: null, fileName: 'Maternity (30).jpg', storagePath: '/images/Maternity (30).jpg', previewUrl: '/images/Maternity (30).jpg', width: 1200, height: 1600, sortOrder: 3, createdAt: now },
    { id: 'seed-photo-4', galleryId: 'seed-gallery', categoryId: null, fileName: 'Candid (8).jpeg', storagePath: '/images/Candid (8).jpeg', previewUrl: '/images/Candid (8).jpeg', width: 1200, height: 1600, sortOrder: 4, createdAt: now },
  ];

  return {
    id: 'SM-WED-2026-001',
    slug: 'rahul-priya-wedding',
    clientName: 'Rahul & Priya',
    galleryName: 'Rahul & Priya Wedding',
    eventType: 'Wedding Photography',
    eventDate: '2026-12-12',
    location: 'Malgaon, Sangli',
    passwordHash: hashText('sm-wed-2026'),
    selectionLimit: 100,
    allowDownload: false,
    lockAfterSubmit: false,
    watermarkEnabled: true,
    status: 'active',
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
    photos,
    categories: defaultCategories.map((name, index) => ({ id: `${name.toLowerCase()}-${index + 1}`, galleryId: 'seed-gallery', name, sortOrder: index + 1 })),
    submissions: [],
  };
};

export const ensureStore = async (): Promise<GalleryStore> => {
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    try {
      const current = await fs.readFile(STORE_PATH, 'utf8');
      if (current.trim()) {
        const parsed = JSON.parse(current) as Partial<GalleryStore>;
        if (parsed && Array.isArray(parsed.galleries)) return parsed as GalleryStore;
      }
    } catch {
      // Ignore parse issues and fall through to default seed.
    }

    const initial: GalleryStore = { galleries: [seedGallery()] };
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  } catch {
    return { galleries: [seedGallery()] };
  }
};

export const readStore = async (): Promise<GalleryStore> => {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    if (!raw.trim()) return { galleries: [seedGallery()] };
    const parsed = JSON.parse(raw) as Partial<GalleryStore>;
    if (parsed && Array.isArray(parsed.galleries)) return parsed as GalleryStore;
  } catch {
    // fall through to seed store
  }

  const seeded = { galleries: [seedGallery()] };
  await fs.writeFile(STORE_PATH, JSON.stringify(seeded, null, 2), 'utf8');
  return seeded;
};

export const writeStore = async (store: GalleryStore): Promise<void> => {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
};

export const createGalleryRecord = (input: {
  clientName: string;
  galleryName: string;
  eventType: string;
  eventDate: string;
  location: string;
  password: string;
  selectionLimit?: number | null;
  allowDownload?: boolean;
  lockAfterSubmit?: boolean;
  watermarkEnabled?: boolean;
  slug?: string;
}): ClientGallery => {
  const now = new Date().toISOString();
  const slugBase = input.slug || `${makeSlug(input.clientName)}-${makeSlug(input.galleryName)}`;
  const slug = `${slugBase}`.replace(/-+/g, '-').replace(/-$/, '').substring(0, 64) || 'new-gallery';

  return {
    id: `gallery-${Date.now()}`,
    slug,
    clientName: input.clientName.trim() || 'Client',
    galleryName: input.galleryName.trim() || 'New Gallery',
    eventType: input.eventType.trim() || 'Wedding',
    eventDate: input.eventDate || new Date().toISOString().slice(0, 10),
    location: input.location.trim() || 'Location',
    passwordHash: hashText(input.password || 'gallery-password'),
    selectionLimit: input.selectionLimit && input.selectionLimit > 0 ? input.selectionLimit : null,
    allowDownload: Boolean(input.allowDownload),
    lockAfterSubmit: Boolean(input.lockAfterSubmit),
    watermarkEnabled: Boolean(input.watermarkEnabled),
    status: 'active',
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
    photos: [],
    categories: defaultCategories.map((name, index) => ({ id: `${slug}-${index + 1}`, galleryId: `gallery-${Date.now()}`, name, sortOrder: index + 1 })),
    submissions: [],
  };
};

export const getGalleryBySlug = async (slug: string): Promise<ClientGallery | null> => {
  const store = await readStore();
  return store.galleries.find((gallery) => gallery.slug === slug) || null;
};

export const getGalleryById = async (id: string): Promise<ClientGallery | null> => {
  const store = await readStore();
  return store.galleries.find((gallery) => gallery.id === id) || null;
};

export const verifyGalleryPassword = async (galleryId: string, password: string): Promise<ClientGallery | null> => {
  const store = await readStore();
  const gallery = store.galleries.find((item) => item.id === galleryId || item.slug === galleryId);
  if (!gallery) return null;
  return hashText(password) === gallery.passwordHash ? gallery : null;
};

export const getSelectedPhotoIds = (gallery: ClientGallery, clientSessionId: string): string[] => {
  const selected = gallery.photos.filter((photo) => {
    const selectionMap = (globalThis as any).__smGallerySelections ?? {};
    const sessionSelections = selectionMap[`${gallery.id}:${clientSessionId}`] || [];
    return sessionSelections.includes(photo.id);
  });

  return selected.map((photo) => photo.id);
};

export const createSampleGallerySelectionMap = async () => {
  const store = await readStore();
  const gallery = store.galleries[0];
  if (!gallery) return;
  const sessionKey = `${gallery.id}:demo-client`;
  (globalThis as any).__smGallerySelections = { ...(globalThis as any).__smGallerySelections, [sessionKey]: gallery.photos.slice(0, 2).map((photo) => photo.id) };
};

export const normalizeGallery = (gallery: ClientGallery): ClientGallery => ({
  ...gallery,
  status: gallery.status || 'active',
  selectionLimit: gallery.selectionLimit ?? null,
  allowDownload: Boolean(gallery.allowDownload),
  lockAfterSubmit: Boolean(gallery.lockAfterSubmit),
  watermarkEnabled: Boolean(gallery.watermarkEnabled),
  photos: gallery.photos ?? [],
  categories: gallery.categories ?? [],
  submissions: gallery.submissions ?? [],
});
