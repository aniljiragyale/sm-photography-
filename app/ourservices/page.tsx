'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { defaultServices, loadPublishedContent, type ServiceItem } from '@/lib/admin-data';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);

  useEffect(() => {
    loadPublishedContent().then((content) => setServices(content.services));
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-actions page-actions-top">
          <Link href="/" className="page-back">← Back</Link>
        </div>
        <p className="eyebrow">Creative studio services</p>
        <h1>Our Services</h1>
        <p>Thoughtful photography and film coverage for celebrations, people, brands, and the stories in between.</p>
      </div>

      <div className="page-content">
        <div className="services-grid-plain">
          {services.map((service) => (
            <div key={service.title} className="service-card-plain">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p className="service-deliverables"><strong>What you receive:</strong> {service.deliverables}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
