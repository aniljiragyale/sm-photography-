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
    icon: '/images/Flower.jpg',
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
