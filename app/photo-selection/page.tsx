'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PhotoSelectionPage() {
  const router = useRouter();
  const [eventCode, setEventCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/client/event-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventCode: eventCode.trim() }),
      });

      const result = await response.json();
      if (!response.ok || !result.slug) {
        setError(result.error || 'Invalid event code. Please try again.');
        setIsSubmitting(false);
        return;
      }

      router.push(`/select/${result.slug}`);
    } catch {
      setError('Unable to open the event gallery. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="eyebrow">Secure • Private • Mobile Friendly</p>
        <h1>PHOTO SELECTION</h1>
        <p>Select your favourite photographs from your event gallery.</p>
      </div>

      <div className="page-content">
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Enter Event Code
            <input
              className="field"
              value={eventCode}
              onChange={(event) => setEventCode(event.target.value.toUpperCase())}
              placeholder="SM482731"
              aria-label="Enter event code"
              required
            />
          </label>

          <div className="admin-actions">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Opening gallery...' : 'Open Gallery'}
            </button>
          </div>

          {error ? <p className="form-status error-status">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
