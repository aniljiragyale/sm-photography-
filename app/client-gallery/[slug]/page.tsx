'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type GalleryPhoto = {
  id: string;
  title?: string;
  image: string;
  category?: string;
};

type ClientGalleryData = {
  id: string;
  slug: string;
  clientName: string;
  galleryName: string;
  eventType: string;
  eventDate: string;
  status: string;
  photoCount: number;
  selectedCount: number;
  photos: GalleryPhoto[];
  categories: string[];
  selectionLimit: number | null;
  allowDownload: boolean;
  lockAfterSubmit: boolean;
  watermarkEnabled: boolean;
};

export default function ClientGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || '';
  const [gallery, setGallery] = useState<ClientGalleryData | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadGallery() {
      try {
        const response = await fetch(`/api/client/galleries/${slug}`);
        const data = await response.json();

        if (!response.ok || !data.gallery) {
          router.push('/client-gallery');
          return;
        }

        setGallery(data.gallery);
        setSelected(data.selectedIds || []);
      } catch {
        setError('Unable to load the gallery. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadGallery();
    }
  }, [router, slug]);

  const filteredPhotos = useMemo(() => {
    if (!gallery) return [];
    if (activeCategory === 'ALL') return gallery.photos;
    return gallery.photos.filter((photo) => photo.category === activeCategory);
  }, [activeCategory, gallery]);

  const toggleSelection = async (photoId: string) => {
    if (!gallery) return;

    const currentSelected = selected.includes(photoId);
    const nextSelected = currentSelected ? selected.filter((id) => id !== photoId) : [...selected, photoId];

    if (!currentSelected && gallery.selectionLimit && nextSelected.length > gallery.selectionLimit) {
      setError(`You have reached your photo selection limit of ${gallery.selectionLimit}.`);
      return;
    }

    setSelected(nextSelected);
    try {
      const response = await fetch(`/api/client/galleries/${slug}/select`, {
        method: currentSelected ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      });

      const result = await response.json();
      if (!response.ok) {
        setSelected(selected);
        setError(result.error || 'Unable to save the photo selection.');
      } else {
        setError('');
      }
    } catch {
      setSelected(selected);
      setError('Unable to save selection. Please check your internet connection.');
    }
  };

  const submitSelections = async () => {
    if (!gallery) return;

    if (!selected.length) {
      setError('You have not selected any photos yet.');
      return;
    }

    const shouldSubmit = window.confirm(`Are you sure you want to submit your selection?\n\nSelected: ${selected.length} Photos`);
    if (!shouldSubmit) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/client/galleries/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedPhotoIds: selected }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Unable to submit your final selection right now.');
        return;
      }

      setGallery((current) => (current ? { ...current, status: 'submitted', selectedCount: selected.length } : current));
      setError('');
      alert('Your final selection has been submitted successfully.');
    } catch {
      setError('Something went wrong while submitting your selection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-shell"><div className="page-content"><p>Loading gallery...</p></div></div>;
  }

  if (!gallery) {
    return <div className="page-shell"><div className="page-content"><p>Gallery not found.</p></div></div>;
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-actions page-actions-top">
          <button type="button" className="page-back" onClick={() => router.push('/client-gallery')}>← Back</button>
        </div>
        <p className="eyebrow">SM Photography &amp; Films</p>
        <h1>{gallery.clientName}</h1>
        <p>{gallery.eventType}</p>
        <p>Event Date: {gallery.eventDate}</p>
      </div>

      <div className="page-content">
        <div className="admin-card" style={{ marginBottom: '1rem' }}>
          <div className="admin-card-heading">
            <div>
              <h2>{gallery.galleryName}</h2>
              <p className="form-note">Select your favorite photographs.</p>
            </div>
            <div className="admin-actions">
              <span className="admin-tag">{gallery.photoCount} Photos</span>
              <span className="admin-tag">❤️ {selected.length} Selected</span>
            </div>
          </div>

          {gallery.selectionLimit ? (
            <p className="form-note">{selected.length} / {gallery.selectionLimit} Selected</p>
          ) : null}

          {error ? <p className="form-status error-status">{error}</p> : null}

          <div className="gallery-filter-row">
            {['ALL', ...gallery.categories].map((category) => (
              <button
                key={category}
                type="button"
                className={`btn btn-secondary gallery-filter-btn ${activeCategory === category ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-grid">
          {filteredPhotos.map((photo, index) => {
            const isSelected = selected.includes(photo.id);
            return (
              <div key={photo.id} className={`gallery-card ${isSelected ? 'selected-card' : ''}`}>
                <div className="thumb" style={{ backgroundImage: `url("${encodeURI(photo.image)}")` }} />
                <div className="gallery-card-copy">
                  <button
                    type="button"
                    className="submit-btn"
                    onClick={() => toggleSelection(photo.id)}
                    style={{ width: '100%', maxWidth: 'none', margin: '0.2rem 0' }}
                  >
                    {isSelected ? '♥ Selected' : '♡ Select'}
                  </button>
                  <p>Photo {index + 1}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="admin-card" style={{ marginTop: '1.5rem', position: 'sticky', bottom: '1rem' }}>
          <div className="admin-actions" style={{ justifyContent: 'space-between' }}>
            <div>
              <strong>{selected.length} Selected</strong>
            </div>
            <button type="button" className="submit-btn" onClick={submitSelections} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'SUBMIT FINAL SELECTION'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
