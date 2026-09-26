'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientGalleryLoginPage() {
  const router = useRouter();
  const [galleryId, setGalleryId] = useState('SM-WED-2026-001');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/client/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.slug) {
        setError(result.error || 'Your gallery ID or password is incorrect.');
        setIsSubmitting(false);
        return;
      }

      router.push(`/client-gallery/${result.slug}`);
    } catch {
      setError('Unable to connect to the gallery right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="eyebrow">Private gallery access</p>
        <h1>Your Private Gallery</h1>
      </div>

      <div className="page-content">
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Gallery ID
            <input
              className="field"
              value={galleryId}
              onChange={(event) => setGalleryId(event.target.value)}
              placeholder="SM-WED-2026-001"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your gallery password"
            />
          </label>

          {error ? <p className="form-status error-status">{error}</p> : null}

          <div className="admin-actions">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Opening gallery...' : 'Open Gallery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
