import './globals.css';
import type { Metadata, Viewport } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SiteChatbot } from '@/components/site-chatbot';
import { SiteThemeProvider } from '@/components/site-theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.smphotography.co.in'),
  title: 'SM Photography and Films',
  description: 'Photography portfolio and wedding film studio in Sangli, Maharashtra.',
  icons: {
    icon: '/images/sm-photography-social.png',
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
  maximumScale: 1,
  themeColor: '#0d0d0d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
