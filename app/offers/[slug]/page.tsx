import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OfferDetailActions } from '@/components/offer-detail-actions';
import { getOffer } from '@/lib/offer-store';
import { formatOfferDiscount, offerIsLive } from '@/lib/offer-types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const offer = await getOffer(params.slug);
  if (!offer || !offerIsLive(offer)) return { title: 'Offer unavailable | SM Photography' };
  const description = `${offer.description} ${formatOfferDiscount(offer)} on ${offer.packages.join(', ')}.`;
  return {
    title: `${offer.title} | SM Photography`, description,
    openGraph: { title: offer.title, description, type: 'website', images: [{ url: '/images/sm-photography-social.png', width: 1200, height: 1000, alt: 'SM Photography logo' }] },
    twitter: { card: 'summary_large_image', title: offer.title, description, images: [{ url: '/images/sm-photography-social.png', alt: 'SM Photography logo' }] },
  };
}

export default async function OfferPage({ params }: { params: { slug: string } }) {
  const offer = await getOffer(params.slug);
  if (!offer || !offerIsLive(offer)) notFound();
  return (
    <div className="page-shell offer-page-shell">
      <div className="page-header"><div className="page-actions page-actions-top"><Link href="/" className="page-back">← Home</Link></div><p className="eyebrow">SM Photography · Limited promotion</p><h1>{offer.title}</h1></div>
      <div className="page-content">
        <article className={`offer-detail-card ${offer.image ? '' : 'offer-detail-card--no-image'}`}>
          {offer.image && <img className="offer-detail-image" src={offer.image} alt={offer.title} />}
          <div className="offer-detail-copy">
            {offer.label && <span className="offer-ribbon offer-detail-ribbon">{offer.label}</span>}
            <p className="offer-detail-discount">{formatOfferDiscount(offer)}</p>
            <h2>{offer.title}</h2>
            <p>{offer.description}</p>
            <p className="offer-detail-packages">Available for: {offer.packages.join(', ')}</p>
            <OfferDetailActions offer={offer} />
          </div>
        </article>
      </div>
    </div>
  );
}
