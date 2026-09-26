'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type EventPhoto = { id: number; title: string; category: string; image_url: string; description: string };
type EventData = { event_name: string; client_name: string; event_type: string; event_date: string; selection_limit: number };

export default function EventSelectPage() {
  const params = useParams();
  const router = useRouter();
  const eventCode = Array.isArray(params?.eventCode) ? params.eventCode[0] : params?.eventCode || '';
  const [event, setEvent] = useState<EventData | null>(null);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [important, setImportant] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const filteredPhotos = useMemo(() => {
    if (activeFilter === 'ALL') return photos;
    return photos.filter((photo) => (photo.category || 'Other').toUpperCase() === activeFilter);
  }, [activeFilter, photos]);

  const categories = useMemo(() => [...new Set(photos.map((photo) => (photo.category || 'Other').toUpperCase()))].sort(), [photos]);

  useEffect(() => {
    if (!eventCode) {
      router.replace('/photo-selection');
      return;
    }

    let isCurrent = true;
    const loadGallery = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/api/public/events/${encodeURIComponent(eventCode)}`, { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load this event gallery.');

        const selectionsResponse = await fetch(
          `http://localhost:4000/api/public/events/${encodeURIComponent(eventCode)}/selections?clientName=${encodeURIComponent(result.event.client_name || '')}`,
          { cache: 'no-store' }
        );
        const savedSelections = selectionsResponse.ok ? await selectionsResponse.json() : { selected: [], important: [] };
        if (!isCurrent) return;

        setEvent(result.event);
        setPhotos(result.photos || []);
        setSelected(savedSelections.selected || []);
        setImportant(savedSelections.important || []);
      } catch (error) {
        if (isCurrent) setMessage(error instanceof Error ? error.message : 'Unable to load this event gallery.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadGallery();
    return () => { isCurrent = false; };
  }, [eventCode, router]);

  const toggleSelected = (photoId: number) => {
    setSelected((current) => {
      if (current.includes(photoId)) {
        return current.filter((id) => id !== photoId);
      }
      if (event && event.selection_limit > 0 && current.length >= event.selection_limit) {
        setMessage(`You can select up to ${event.selection_limit} photos.`);
        return current;
      }
      setMessage('');
      return [...current, photoId];
    });
  };

  const toggleImportant = (photoId: number) => {
    setImportant((current) => current.includes(photoId) ? current.filter((id) => id !== photoId) : [...current, photoId]);
  };

  const saveSelection = async () => {
    if (!event) return;
    setMessage('Saving your selections...');
    try {
      const response = await fetch(`http://localhost:4000/api/public/events/${encodeURIComponent(eventCode)}/selections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: event.client_name, selected, important }),
      });
      const result = await response.json();
      setMessage(response.ok ? 'Your selections are saved.' : result.error || 'Unable to save your selections.');
    } catch {
      setMessage('Unable to reach the gallery service. Please try again.');
    }
  };

  if (loading) return <div className="page-shell"><div className="page-content"><p>Loading your event gallery...</p></div></div>;
  if (!event) return <div className="page-shell"><div className="page-content"><p className="form-status error-status">{message || 'Event not found.'}</p><a className="page-back" href="/photo-selection">Enter another event code</a></div></div>;

  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="eyebrow">SM Photography &amp; Films</p>
        <h1>{event.event_name || event.client_name || 'Event Gallery'}</h1>
        <p>{event.event_type}</p>
        {event.event_date ? <p>{new Date(`${event.event_date}T00:00:00`).toLocaleDateString()}</p> : null}
      </div>

      <div className="page-content">
        <div className="admin-card" style={{ marginBottom: '1rem' }}>
          <div className="admin-card-heading">
            <div>
              <h2>Total Photos: {photos.length}</h2>
              <p className="form-note">Selected Photos: {selected.length}</p>
              <p className="form-note">Important Photos: {important.length}</p>
              {event.selection_limit > 0 ? <p className="form-note">Selection limit: {event.selection_limit}</p> : null}
            </div>
          </div>

          <div className="gallery-filter-row">
            {['ALL', ...categories].map((category) => (
              <button
                key={category}
                type="button"
                className={`btn btn-secondary gallery-filter-btn ${activeFilter === category ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-grid">
          {filteredPhotos.map((photo, index) => {
            const isSelected = selected.includes(photo.id);
            const isImportant = important.includes(photo.id);

            return (
              <div key={photo.id} className={`gallery-card ${isSelected ? 'selected-card' : ''}`}>
                <div className="thumb" style={{ backgroundImage: `url("${encodeURI(photo.image_url)}")` }} />
                <div className="gallery-card-copy"><strong>{photo.title || `Photo ${index + 1}`}</strong></div>
                <div className="gallery-card-copy">
                  <button type="button" className="submit-btn" onClick={() => toggleSelected(photo.id)} style={{ width: '100%', maxWidth: 'none', margin: 0 }}>
                    {isSelected ? '✓ SELECTED' : 'SELECT'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => toggleImportant(photo.id)} style={{ width: '100%', maxWidth: 'none', margin: '0.5rem 0 0' }}>
                    {isImportant ? '❤️ IMPORTANT' : '♡ IMPORTANT'}
                  </button>
                  <p style={{ marginTop: '0.5rem' }}>PHOTO {index + 1} / {filteredPhotos.length}</p>
                </div>
              </div>
            );
          })}
        </div>
        {photos.length === 0 ? <div className="admin-card"><p>No photos have been added to this event yet.</p></div> : null}

        <div className="admin-card" style={{ marginTop: '1.5rem', position: 'sticky', bottom: '1rem' }}>
          <div className="admin-actions" style={{ justifyContent: 'space-between' }}>
            <div>
              <strong>❤️ {selected.length} Selected</strong>
            </div>
            <button type="button" className="submit-btn" onClick={saveSelection}>SAVE SELECTION</button>
          </div>
          {message ? <p className="form-status">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
