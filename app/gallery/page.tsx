'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { defaultGalleryItems, galleryCategories, loadPublishedContent, type GalleryItem } from '@/lib/admin-data';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(defaultGalleryItems);

  useEffect(() => {
    loadPublishedContent().then((content) => setGalleryItems([...defaultGalleryItems, ...content.gallery]));
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return galleryItems;
    return galleryItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, galleryItems]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-actions page-actions-top">
          <Link href="/" className="page-back">← Back</Link>
        </div>
        <p className="eyebrow">Portfolio</p>
        <h1>Explore Beautiful Moments</h1>
      </div>

      <div className="page-content">
        <div className="gallery-filter-row">
          {galleryCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={`btn btn-secondary gallery-filter-btn ${activeCategory === category ? 'is-active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>

        <div className="gallery-grid">
          {filteredItems.map((item) => {
            const imageUrl = encodeURI(item.image);

            return (
              <div key={`${item.id || item.title}-${item.image}`} className="gallery-card">
                <div className="thumb" style={{ backgroundImage: `url("${imageUrl}")` }} />
                <div className="gallery-card-copy">
                  <span className="gallery-tag">{item.category}</span>
                  <h3>{item.title}</h3>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
