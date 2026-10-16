'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const VISIT_SESSION_KEY = 'sm-photography:visit-session';
const VISIT_IDLE_LIMIT_MS = 30 * 60 * 1000;
const VISIT_ID_PATTERN = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

function getVisitId(): string {
  const now = Date.now();
  try {
    const saved = JSON.parse(localStorage.getItem(VISIT_SESSION_KEY) || 'null') as { id?: string; lastActivity?: number } | null;
    const id = saved?.id && VISIT_ID_PATTERN.test(saved.id) && typeof saved.lastActivity === 'number' && now - saved.lastActivity < VISIT_IDLE_LIMIT_MS
      ? saved.id
      : crypto.randomUUID();
    localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify({ id, lastActivity: now }));
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function SiteAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const isPrivatePath = pathname ? /^\/(admin|studio|client-gallery|photo-selection|select)(\/|$)/.test(pathname) || pathname === '/studio-login' : false;
    if (!pathname || isPrivatePath) return;

    const trackVisit = () => {
      const visitId = getVisitId();
      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname, visitId }),
        keepalive: true,
      }).catch(() => undefined);
    };
    const trackWhenVisible = () => {
      if (document.visibilityState === 'visible') trackVisit();
    };

    trackVisit();
    window.addEventListener('focus', trackVisit);
    document.addEventListener('visibilitychange', trackWhenVisible);
    return () => {
      window.removeEventListener('focus', trackVisit);
      document.removeEventListener('visibilitychange', trackWhenVisible);
    };
  }, [pathname]);

  return null;
}
