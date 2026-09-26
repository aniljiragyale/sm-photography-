'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL, setAdminLoggedIn } from '@/lib/admin-data';
import { setBackendToken } from '@/lib/backend';

export default function StudioLoginPage() {
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
      const response = await fetch('http://localhost:4000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Incorrect email or password. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setBackendToken(result.token);
      setAdminLoggedIn(true);
      const nextPath = new URLSearchParams(window.location.search).get('next');
      router.push(nextPath?.startsWith('/') ? nextPath : '/studio');
    } catch {
      setError('The backend is not running. Start the backend server first.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="eyebrow">Private studio access</p>
        <h1>Studio Login</h1>
      </div>

      <div className="page-content">
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label>
            Password
            <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          {error ? <p className="form-status error-status">{error}</p> : null}

          <div className="admin-actions">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
