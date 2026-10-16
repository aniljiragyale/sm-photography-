import type { Offer } from './offer-types';

// Existing featured offer used to initialize a newly connected production store.
export const DEFAULT_OFFERS: Offer[] = [
  {
    id: '51c5d61d-b34e-499a-95f4-2a6c2a688e15',
    slug: 'maternity-photography-packages',
    title: 'Maternity Photography Packages',
    description: `Celebrate your journey to motherhood with a maternity session designed around you.\n\nBASIC — ₹3,000\n10 edited photos · 1 cinematic reel · 1 outfit included\n\nPREMIUM — ₹5,000\n15 edited photos · 1 cinematic reel · 2 outfits included\n\nPREMIUM PLUS — ₹7,000\n15 edited photos · 1 cinematic reel · 2 outfits · professional makeup and hairstyling\n\nLUXURY — ₹10,000\n15 edited photos · 1 cinematic reel · premium album · 2 outfits · professional makeup and hairstyling\n\nProfessional photography, creative concepts, a comfortable and safe experience, and timeless memories.`,
    image: '/images/Maternity (28).jpg',
    discountType: 'none',
    discountValue: 0,
    packages: ['Maternity'],
    startsAt: '2026-10-10T12:32:08.533Z',
    endsAt: null,
    active: true,
    featured: true,
    label: 'Special Offer',
    createdAt: '2026-10-10T12:32:08.574Z',
    updatedAt: '2026-10-10T12:32:36.615Z',
  },
];
