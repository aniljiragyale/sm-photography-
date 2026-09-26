'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBackendToken } from '@/lib/backend';

const makeEventCode = () => `SM${Math.floor(100000 + Math.random() * 900000)}`;

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    clientName: '',
    eventName: '',
    eventType: '',
    eventDate: '',
    location: '',
    selectionLimit: '100',
    eventExpiry: '30',
    watermark: true,
    allowDownload: false,
  });
  const [eventCode, setEventCode] = useState(makeEventCode());
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateEventCode = () => {
    const value = makeEventCode();
    setEventCode(value);
    setMessage(`Generated event code: ${value}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const token = getBackendToken();
      const response = await fetch('http://localhost:4000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          clientName: form.clientName,
          eventName: form.eventName,
          eventType: form.eventType,
          eventDate: form.eventDate,
          location: form.location,
          eventCode,
          selectionLimit: Number(form.selectionLimit),
          expiryDays: Number(form.eventExpiry),
          watermark: form.watermark,
          allowDownload: form.allowDownload,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || 'Unable to create event.');
        setIsSubmitting(false);
        return;
      }

      setMessage(`Event created successfully. Event code: ${eventCode}`);
      router.push('/studio/events');
    } catch {
      setMessage('The backend is not running. Start the backend server first.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="eyebrow">Create event</p>
        <h1>Create Event</h1>
      </div>

      <div className="page-content">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Client Name
              <input className="field" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} />
            </label>
            <label>
              Event Name
              <input className="field" value={form.eventName} onChange={(event) => setForm({ ...form, eventName: event.target.value })} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Event Type
              <input className="field" value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value })} />
            </label>
            <label>
              Event Date
              <input className="field" type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Location
              <input className="field" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
            </label>
            <label>
              Selection Limit
              <input className="field" type="number" value={form.selectionLimit} onChange={(event) => setForm({ ...form, selectionLimit: event.target.value })} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Event Expiry (Days)
              <input className="field" type="number" value={form.eventExpiry} onChange={(event) => setForm({ ...form, eventExpiry: event.target.value })} />
            </label>
            <label>
              Event Code
              <input className="field" value={eventCode} onChange={(event) => setEventCode(event.target.value.toUpperCase())} />
            </label>
          </div>

          <div className="admin-actions">
            <button type="button" className="btn btn-secondary" onClick={generateEventCode}>Generate Code</button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>

          <div className="form-row">
            <label>
              <input type="checkbox" checked={form.watermark} onChange={(event) => setForm({ ...form, watermark: event.target.checked })} />
              Watermark
            </label>
            <label>
              <input type="checkbox" checked={form.allowDownload} onChange={(event) => setForm({ ...form, allowDownload: event.target.checked })} />
              Allow Download
            </label>
          </div>

          {message ? <p className="form-status">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
