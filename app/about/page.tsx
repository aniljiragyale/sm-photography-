 'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { defaultBranches, loadPublishedContent, type BranchItem } from '@/lib/admin-data';

const strengths = [
  {
    title: 'Story-driven approach',
    description:
      'Every frame is built around your emotions, relationships, and the atmosphere of the moment rather than generic posing.',
  },
  {
    title: 'Creative direction',
    description:
      'From wardrobe guidance to location planning, we help shape a visual story that feels true to your personality and style.',
  },
  {
    title: 'Modern equipment',
    description:
      'Our studio and on-location setups are designed for crisp detail, rich colors, and beautifully-lit portraits in every setting.',
  },
  {
    title: 'Comfort-first experience',
    description:
      'We create a calm, natural environment so you can relax, enjoy the shoot, and let your genuine expression shine through.',
  },
];

export default function AboutPage() {
  const [branches, setBranches] = useState<BranchItem[]>(defaultBranches);

  useEffect(() => {
    loadPublishedContent().then((content) => setBranches(content.branches));
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-actions page-actions-top">
          <Link href="/" className="page-back">← Back</Link>
        </div>
        <p className="eyebrow">About the artist</p>
        <h1>About Me</h1>
      </div>

      <div className="page-content">
        <div className="page-grid">
          <div>
            <img
              src="/images/MY PHOTO.jpg"
              alt="Satish Molekar of SM Photography"
              style={{ borderRadius: '22px', width: '100%', minHeight: '420px', objectFit: 'cover' }}
            />
          </div>

          <div>
            <h2>Capturing life with feeling</h2>
            <p>
              Based in Malgaon, Sangli district, I have a deep-rooted passion for photography and specialize in capturing not just moments — but emotions, stories, and connections that last a lifetime.
            </p>
            <p>
              Whether it is a grand wedding, an intimate maternity shoot, a stylish modeling portfolio, or candid life moments, I bring a unique blend of creativity, professionalism, and attention to detail to every frame.
            </p>
            <p>
              I believe great photography isn’t only about the camera — it’s about understanding people, building trust, and creating a comfortable space where they can be themselves.
            </p>
            <p>
              Every photograph we create is shaped with heart, precision, and artistic intention so your memories remain timeless.
            </p>
          </div>
        </div>

        <div className="services-grid-plain" style={{ marginTop: '2rem' }}>
          {strengths.map((item) => (
            <div key={item.title} className="info-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>

        <section className="branch-section">
          <p className="eyebrow">Visit our studios</p>
          <h2>Studio branches</h2>
          <div className="branch-grid">
            {branches.map((branch) => (
              <article className="branch-card" key={branch.id}>
                {branch.image ? <img src={branch.image} alt={branch.name} /> : null}
                <div className="branch-card-copy">
                  <h3>{branch.name}</h3>
                  <p>{branch.description}</p>
                  <a href={branch.locationUrl} target="_blank" rel="noreferrer">{branch.address}</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
