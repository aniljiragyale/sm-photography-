'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { defaultPackages, loadPublishedContent, type PackageItem } from '@/lib/admin-data';

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
          {packages.map((pkg, index) => (
            <div key={pkg.name} className="package-card animated-card" style={{ animationDelay: `${index * 100}ms` }}>
              <span className="package-badge">{pkg.name}</span>
              <div className="price">Contact us for pricing</div>
              <ul>
                {pkg.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

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
