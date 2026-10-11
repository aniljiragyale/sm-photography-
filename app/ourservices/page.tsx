'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { defaultServices, loadPublishedContent, type ServiceItem } from '@/lib/admin-data';

const WHATSAPP_NUMBER = '919511835507';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hello SM Photography & Films, I would like to ask about your photography services. I am interested in: ____. Please share more details.'
);

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);

  useEffect(() => {
    loadPublishedContent().then((content) => setServices(content.services));
  }, []);

  return (
    <div className="page-shell services-page">
      <div className="page-header services-page-header">
        <div className="page-actions page-actions-top">
          <Link href="/" className="page-back back-icon" aria-label="Back to home" title="Back to home"><span aria-hidden="true">←</span></Link>
        </div>
        <p className="eyebrow">Creative studio services</p>
        <h1>Our Services</h1>
        <p>Thoughtful photography and film coverage for celebrations, people, brands, and the stories in between.</p>
        <div className="services-header-actions">
          <Link href="/booknow" className="btn btn-primary">Book a session</Link>
          <a className="btn btn-secondary" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
        </div>
      </div>

      <div className="page-content">
        <div className="services-grid-plain services-catalog">
          {services.map((service, index) => (
            <article key={service.title} className="service-card-plain service-catalog-item animated-card" style={{ animationDelay: `${index * 80}ms` }}>
              <span className="service-catalog-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="service-catalog-copy">
                <h2>{service.title}</h2>
                <p>{service.description}</p>
                <p className="service-deliverables"><strong>What you receive</strong>{service.deliverables}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="customisation-banner" aria-label="Custom photography services">
          <p className="eyebrow">Your idea, our craft</p>
          <h2>Looking for a customised service?</h2>
          <p>
            Every celebration is different. We can tailor the team, coverage, locations, deliverables, and creative direction
            to suit your story. Get in touch and let us plan something personal.
          </p>
          <div className="services-header-actions services-banner-actions">
            <Link href="/contact" className="btn btn-primary">Discuss your requirements</Link>
            <Link href="/booknow" className="btn btn-secondary">Book a session</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
