'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn, setAdminLoggedIn } from '@/lib/admin-data';
import { getBackendToken } from '@/lib/backend';

type EventSummary = { id: number; status: string; photo_count: number; selection_count: number };

export default function StudioDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [events, setEvents] = useState<EventSummary[]>([]);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace('/studio-login');
      return;
    }
    const token = getBackendToken();
    fetch('http://localhost:4000/api/events', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace('/studio-login');
          return [];
        }
        if (!response.ok) throw new Error('Unable to load studio data.');
        return response.json() as Promise<EventSummary[]>;
      })
      .then((result) => setEvents(result))
      .catch(() => setEvents([]))
      .finally(() => setReady(true));
  }, [router]);

  if (!ready) {
    return <div className="page-shell"><div className="page-content"><p>Loading studio dashboard...</p></div></div>;
  }

  return (
    <div className="page-shell">
      <div className="page-header admin-header-row">
        <div>
          <p className="eyebrow">Studio dashboard</p>
          <h1>SM Photography Studio</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => { setAdminLoggedIn(false); router.push('/'); }}>
          Logout
        </button>
      </div>

      <div className="page-content">
        <div className="admin-layout">
          <div className="admin-card">
            <h2>Dashboard</h2>
            <div className="stats-strip" style={{ marginTop: 0, marginBottom: '1rem' }}>
              <div className="stat-box"><span>{events.length}</span><small>Total Events</small></div>
              <div className="stat-box"><span>{events.filter((event) => event.status === 'active').length}</span><small>Active Events</small></div>
              <div className="stat-box"><span>{events.reduce((total, event) => total + Number(event.photo_count || 0), 0)}</span><small>Total Photos</small></div>
              <div className="stat-box"><span>{events.reduce((total, event) => total + Number(event.selection_count || 0), 0)}</span><small>Photos Selected</small></div>
            </div>
            <div className="admin-actions">
              <a className="btn btn-secondary" href="/studio/events">View Saved Events</a>
              <a className="submit-btn" href="/studio/events/new">Create Event</a>
            </div>
          </div>

          <div className="admin-card">
            <h2>Sidebar</h2>
            <ul className="service-list">
              <li>Dashboard</li>
              <li>Events</li>
              <li>Create Event</li>
              <li>Photos</li>
              <li>Selections</li>
              <li>Clients</li>
              <li>Settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
