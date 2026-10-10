'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ADMIN_EMAIL, setAdminLoggedIn } from '@/lib/admin-data';
import { setBackendToken } from '@/lib/backend';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json();
      if (!response.ok || !result.token) {
        setError(result.error || 'Invalid admin credentials.');
        return;
      }
      setBackendToken(result.token);
      setAdminLoggedIn(true);
      router.push('/admin');
    } catch {
      setError('The admin backend is unavailable. Start the backend server and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell admin-shell">
      <div className="page-header">
        <p className="eyebrow">Private access</p>
        <h1>Admin Login</h1>
      </div>

      <div className="page-content admin-panel">
        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            className="field"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@smphotography.com"
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            className="field"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            autoComplete="current-password"
            required
          />

          {error ? <p className="form-status error-status">{error}</p> : null}

          <div className="admin-actions">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Login'}</button>
            <Link href="/" className="page-back">
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
