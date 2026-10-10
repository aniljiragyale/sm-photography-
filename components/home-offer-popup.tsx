'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Offer } from '@/lib/offer-types';

export function HomeOfferPopup() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = () => fetch('/api/offers', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() as Promise<Offer[]> : [])
      .then((offers) => setOffer(offers.find((item) => item.featured) || offers[0] || null))
      .catch(() => setOffer(null));
    void load();
    const interval = window.setInterval(load, 15000);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  useEffect(() => {
    if (!offer) { setOpen(false); return; }
    const timer = window.setTimeout(() => setOpen(true), 750);
    return () => window.clearTimeout(timer);
  }, [offer?.id, offer?.updatedAt]);

  if (!offer || !open) return null;

  return (
    <div className="home-offer-ad-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <article className="home-offer-ad" role="dialog" aria-modal="true" aria-label={`Special offer: ${offer.title}`}>
        <div className="home-offer-ad-sparks" aria-hidden="true" />
        <button className="home-offer-ad-close" type="button" aria-label="Close offer" onClick={() => setOpen(false)}>×</button>
        <div className="home-offer-ad-image" style={offer.image ? { backgroundImage: `url("${encodeURI(offer.image)}")` } : undefined} />
        <div className="home-offer-ad-copy">
          <p className="eyebrow">{offer.label || 'Special Offer'} is waiting for you</p>
          <h2>{offer.title}</h2>
          <p className="home-offer-ad-description">{offer.description}</p>
          <span className="home-offer-ad-packages">For {offer.packages.join(' / ')}</span>
          <p className="home-offer-ad-booking-prompt">Book your {offer.packages[0]?.toLowerCase() || ''} session today.</p>
          <Link className="home-offer-ad-cta" href={`/offers/${offer.slug}`}>View Full Details <span aria-hidden="true">→</span></Link>
        </div>
      </article>
    </div>
  );
}
