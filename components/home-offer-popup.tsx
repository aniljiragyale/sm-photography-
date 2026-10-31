'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Offer } from '@/lib/offer-types';
import { defaultOfferPopup, type OfferPopupSettings } from '@/lib/admin-data';
import { getOfferIntro, normalizeOfferCopy } from '@/lib/offer-copy';

export function HomeOfferPopup() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [popup, setPopup] = useState<OfferPopupSettings>(defaultOfferPopup);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [offerResponse, contentResponse] = await Promise.all([
          fetch('/api/offers', { cache: 'no-store' }),
          fetch('/api/content', { cache: 'no-store' }),
        ]);
        const offers = offerResponse.ok ? await offerResponse.json() as Offer[] : [];
        const content = contentResponse.ok ? await contentResponse.json() as { offerPopup?: OfferPopupSettings } : null;
        setPopup(content?.offerPopup || defaultOfferPopup);
        const homeOffers = offers.filter((item) => !item.placements?.length || item.placements.includes('home'));
        setOffer(homeOffers.find((item) => item.featured) || homeOffers[0] || null);
      } catch {
        setOffer(null);
      }
    };
    void load();
    const interval = window.setInterval(load, 15000);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  useEffect(() => {
    if (!offer || !popup.enabled) { setOpen(false); return; }
    const seenKey = `sm-home-offer-seen:${offer.id}`;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const reloadKey = `sm-home-offer-reload:${Math.floor(performance.timeOrigin)}`;
    if (navigation?.type === 'reload' && !window.sessionStorage.getItem(reloadKey)) {
      window.sessionStorage.removeItem(seenKey);
      window.sessionStorage.setItem(reloadKey, '1');
    }
    if (window.sessionStorage.getItem(seenKey)) return;
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(seenKey, '1');
      setOpen(true);
    }, 750);
    return () => window.clearTimeout(timer);
  }, [offer?.id, offer?.updatedAt, popup.enabled, popup.title, popup.description, popup.image]);

  if (!offer || !popup.enabled || !open) return null;
  const image = popup.image || offer.image;

  return (
    <div className="home-offer-ad-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <article className="home-offer-ad" role="dialog" aria-modal="true" aria-label={`Special offer: ${offer.title}`}>
        <div className="home-offer-ad-sparks" aria-hidden="true" />
        <button className="home-offer-ad-close" type="button" aria-label="Close offer" onClick={() => setOpen(false)}>×</button>
        <div className="home-offer-ad-image" style={image ? { backgroundImage: `url("${encodeURI(image)}")` } : undefined} />
        <div className="home-offer-ad-copy">
          <p className="eyebrow">{offer.label || 'Special Offer'} is waiting for you</p>
          <h2>{popup.title || offer.title}</h2>
          <p className="home-offer-ad-description">{popup.description || getOfferIntro(offer.description) || normalizeOfferCopy(offer.description)}</p>
          <span className="home-offer-ad-packages">For {offer.packages.join(' / ')}</span>
          <p className="home-offer-ad-booking-prompt">Book your {offer.packages[0]?.toLowerCase() || ''} session today.</p>
          <div className="home-offer-ad-actions"><Link className="home-offer-ad-cta" href="/package#offers-title">Explore Offers</Link><Link className="home-offer-ad-cta" href={`/booknow?offer=${encodeURIComponent(offer.title)}`}>Book Now</Link></div>
        </div>
      </article>
    </div>
  );
}
