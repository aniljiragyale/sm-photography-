export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  description?: string;
};

export type PackageItem = {
  name: string;
  price: string;
  items: string[];
};

export type ServiceItem = {
  title: string;
  description: string;
  deliverables: string;
};


export type BranchItem = {
  id: string;
  name: string;
  address: string;
  locationUrl: string;
  description: string;
  image: string;
};

export type PublishedContent = {
  packages: PackageItem[];
  services: ServiceItem[];
  gallery: GalleryItem[];
  branches: BranchItem[];
};

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@smphotography.com';
export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'change-this-password';
export const ADMIN_LOGIN_KEY = 'sm_admin_logged_in';
export const ADMIN_GALLERY_KEY = 'sm_admin_gallery_items';
export const ADMIN_PACKAGES_KEY = 'sm_admin_packages';
export const ADMIN_SERVICES_KEY = 'sm_admin_services';

export const galleryCategories = ['all', 'wedding', 'prewedding', 'engagement', 'maternity', 'candid', 'modeling'];

export const defaultPackages: PackageItem[] = [
  { name: 'Silver Package', price: '₹30,000', items: ['Traditional Photographer', 'Traditional Videographer', '20-Page Photobook Album', 'Video Editing and Reels', '12x36 NT HD Photobook Album'] },
  { name: 'Gold Package', price: '₹50,000', items: ['Traditional Photographer', 'Traditional Videographer', 'Candid Photographer', '25-Page Photobook Album', 'Video Editing with Highlights + Reel', '12x36 NT HD Photobook Album'] },
  { name: 'Diamond Package', price: '₹70,000', items: ['Traditional Photographer', 'Traditional Videographer', 'Candid Photographer', 'Cinematic Videographer', '30-Page Photobook Album', 'Video Editing with Highlights Reel', 'Unlimited Photos', '12x36 NT HD Photobook Album'] },
  { name: 'Pre-Wedding Package', price: '₹45,000', items: ['Candid Photography', 'Cinematic Videography + Drone', 'Teaser Video + Reel + Highlight (4K / Full HD Video)'] },
  { name: 'Maternity Package', price: '₹10,000', items: ['1 Day Rate', 'Candid Photography (25-30 Edited Photos + All RAW Soft Copy + Reel)'] },
  { name: 'Terms & Conditions', price: 'Flexible', items: ['75% payment in advance', 'Transportation and location charges separately', 'Stay and dinner managed by clients'] },
];

export const defaultServices: ServiceItem[] = [
  { title: 'Wedding Shoot', description: 'A complete visual story of your wedding, from preparations and rituals to the reception. We balance candid emotion, family portraits, couple direction, and detail photography.', deliverables: 'Candid coverage, family portraits, couple portraits, rituals, edited gallery, and album-ready selections.' },
  { title: 'Pre-Wedding Shoot', description: 'Relaxed, location-based sessions built around your chemistry and personality. We help with concepts, styling, locations, and natural posing.', deliverables: 'Concept planning, location guidance, edited portraits, cinematic frames, and social-media reels.' },
  { title: 'Cinematic Videography', description: 'Story-led wedding and event films with thoughtful camera movement, clean sound, emotional pacing, and polished editing.', deliverables: 'Teaser film, highlight edit, full-event coverage options, reels, and music-synced storytelling.' },
  { title: 'Maternity Photography', description: 'Gentle portraits that celebrate pregnancy with soft light, comfortable direction, and intimate family moments.', deliverables: 'Wardrobe guidance, location or home session, individual portraits, couple portraits, and edited keepsakes.' },
  { title: 'Outdoor Sessions', description: 'Natural-light portraits designed around golden hour, meaningful locations, scenic backdrops, and an easy-going experience.', deliverables: 'Location planning, creative direction, natural posing, edited gallery, and print-ready images.' },
  { title: 'Event Coverage', description: 'Reliable coverage for birthdays, engagements, anniversaries, cultural celebrations, and corporate gatherings.', deliverables: 'Guest moments, decor and details, group portraits, candid reactions, and a curated final gallery.' },
  { title: 'Candid Photography', description: 'Unobtrusive photography focused on genuine expressions, laughter, tears, movement, and the moments people often miss.', deliverables: 'Natural storytelling, reaction photography, candid portraits, and carefully edited high-resolution images.' },
  { title: 'Modeling Portfolios', description: 'Portfolio sessions that present your personality and range with clear direction, considered lighting, and strong visual framing.', deliverables: 'Mood-board planning, pose direction, outfit guidance, editorial portraits, and portfolio-ready selects.' },
  { title: 'Drone Shoot', description: 'Aerial photography and video that add scale and cinematic perspective to venues, outdoor celebrations, properties, and destinations.', deliverables: 'Aerial establishing shots, venue perspectives, cinematic clips, and coordinated ground-and-air storytelling.' },
];

export const defaultBranches: BranchItem[] = [
  {
    id: 'branch-1',
    name: 'SM Photo Studio & Films - Malgaon',
    address: 'Malgaon, Sangli District, Maharashtra, India',
    locationUrl: 'https://maps.app.goo.gl/AwgoQrcp92duJkoT6',
    description: 'Our original studio branch for weddings, portraits, films, and creative sessions.',
    image: '/images/Wedding (34).JPG',
  },
  {
    id: 'branch-2',
    name: 'SM Photo Studio & Films - Miraj',
    address: 'Miraj, Maharashtra, India',
    locationUrl: 'https://share.google/ZnDunM3nDt7smSKDr',
    description: 'Our second branch serving clients across Miraj, Sangli, and Miraj Kupwad.',
    image: '/images/Prewedding (23).jpg',
  },
];

export const defaultGalleryItems: GalleryItem[] = [
  { id: 'wedding-1', title: 'Elegant Wedding', category: 'wedding', image: '/images/IMG_2887.JPG', description: 'Timeless wedding frames with warmth and emotion.' },
  { id: 'wedding-2', title: 'Togetherness', category: 'wedding', image: '/images/IMG_2974.JPG', description: 'Family laughter, rituals and unforgettable vows.' },
  { id: 'wedding-3', title: 'Forever Begins Here', category: 'wedding', image: '/images/IMG_5206_WED (1).JPG', description: 'Celebrating love with cinematic storytelling.' },
  { id: 'prewedding-1', title: 'Love in the Air', category: 'prewedding', image: '/images/Prewedding (21).jpg', description: 'Soft, romantic portraits in meaningful locations.' },
  { id: 'prewedding-2', title: 'Golden Hour Romance', category: 'prewedding', image: '/images/Prewedding (26).jpg', description: 'Natural poses and glowing memories.' },
  { id: 'prewedding-3', title: 'Moments Before the Vows', category: 'prewedding', image: '/images/Prewedding (23).jpg', description: 'Quiet, intimate love-story magic.' },
  { id: 'engagement-1', title: 'Engagement Bliss', category: 'engagement', image: '/images/Engg (10).JPG', description: 'Graceful portraits for a joyful new beginning.' },
  { id: 'engagement-2', title: 'Promise of Forever', category: 'engagement', image: '/images/Engg (1).jpeg', description: 'A promise framed with elegance and light.' },
  { id: 'engagement-3', title: 'Celebrate the Journey', category: 'engagement', image: '/images/ENG.JPG', description: 'Bold celebration moments and warm emotions.' },
  { id: 'maternity-1', title: 'Glow Within', category: 'maternity', image: '/images/Maternity (21).jpg', description: 'Portraits celebrating the beauty of motherhood.' },
  { id: 'maternity-2', title: 'Motherhood Begins', category: 'maternity', image: '/images/Maternity (30).jpg', description: 'Gentle light and treasured anticipation.' },
  { id: 'maternity-3', title: 'Miracle of Life', category: 'maternity', image: '/images/Maternity (37).jpg', description: 'A soft and luminous chapter in family life.' },
  { id: 'candid-1', title: 'Joy Unfiltered', category: 'candid', image: '/images/Candid (1).jpeg', description: 'Honest moments that hold the heart of the day.' },
  { id: 'candid-2', title: 'Laughter in Motion', category: 'candid', image: '/images/Candid (10).jpg', description: 'Pure emotion and spontaneous celebration.' },
  { id: 'candid-3', title: 'Life’s Little Wonders', category: 'candid', image: '/images/Candid (8).jpeg', description: 'Real smiles, real love, real memories.' },
  { id: 'modeling-1', title: 'Fashion Forward', category: 'modeling', image: '/images/Modeling (5).jpg', description: 'Editorial confidence with a polished visual identity.' },
  { id: 'modeling-2', title: 'Style & Grace', category: 'modeling', image: '/images/Modeling (6).jpg', description: 'Bold, refined imagery for standout portfolios.' },
  { id: 'modeling-3', title: 'Captivating Presence', category: 'modeling', image: '/images/Modeling (8).jpg', description: 'Clean composition with confident energy.' },
];

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ADMIN_LOGIN_KEY) === 'true';
}

export function setAdminLoggedIn(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    window.localStorage.setItem(ADMIN_LOGIN_KEY, 'true');
    return;
  }

  window.localStorage.removeItem(ADMIN_LOGIN_KEY);
}

export function getCustomGalleryItems(): GalleryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(ADMIN_GALLERY_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as GalleryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAllGalleryItems(): GalleryItem[] {
  return [...defaultGalleryItems, ...getCustomGalleryItems()];
}

export function saveCustomGalleryItems(items: GalleryItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_GALLERY_KEY, JSON.stringify(items));
}

function getSavedContent<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getPackages(): PackageItem[] {
  return getSavedContent(ADMIN_PACKAGES_KEY, defaultPackages);
}

export function savePackages(packages: PackageItem[]): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(ADMIN_PACKAGES_KEY, JSON.stringify(packages));
}

export function getServices(): ServiceItem[] {
  return getSavedContent(ADMIN_SERVICES_KEY, defaultServices);
}

export function saveServices(services: ServiceItem[]): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(ADMIN_SERVICES_KEY, JSON.stringify(services));
}

export function resetContent(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_PACKAGES_KEY);
  window.localStorage.removeItem(ADMIN_SERVICES_KEY);
}

export async function loadPublishedContent(): Promise<PublishedContent> {
  try {
    const response = await fetch('/api/content', { cache: 'no-store' });
    if (!response.ok) throw new Error('Content request failed');
    const content = (await response.json()) as PublishedContent;
    const localGallery = getCustomGalleryItems();
    const localPackages = getSavedContent<PackageItem[] | null>(ADMIN_PACKAGES_KEY, null);
    const localServices = getSavedContent<ServiceItem[] | null>(ADMIN_SERVICES_KEY, null);
    const galleryById = new Map([...localGallery, ...content.gallery].map((item) => [item.id, item]));

    const savedPackages = localPackages || content.packages;
    const packageMap = new Map(defaultPackages.map((item) => [item.name, item]));
    savedPackages.forEach((item) => packageMap.set(item.name, item));
    const branchMap = new Map(defaultBranches.map((item) => [item.id, item]));
    content.branches.forEach((item) => branchMap.set(item.id, {
      ...branchMap.get(item.id),
      ...item,
      image: item.image || branchMap.get(item.id)?.image || '',
    }));

    return {
      ...content,
      packages: [...packageMap.values()],
      services: localServices || content.services,
      gallery: [...galleryById.values()],
      branches: [...branchMap.values()],
    };
  } catch {
    return { packages: getPackages(), services: getServices(), gallery: getCustomGalleryItems(), branches: defaultBranches };
  }
}

export async function savePublishedContent(content: PublishedContent, password: string): Promise<boolean> {
  savePackages(content.packages);
  saveServices(content.services);

  try {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(content),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function resetPublishedContent(password: string): Promise<boolean> {
  resetContent();

  try {
    const response = await fetch('/api/content', {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    });
    return response.ok;
  } catch {
    return false;
  }
}
