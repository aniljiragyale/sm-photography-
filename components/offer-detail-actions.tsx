'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Offer } from '@/lib/offer-types';
import { getMaternityTiers, getOfferOutro } from '@/lib/offer-copy';

const WHATSAPP_NUMBER = '919511835507';

export function OfferDetailActions({ offer }: { offer: Offer }) {
  const maternityTiers = getMaternityTiers(offer.description);
  const choices = maternityTiers.length ? maternityTiers : offer.packages.map((name) => ({ name, price: '', items: [] }));
  const [packageName, setPackageName] = useState<string>(choices[0].name);
  const selectedChoice = choices.find((choice) => choice.name === packageName) || choices[0];
  const [left, setLeft] = useState(offer.endsAt ? Math.max(0, Date.parse(offer.endsAt) - Date.now()) : 0);
  const message = `Hi, I want to enquire about the ${offer.title}. I am interested in the ${selectedChoice.name} package${selectedChoice.price ? ` (${selectedChoice.price})` : ''}.`;
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const eventType = offer.packages[0] || '';
  const bookingLink = `/booknow?eventType=${encodeURIComponent(eventType)}&package=${encodeURIComponent(packageName)}&offer=${encodeURIComponent(offer.title)}`;
  const hasMaternityTiers = maternityTiers.length > 0 && offer.packages.includes('Maternity');

  useEffect(() => {
    if (!offer.endsAt) return;
    const timer = window.setInterval(() => setLeft(Math.max(0, Date.parse(offer.endsAt!) - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [offer.endsAt]);

  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  const countdown = offer.endsAt && <p className="offer-detail-countdown" aria-live="polite">{left ? `Offer ends in ${days ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : 'This offer has ended.'}</p>;

  return (
    <div className="offer-detail-actions">
      {hasMaternityTiers ? <>
        {countdown}
        <div className="package-grid offer-maternity-packages">
          {choices.map((choice, index) => {
            const enquiry = `Hi, I want to enquire about the ${offer.title}. I am interested in the ${choice.name} package (${choice.price}).`;
            const tierBookingLink = `/booknow?eventType=${encodeURIComponent(eventType)}&package=${encodeURIComponent(choice.name)}&offer=${encodeURIComponent(offer.title)}`;
            return <article className="package-card animated-card package-card--maternity" key={choice.name} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="package-card-header"><span className="package-badge">{choice.name}</span></div>
              <div className="price">{choice.price}</div>
              <ul>{choice.items.map((item) => <li key={item}>{item}</li>)}</ul>
              <a className="whatsapp-btn" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(enquiry)}`} target="_blank" rel="noreferrer" aria-label={`Enquire on WhatsApp for ${choice.name} package`}>Enquire Now on WhatsApp</a>
              <Link className="submit-btn offer-book-session" href={tierBookingLink}>Book This Package</Link>
            </article>;
          })}
        </div>
        {getOfferOutro(offer.description) && <p className="offer-package-note">{getOfferOutro(offer.description)}</p>}
      </> : <>
        <label>Choose a package<select className="field" value={packageName} onChange={(event) => setPackageName(event.target.value)}>{choices.map((item) => <option key={item.name} value={item.name}>{item.name}{item.price ? ` — ${item.price}` : ''}</option>)}</select></label>
        {countdown}
        <a className="offer-whatsapp offer-whatsapp--large" href={whatsapp} target="_blank" rel="noreferrer">Enquire on WhatsApp</a>
        <Link className="submit-btn offer-book-session" href={bookingLink}>Book This Offer Now</Link>
      </>}
    </div>
  );
}
