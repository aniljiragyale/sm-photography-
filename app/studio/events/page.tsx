'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/admin-data';

type GalleryEvent = { id: string; slug: string; clientName: string; galleryName: string; eventType: string; eventDate: string; status: string; photos: Array<{ id: string }>; submissions: Array<{ id: string; selectedCount: number }> };

export default function StudioEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    const response = await fetch('/api/admin/galleries', { cache: 'no-store' });
    if (response.status === 401) { router.replace('/studio-login'); return; }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load saved galleries.');
    setEvents(result as GalleryEvent[]);
    setMessage('');
  }, [router]);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/studio-login'); return; }
    load().catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Unable to load saved galleries.')).finally(() => setLoading(false));
  }, [load, router]);

  const remove = async (gallery: GalleryEvent) => {
    if (!window.confirm(`Delete “${gallery.galleryName}” and its saved gallery data?`)) return;
    const response = await fetch(`/api/admin/galleries/${encodeURIComponent(gallery.id)}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || 'Unable to delete gallery.'); return; }
    await load();
    setMessage('Gallery deleted.');
  };

  return <div className="page-shell">
    <div className="page-header admin-header-row"><div><p className="eyebrow">Studio events</p><h1>Client Galleries</h1><p>Create private galleries where clients can select their favourite photographs.</p></div><Link href="/studio/events/new" className="submit-btn">Create New Gallery</Link></div>
    <div className="page-content"><section className="admin-card">
      {loading ? <p>Loading galleries...</p> : message && !events.length ? <p className="form-status error-status" role="status">{message}</p> : events.length === 0 ? <p>No client galleries created yet.</p> : <div className="admin-item-list">
        {events.map((event) => <article className="admin-item-card" key={event.id}>
          <div><h3>{event.galleryName}</h3><p>{event.clientName} · {event.eventType} · {event.eventDate}</p><p>{event.photos.length} photos · {event.submissions.length} submissions</p><span className="admin-tag">{event.status}</span><p><Link href={`/client-gallery/${event.slug}`} target="_blank">Open client gallery ↗</Link></p></div>
          <div className="admin-actions"><Link href={`/studio/events/${event.id}`} className="btn btn-secondary">Manage</Link><button className="remove-btn" type="button" onClick={() => void remove(event)}>Delete</button></div>
        </article>)}
      </div>}
      {message && events.length > 0 && <p className="form-status" role="status">{message}</p>}
    </section></div>
  </div>;
}
