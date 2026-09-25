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
          {packages.map((pkg) => (
            <div key={pkg.name} className="package-card">
              <span className="package-badge">{pkg.name}</span>
              <div className="price">{pkg.price}</div>
              <ul>
                {pkg.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
