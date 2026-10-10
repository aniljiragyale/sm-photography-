'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Offer } from '@/lib/offer-types';

const WHATSAPP_NUMBER = '919511835507';

export function OfferDetailActions({ offer }: { offer: Offer }) {
  const [packageName, setPackageName] = useState<string>(offer.packages[0]);
  const [left, setLeft] = useState(offer.endsAt ? Math.max(0, Date.parse(offer.endsAt) - Date.now()) : 0);
  const message = `Hi, I want to enquire about ${offer.title} for the ${packageName} package.`;
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const bookingLink = `/booknow?eventType=${encodeURIComponent(packageName)}&package=${encodeURIComponent(packageName)}&offer=${encodeURIComponent(offer.title)}`;

  useEffect(() => {
    if (!offer.endsAt) return;
    const timer = window.setInterval(() => setLeft(Math.max(0, Date.parse(offer.endsAt!) - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [offer.endsAt]);

  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);

  return (
    <div className="offer-detail-actions">
      <label>Choose a package<select className="field" value={packageName} onChange={(event) => setPackageName(event.target.value)}>{offer.packages.map((item) => <option key={item}>{item}</option>)}</select></label>
      {offer.endsAt && <p className="offer-detail-countdown" aria-live="polite">{left ? `Offer ends in ${days ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : 'This offer has ended.'}</p>}
      <a className="offer-whatsapp offer-whatsapp--large" href={whatsapp} target="_blank" rel="noreferrer">Enquire on WhatsApp</a>
      <Link className="submit-btn offer-book-session" href={bookingLink}>Book This Offer Now</Link>
    </div>
  );
}
