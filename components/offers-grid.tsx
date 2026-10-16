'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatOfferDiscount, type Offer, type OfferPackage } from '@/lib/offer-types';
import { getOfferIntro, normalizeOfferCopy } from '@/lib/offer-copy';

const WHATSAPP_NUMBER = '919511835507';

function whatsappHref(offer: Offer, packageName = offer.packages[0]) {
  const text = `Hi, I want to know more about the ${offer.title} for the ${packageName} package.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function Countdown({ endsAt }: { endsAt: string | null }) {
  const [left, setLeft] = useState(() => endsAt ? Math.max(0, Date.parse(endsAt) - Date.now()) : 0);
  useEffect(() => {
    if (!endsAt) return;
    const timer = window.setInterval(() => setLeft(Math.max(0, Date.parse(endsAt) - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);
  if (!endsAt) return null;
  if (!left) return <span className="offer-countdown">Offer ended</span>;
  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return <span className="offer-countdown">Ends in {days ? `${days}d ` : ''}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>;
}

export function OffersGrid({ packageName, compact = false }: { packageName?: OfferPackage; compact?: boolean }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => {
    const loadOffers = () => fetch('/api/offers', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() as Promise<Offer[]> : [])
      .then(setOffers).catch(() => setOffers([]));
    void loadOffers();
    const refresh = window.setInterval(() => void loadOffers(), 15000);
    const onVisible = () => { if (document.visibilityState === 'visible') void loadOffers(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(refresh); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  const visible = offers.filter((offer) => !packageName || offer.packages.includes(packageName));
  const featured = visible.find((offer) => offer.featured) || visible[0];
  const otherOffers = visible.filter((offer) => offer.id !== featured?.id);

  return (
    <section className={`offers-section ${compact ? 'offers-section--compact' : ''}`} aria-labelledby="offers-title">
      <div className="offers-heading">
        <div><p className="eyebrow">A little extra for your story</p><h2 id="offers-title">Offers &amp; Special Deals</h2></div>
        {!compact && <span className="offers-heading-mark">SM * OFFERS</span>}
      </div>
      {featured ? <>
        <article className="featured-offer">
          <Link className={`featured-offer-art ${featured.image ? '' : 'featured-offer-art--empty'}`} href={`/offers/${featured.slug}`} aria-label={`View ${featured.title}`} style={featured.image ? { backgroundImage: `url("${encodeURI(featured.image)}")` } : undefined}>
            {featured.label && <span className="offer-ribbon">{featured.label}</span>}
          </Link>
          <div className="featured-offer-copy">
            <p className="eyebrow">Featured offer / {featured.packages.join(' / ')}</p>
            <span className="featured-offer-discount">{formatOfferDiscount(featured)}</span>
            <h3><Link href={`/offers/${featured.slug}`}>{featured.title}</Link></h3>
            <p>{getOfferIntro(featured.description) || normalizeOfferCopy(featured.description)}</p>
            <Countdown endsAt={featured.endsAt} />
            <Link className="featured-offer-cta" href={`/offers/${featured.slug}`}>View offer and details <span aria-hidden="true">-&gt;</span></Link>
          </div>
        </article>
        {otherOffers.length > 0 && <div className="offers-grid">
          {otherOffers.map((offer) => (
            <article className="offer-card" key={offer.id}>
              <Link className="offer-card-image" href={`/offers/${offer.slug}`} aria-label={`View ${offer.title}`} style={offer.image ? { backgroundImage: `linear-gradient(180deg, transparent 45%, rgba(0,0,0,.72)), url("${encodeURI(offer.image)}")` } : undefined}>
                {offer.label && <span className="offer-ribbon">{offer.label}</span>}
                <span className="offer-discount">{formatOfferDiscount(offer)}</span>
              </Link>
              <div className="offer-card-body">
                <p className="offer-package-label">{offer.packages.join(' / ')}</p>
                <h3><Link href={`/offers/${offer.slug}`}>{offer.title}</Link></h3>
                <p>{getOfferIntro(offer.description) || normalizeOfferCopy(offer.description)}</p>
                <Countdown endsAt={offer.endsAt} />
                <div className="offer-card-actions">
                  <Link href={`/offers/${offer.slug}`} className="offer-details-link">Offer details</Link>
                  <a href={whatsappHref(offer, packageName || offer.packages[0])} target="_blank" rel="noreferrer" className="offer-whatsapp">Enquire on WhatsApp</a>
                </div>
              </div>
            </article>
          ))}
        </div>}
      </> : <div className="offers-empty-state"><span aria-hidden="true">*</span><p>Your next special offer can take the spotlight here.</p><small>Add an offer and upload its banner from the Studio dashboard to feature it on the homepage.</small></div>}
    </section>
  );
}
