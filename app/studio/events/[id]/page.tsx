'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBackendToken } from '@/lib/backend';

type EventItem = {
  id: number;
  client_name: string;
  event_name: string;
  event_type: string;
  event_date: string;
  location: string;
  event_code: string;
  selection_limit: number;
  expiry_days: number;
  watermark: number;
  allow_download: number;
  status: string;
};

type EventPhoto = {
  id: number;
  title: string;
  category: string;
  image_url: string;
  description: string;
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id || 0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('wedding');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEvent = async () => {
    const token = getBackendToken();
    const response = await fetch(`http://localhost:4000/api/events`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      router.push('/studio-login');
      return;
    }

    const events = (await response.json()) as EventItem[];
    const match = events.find((item) => item.id === id);
    if (match) {
      setEvent(match);
      const photosResponse = await fetch(`http://localhost:4000/api/events/${id}/photos`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (photosResponse.ok) {
        const result = (await photosResponse.json()) as EventPhoto[];
        setPhotos(result);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    const token = getBackendToken();
    const response = await fetch('http://localhost:4000/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      body: form,
    });

    const result = await response.json();
    if (!response.ok || !result.url) {
      setMessage(result.error || 'Image upload failed');
      return;
    }

    setImageUrl(result.url);
    setMessage('Image uploaded. Save it to the event album.');
  };

  const addPhoto = async () => {
    if (!imageUrl) {
      setMessage('Please upload a photo first.');
      return;
    }

    const token = getBackendToken();
    const response = await fetch(`http://localhost:4000/api/events/${id}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        title: title || 'Event Photo',
        category,
        imageUrl,
        description,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || 'Could not save photo.');
      return;
    }

    setTitle('');
    setDescription('');
    setImageUrl('');
    setMessage('Photo added successfully.');
    fetchEvent();
  };

  if (loading) {
    return <div className="page-shell"><div className="page-content"><p>Loading event...</p></div></div>;
  }

  if (!event) {
    return <div className="page-shell"><div className="page-content"><p>Event not found.</p></div></div>;
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="eyebrow">Event album</p>
        <h1>{event.event_name}</h1>
      </div>

      <div className="page-content">
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <p><strong>Client:</strong> {event.client_name || 'Not set'}</p>
          <p><strong>Code:</strong> {event.event_code}</p>
          <p><strong>Type:</strong> {event.event_type}</p>
          <p><strong>Date:</strong> {event.event_date}</p>
          <p><strong>Location:</strong> {event.location || 'Not set'}</p>
        </div>

        <div className="admin-card">
          <h2>Add photo to this event</h2>
          <div className="admin-form">
            <label>
              Title
              <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Wedding photo 01" />
            </label>

            <label>
              Category
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="wedding">Wedding</option>
                <option value="prewedding">Pre-Wedding</option>
                <option value="engagement">Engagement</option>
                <option value="maternity">Maternity</option>
                <option value="candid">Candid</option>
                <option value="modeling">Modeling</option>
              </select>
            </label>

            <label>
              Description
              <textarea className="field" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Short photo note" />
            </label>

            <div className="upload-row">
              <button type="button" className="btn btn-secondary upload-button" onClick={() => fileInputRef.current?.click()}>
                Upload Image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
            </div>

            {imageUrl ? (
              <div style={{ marginTop: '1rem' }}>
                <img src={imageUrl} alt="Uploaded preview" style={{ maxWidth: '220px', borderRadius: '12px' }} />
              </div>
            ) : null}

            <div className="admin-actions">
              <button type="button" className="submit-btn" onClick={addPhoto}>Save Photo</button>
            </div>

            {message ? <p className="form-status">{message}</p> : null}
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: '1.5rem' }}>
          <h2>Uploaded photos</h2>
          {photos.length === 0 ? (
            <p>No photos uploaded for this event yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{ border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={photo.image_url} alt={photo.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '0.75rem' }}>
                    <strong>{photo.title}</strong>
                    <p>{photo.category}</p>
                    {photo.description ? <small>{photo.description}</small> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
