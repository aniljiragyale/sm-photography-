import { BookingForm } from '@/components/booking-form';
import Link from 'next/link';

const WHATSAPP_NUMBER = '919511835507';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hello SM Photography & Films, I would like to check availability for a photography session. Event or session: ____. Preferred date: ____. Name: ____.'
);

export default function BookNowPage() {
  return (
    <div className="page-shell booking-page">
      <div className="page-header booking-page-header">
        <div className="page-actions page-actions-top">
          <Link href="/" className="page-back">← Back</Link>
        </div>
        <p className="eyebrow">Reserve your date</p>
        <h1>Book Your Photography Session</h1>
        <p>Tell us what you are celebrating. We’ll help shape a session around your date, place, and vision.</p>
      </div>

      <div className="booking-layout">
        <aside className="booking-story">
          <p className="eyebrow">SM Photography &amp; Films</p>
          <h2>Let’s make room for the moments you’ll want to keep.</h2>
          <p>Wedding celebrations, pre-wedding stories, maternity portraits, and meaningful days with your family, photographed with care.</p>
          <div className="booking-story-divider" />
          <a href="tel:+919511835507" className="booking-contact-link">Call <span>+91 95118 35507</span></a>
          <a className="booking-whatsapp-link" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noopener noreferrer">
            <span>Prefer WhatsApp?</span>
            <strong>Start a conversation <span aria-hidden="true">↗</span></strong>
          </a>
        </aside>

        <section className="form-section booking-form-section">
          <p className="eyebrow">Booking enquiry</p>
          <h2>Tell us about your plans</h2>
          <p className="booking-form-intro">Share a few details and our studio will be in touch about your session.</p>
          <BookingForm />
        </section>
      </div>
    </div>
  );
}
