import Link from 'next/link';
import { EnquiryForm } from '@/components/enquiry-form';

export default function PortfolioPage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-actions page-actions-top">
          <Link href="/" className="page-back">
            ← Back
          </Link>
        </div>
        <p className="eyebrow">Let us know</p>
        <h1>Contact &amp; Enquiry</h1>
      </div>

      <div className="contact-enquiry-layout">
        <section className="page-content contact-enquiry-intro">
          <p className="eyebrow">Photography for real stories</p>
          <h2>Let&apos;s create something worth remembering.</h2>
          <p>
            SM Photography creates warm, cinematic images for weddings, couples, families, brands, and milestone celebrations. Share your idea and we will help shape the right session for you.
          </p>

          <div className="enquiry-service-grid">
            <div className="info-card">
              <h3>Weddings &amp; Events</h3>
              <p>Candid emotion, beautiful details, and a complete story from the first frame to the final celebration.</p>
            </div>
            <div className="info-card">
              <h3>Portraits &amp; Lifestyle</h3>
              <p>Relaxed portraits for couples, maternity, birthdays, families, and personal milestones.</p>
            </div>
            <div className="info-card">
              <h3>Brand &amp; Commercial</h3>
              <p>Professional visuals for products, creators, businesses, portfolios, and social media campaigns.</p>
            </div>
          </div>

          <div className="enquiry-details">
            <div>
              <strong>Based in</strong>
              <span>Malgaon, Sangli District</span>
            </div>
            <div>
              <strong>Available for</strong>
              <span>Sangli, Kolhapur, Pune &amp; Bangalore</span>
            </div>
            <div>
              <strong>Direct contact</strong>
              <a href="tel:+919511835507">+91-95118 35507</a>
            </div>
          </div>

          <div className="enquiry-actions">
            <a className="btn btn-primary" href="tel:+919511835507">
              Call SM Photography
            </a>
            <a className="btn btn-secondary" href="https://api.whatsapp.com/send?phone=919511835507" target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </a>
          </div>
        </section>

        <section className="form-section">
          <p className="eyebrow">Start a conversation</p>
          <h2>Send an Enquiry</h2>
          <p className="form-note" style={{ marginBottom: '1.25rem' }}>
            Tell us what you are planning, your preferred date, and the kind of photographs you have in mind.
          </p>
          <EnquiryForm />
        </section>
      </div>
    </div>
  );
}
