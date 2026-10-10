'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { defaultPackages, loadPublishedContent, type PackageItem } from '@/lib/admin-data';
import { OffersGrid } from '@/components/offers-grid';

const WHATSAPP_NUMBER = '919511835507';

function getPackageVariant(name: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('gold')) return 'gold';
  if (normalizedName.includes('diamond')) return 'diamond';
  if (normalizedName.includes('silver')) return 'silver';
  if (normalizedName.includes('pre-wedding') || normalizedName.includes('prewedding')) return 'prewedding';
  if (normalizedName.includes('maternity')) return 'maternity';

  return 'default';
}

export default function PackagePage() {
  const [packages, setPackages] = useState<PackageItem[]>(defaultPackages);

  useEffect(() => {
    loadPublishedContent().then((content) => setPackages(content.packages));
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-actions page-actions-top">
          <Link href="/" className="page-back">← Back</Link>
        </div>
        <p className="eyebrow">Photography plans</p>
        <h1>Photography Packages</h1>
      </div>

      <div className="page-content">
        <div className="package-grid">
          {packages.filter((pkg) => !pkg.name.toLowerCase().includes('maternity')).map((pkg, index) => {
            const variant = getPackageVariant(pkg.name);
            const message = encodeURIComponent(`Hi, I am interested in the ${pkg.name} package. Please share the pricing and more details.`);

            return (
              <div
                key={pkg.name}
                className={`package-card animated-card package-card--${variant}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="package-card-header">
                  <span className="package-badge">{pkg.name}</span>
                  {variant === 'gold' && <span className="package-highlight package-highlight-gold">Most Popular</span>}
                  {variant === 'diamond' && <span className="package-highlight package-highlight-diamond">Luxury</span>}
                </div>
                {variant !== 'maternity' && <div className="price">Contact us for pricing</div>}
                <ul>
                  {pkg.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a
                  className="whatsapp-btn"
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Enquire on WhatsApp for ${pkg.name}`}
                >
                  Enquire Now on WhatsApp
                </a>
              </div>
            );
          })}
        </div>

        <OffersGrid />

        <section className="customisation-banner" aria-label="Custom photography packages">
          <p className="eyebrow">Made for your story</p>
          <h2>Need something customised?</h2>
          <p>
            We can customise every package around your event, preferred coverage, album style, film requirements, and budget.
            Tell us what you have in mind and we will create the right plan for you.
          </p>
          <Link href="/contact" className="btn btn-primary">Talk to us</Link>
        </section>
      </div>
    </div>
  );
}
