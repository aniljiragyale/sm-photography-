'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/admin-data';

const dateAfterDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({ clientName: '', galleryName: '', eventType: 'Wedding', eventDate: '', location: '', password: '', selectionLimit: '100', expiryDays: '30', allowDownload: false, lockAfterSubmit: false, watermarkEnabled: true });
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdminLoggedIn()) { router.replace('/studio-login'); return; }
    setIsSubmitting(true);
    setMessage('Creating private client gallery...');
    try {
      const response = await fetch('/api/admin/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug: slug || undefined, selectionLimit: Number(form.selectionLimit), expiresAt: form.expiryDays ? dateAfterDays(Number(form.expiryDays)) : null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create gallery.');
      setMessage(`Gallery created: ${window.location.origin}/client-gallery/${result.slug}. Share the password with your client.`);
      window.setTimeout(() => router.push('/studio/events'), 2200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create gallery.');
    } finally { setIsSubmitting(false); }
  };

  const update = (field: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  return <div className="page-shell">
    <div className="page-header"><p className="eyebrow">Studio events</p><h1>Create Client Gallery</h1></div>
    <div className="page-content"><form className="admin-form admin-card" onSubmit={handleSubmit}>
      <div className="grid-form two-column-form">
        <label>Client name<input className="field" required value={form.clientName} onChange={(event) => update('clientName', event.target.value)} /></label>
        <label>Gallery name<input className="field" required value={form.galleryName} onChange={(event) => update('galleryName', event.target.value)} placeholder="A name clients will recognize" /></label>
        <label>Event type<input className="field" required value={form.eventType} onChange={(event) => update('eventType', event.target.value)} /></label>
        <label>Event date<input className="field" type="date" required value={form.eventDate} onChange={(event) => update('eventDate', event.target.value)} /></label>
        <label>Location<input className="field" value={form.location} onChange={(event) => update('location', event.target.value)} /></label>
        <label>Private gallery password<input className="field" type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={(event) => update('password', event.target.value)} /></label>
        <label>Gallery URL slug (optional)<input className="field" value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="client-name-event" /></label>
        <label>Photo selection limit<input className="field" type="number" min="1" value={form.selectionLimit} onChange={(event) => update('selectionLimit', event.target.value)} /></label>
        <label>Gallery expiry in days (blank for no expiry)<input className="field" type="number" min="1" value={form.expiryDays} onChange={(event) => update('expiryDays', event.target.value)} /></label>
      </div>
      <label className="offer-active-toggle"><input type="checkbox" checked={form.allowDownload} onChange={(event) => update('allowDownload', event.target.checked)} /> Allow client downloads</label>
      <label className="offer-active-toggle"><input type="checkbox" checked={form.lockAfterSubmit} onChange={(event) => update('lockAfterSubmit', event.target.checked)} /> Lock selections after client submits</label>
      <label className="offer-active-toggle"><input type="checkbox" checked={form.watermarkEnabled} onChange={(event) => update('watermarkEnabled', event.target.checked)} /> Enable watermark setting</label>
      <div className="admin-actions"><button className="submit-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Gallery'}</button><button type="button" className="btn btn-secondary" onClick={() => router.push('/studio/events')}>Cancel</button></div>
      {message && <p className="form-status" role="status">{message}</p>}
    </form></div>
  </div>;
}
