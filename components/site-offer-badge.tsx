'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { Offer } from '@/lib/offer-types';

export function SiteOfferBadge({ markerOnly = false, className }: { markerOnly?: boolean; className?: string }) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const refreshOffer = useCallback(async () => {
    try {
      const response = await fetch('/api/offers', { cache: 'no-store' });
      const offers = response.ok ? await response.json() as Offer[] : [];
      setOffer(offers.find((item) => item.featured) || offers[0] || null);
    } catch { setOffer(null); }
  }, []);

  useEffect(() => {
    void refreshOffer();
    const interval = window.setInterval(() => void refreshOffer(), 15000);
    const onVisible = () => { if (document.visibilityState === 'visible') void refreshOffer(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [refreshOffer]);

  if (!offer) return null;
  if (markerOnly) return <span className="site-offer-active-marker" aria-hidden="true" />;
  return (
    <Link className={`site-offer-badge${className ? ` ${className}` : ''}`} href={`/offers/${offer.slug}`} aria-label={`View full details for ${offer.title}`}>
      <svg viewBox="0 0 140 112" aria-hidden="true">
        <path className="site-offer-rays" d="M69 2 79 17 95 7 98 25 118 20 113 39 137 45 120 58 136 72 116 78 120 99 99 92 91 110 75 98 62 110 54 93 34 101 37 82 14 78 29 62 8 48 30 40 22 22 43 27 50 7 65 20Z" />
        <path className="site-offer-banner" d="m21 38 99-14-8 47-88 12Z" />
        <path className="site-offer-banner-shadow" d="m36 83 25 8-18 16ZM84 75l24-4 14 24Z" />
        <text className="site-offer-text" x="70" y="51" textAnchor="middle">BEST</text>
        <text className="site-offer-text" x="70" y="70" textAnchor="middle">OFFER</text>
      </svg>
    </Link>
  );
}
