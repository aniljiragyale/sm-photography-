'use client';

import { useEffect, useState } from 'react';
import { getBackendToken } from '@/lib/backend';

type EventItem = {
  id: number;
  client_name: string;
  event_name: string;
  event_code: string;
  status: string;
  photo_count: number;
  selection_count: number;
};

export default function StudioEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      const token = getBackendToken();
      try {
        const response = await fetch('http://localhost:4000/api/events', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (response.status === 401) {
          window.location.assign('/studio-login');
          return;
        }
        if (!response.ok) throw new Error('Unable to load saved events.');
        setEvents((await response.json()) as EventItem[]);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load saved events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="eyebrow">Studio events</p>
        <h1>Events</h1>
      </div>

      <div className="page-content">
        <div className="admin-actions" style={{ marginBottom: '1rem' }}>
          <a href="/studio/events/new" className="submit-btn">Create New Event</a>
        </div>

        <div className="admin-card">
          {loading ? (
            <p>Loading events...</p>
          ) : error ? (
            <p className="form-status error-status">{error}</p>
          ) : events.length === 0 ? (
            <p>No events created yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '0.75rem' }}>Event</th>
                  <th style={{ padding: '0.75rem' }}>Client</th>
                  <th style={{ padding: '0.75rem' }}>Code</th>
                  <th style={{ padding: '0.75rem' }}>Photos</th>
                  <th style={{ padding: '0.75rem' }}>Selections</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '0.75rem' }}>{event.event_name}</td>
                    <td style={{ padding: '0.75rem' }}>{event.client_name || 'Not set'}</td>
                    <td style={{ padding: '0.75rem' }}>{event.event_code}</td>
                    <td style={{ padding: '0.75rem' }}>{event.photo_count}</td>
                    <td style={{ padding: '0.75rem' }}>{event.selection_count}</td>
                    <td style={{ padding: '0.75rem' }}>{event.status}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <a href={`/studio/events/${event.id}`} className="page-back">Manage</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
