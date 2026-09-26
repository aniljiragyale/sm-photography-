import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>© 2026 SM PHOTOGRAPHY AND FILMS. All rights reserved.</p>
        <div>
          <Link href="/contact">Contact</Link>
          {' • '}
          <Link href="/gallery">Gallery</Link>
          {' • '}
          <Link href="/admin/login">Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}
