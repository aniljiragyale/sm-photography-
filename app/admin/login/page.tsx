'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ADMIN_PASSWORD, setAdminLoggedIn } from '@/lib/admin-data';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.trim() !== ADMIN_PASSWORD) {
      setError('Incorrect password. Please try again.');
      return;
    }

    setAdminLoggedIn(true);
    router.push('/admin');
  };

  return (
    <div className="page-shell admin-shell">
      <div className="page-header">
        <p className="eyebrow">Private access</p>
        <h1>Admin Login</h1>
      </div>

      <div className="page-content admin-panel">
        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            className="field"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            autoComplete="current-password"
          />

          {error ? <p className="form-status error-status">{error}</p> : null}

          <div className="admin-actions">
            <button type="submit" className="submit-btn">Login</button>
            <Link href="/" className="page-back">
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
