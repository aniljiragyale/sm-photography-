import './globals.css';
import type { Metadata, Viewport } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SiteChatbot } from '@/components/site-chatbot';
import { SiteAnalyticsTracker } from '@/components/site-analytics-tracker';
import { SiteThemeProvider } from '@/components/site-theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.smphotography.co.in'),
  title: 'SM Photography and Films',
  description: 'Photography portfolio and wedding film studio in Sangli, Maharashtra.',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '512x512' }],
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'SM Photography and Films',
    description: 'Photography portfolio and wedding film studio in Sangli, Maharashtra.',
    type: 'website',
    images: [{ url: '/images/sm-photography-social.png', width: 1200, height: 1000, alt: 'SM Photography logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: '/images/sm-photography-social.png', alt: 'SM Photography logo' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0d0d',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SM Photography and Films',
  alternateName: 'SM Photography',
  url: 'https://www.smphotography.co.in',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.smphotography.co.in/logo.png',
    width: 2456,
    height: 1208,
  },
  telephone: '+91 95118 35507',
  address: [
    { '@type': 'PostalAddress', addressLocality: 'Malgaon', addressRegion: 'Maharashtra', addressCountry: 'IN' },
    { '@type': 'PostalAddress', addressLocality: 'Miraj', addressRegion: 'Maharashtra', addressCountry: 'IN' },
  ],
  sameAs: [
    'https://www.linkedin.com/in/satishmolekar',
    'https://www.facebook.com/share/1FDbovcGCA',
    'https://www.instagram.com/sm_photography.in/',
    'https://www.instagram.com/the_sm_studio__/',
    'https://youtube.com/@sm_photography_film',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <SiteAnalyticsTracker />
        <SiteThemeProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteChatbot />
          <SiteFooter />
        </SiteThemeProvider>
      </body>
    </html>
  );
}
