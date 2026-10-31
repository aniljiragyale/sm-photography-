'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/admin-data';

type Booking = {
  id: string; firstName: string; lastName: string; email: string; phone: string;
  eventType: string; packageName: string; eventDate: string; venue: string;
  schedule: string; referral: string; offer: string; status: 'new' | 'confirmed' | 'cancelled'; createdAt: string;
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('Loading booking requests...');
  const [loadingId, setLoadingId] = useState('');

  const load = useCallback(async () => {
    const response = await fetch('/api/bookings', { cache: 'no-store' });
    if (response.status === 401) { router.replace('/admin/login'); return; }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load bookings.');
    setBookings(result as Booking[]);
    setMessage('');
  }, [router]);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/admin/login'); return; }
    load().catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Could not load bookings.'));
  }, [load, router]);

  const visibleBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings.filter((booking) => (filter === 'all' || booking.status === filter) && (!query || [booking.firstName, booking.lastName, booking.email, booking.phone, booking.eventType, booking.packageName, booking.venue].join(' ').toLowerCase().includes(query)));
  }, [bookings, filter, search]);

  const updateStatus = async (booking: Booking, status: Booking['status']) => {
    setLoadingId(booking.id);
    setMessage('Updating booking...');
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update booking.');
      setBookings((current) => current.map((item) => item.id === booking.id ? result as Booking : item));
      setMessage('Booking status updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update booking.');
    } finally { setLoadingId(''); }
  };

  return <div className="page-shell admin-shell">
    <div className="page-header admin-header-row"><div><p className="eyebrow">Private dashboard</p><h1>Booking Requests</h1><p>Review customer details and manage each request’s status.</p></div><Link className="btn btn-secondary" href="/admin">Back to admin</Link></div>
    <div className="page-content admin-panel">
      <section className="admin-card">
        <div className="grid-form two-column-form">
          <label>Search bookings<input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, phone, service..." /></label>
          <label>Filter by status<select className="field" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All requests</option><option value="new">New</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></label>
        </div>
        {message && <p className="form-status" role="status">{message}</p>}
        {!message && visibleBookings.length === 0 && <p className="form-note">No booking requests match this view yet.</p>}
        <div className="admin-item-list">
          {visibleBookings.map((booking) => <article className="admin-item-card" key={booking.id}>
            <div>
              <h3>{booking.firstName} {booking.lastName} <span className="admin-tag">{booking.status}</span></h3>
              <p><a href={`mailto:${booking.email}`}>{booking.email}</a> · <a href={`tel:${booking.phone}`}>{booking.phone}</a></p>
              <p><strong>{booking.eventType}</strong> · {booking.packageName}{booking.offer ? ` · Offer: ${booking.offer}` : ''}</p>
              <p>{new Date(`${booking.eventDate}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {booking.venue}</p>
              <p>{booking.schedule}{booking.referral ? ` · Referred by: ${booking.referral}` : ''}</p>
              <small>Received {new Date(booking.createdAt).toLocaleString()}</small>
            </div>
            <label>Update status<select className="field" value={booking.status} disabled={loadingId === booking.id} onChange={(event) => void updateStatus(booking, event.target.value as Booking['status'])}><option value="new">New</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></label>
          </article>)}
        </div>
      </section>
    </div>
  </div>;
}
