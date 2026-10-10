export const OFFER_PACKAGES = ['Silver', 'Gold', 'Diamond', 'Pre-Wedding', 'Maternity', 'Baby Shoot'] as const;
export type OfferPackage = typeof OFFER_PACKAGES[number];
export type Offer = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  packages: OfferPackage[];
  startsAt: string;
  endsAt: string | null;
  active: boolean;
  featured: boolean;
  label: 'Special Offer' | 'Limited Time Offer' | '';
  createdAt: string;
  updatedAt: string;
};

export function offerIsLive(offer: Offer, now = Date.now()): boolean {
  return offer.active && Date.parse(offer.startsAt) <= now && (!offer.endsAt || Date.parse(offer.endsAt) > now);
}

export function formatOfferDiscount(offer: Offer): string {
  if (offer.discountType === 'percentage') return `${offer.discountValue}% OFF`;
  if (offer.discountType === 'fixed') return `₹${offer.discountValue.toLocaleString('en-IN')} OFF`;
  return 'SPECIAL PRICE';
}
