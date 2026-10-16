'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSiteTheme } from '@/components/site-theme-provider';
import { SiteOfferBadge } from '@/components/site-offer-badge';

const navItems = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/portfolio', label: 'Enquiry' },
  { href: '/contact', label: 'Contact' },
  { href: '/about', label: 'About Me' },
  { href: '/admin/login', label: 'Admin Login' },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useSiteTheme();

  return (
    <header className="site-header">
      <div className="header-firework header-firework--one" aria-hidden="true" />
      <div className="header-firework header-firework--two" aria-hidden="true" />
      <div className="header-firework header-firework--three" aria-hidden="true" />
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="SM Photography home">
          <span className="brand-mark">
            <img src="/favicon.png" alt="SM Photography logo" width="512" height="512" fetchPriority="high" />
          </span>
          <span className="brand-text">SM PHOTOGRAPHY</span>
        </Link>

        <div className="nav-wrap">
          <button
            type="button"
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            ☰
          </button>

          <button
            type="button"
            className="site-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.2 15.2A8.2 8.2 0 0 1 8.8 3.8 8.4 8.4 0 1 0 20.2 15.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
            )}
          </button>

          <SiteOfferBadge className="site-header-offer-badge" />

          <nav aria-label="Main navigation">
            <ul className={`top-nav ${isOpen ? 'is-open' : ''}`}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
