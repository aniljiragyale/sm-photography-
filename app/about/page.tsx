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
          <Link href="/" className="page-back back-icon" aria-label="Back to home" title="Back to home"><span aria-hidden="true">←</span></Link>
        </div>
        <p className="eyebrow">Meet your photographer</p>
        <h1>About Me</h1>
      </div>

      <div className="page-content">
        <div className="page-grid">
          <div className="about-intro-image">
            <img
              src="/images/MY PHOTO.jpg"
              alt="Satish Molekar of SM Photography"
              fetchPriority="high"
              decoding="async"
              style={{ borderRadius: '22px', width: '100%', minHeight: '420px', objectFit: 'cover' }}
            />
          </div>

          <div className="about-intro-copy">
            <h2>I believe every photograph should make you feel something.</h2>
            <p>
              I’m Satish Molekar, the photographer behind SM Photography &amp; Films. My journey began in Malgaon, where I learned that the most memorable photographs are about more than how a moment looks: they hold the joy, the people, and the feeling you want to remember.
            </p>
            <p>
              That belief guides every wedding story, maternity portrait, event, and personal shoot I create. I take time to understand what matters to you, then bring together thoughtful direction and an eye for honest, meaningful moments.
            </p>
            <p>
              I look for the little moments around the big ones: a proud glance, a shared laugh, or the details a family chose with care. Those are the frames that make a gallery feel like your story.
            </p>
            <p>
              A camera can record a moment; connection is what makes a photograph feel alive. I want you to feel comfortable, be yourself, and look back at your pictures years from now with the same warmth you felt that day.
            </p>
            <p>
              From our home studio in Malgaon to our second branch in Miraj, my team and I bring that same care to every celebration and every family we photograph. Thank you for trusting us with the moments that matter to you.
            </p>
          </div>
        </div>

        <div className="services-grid-plain" style={{ marginTop: '2rem' }}>
          {strengths.map((item, index) => (
            <div key={item.title} className="info-card animated-card" style={{ animationDelay: `${index * 90}ms` }}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>

        <section className="branch-section">
          <p className="eyebrow">Visit our studios</p>
          <h2>Find us in Malgaon and Miraj</h2>
          <p className="branch-section-intro">SM Photography &amp; Films welcomes you at two branches: our original studio in Malgaon, Sangli district, and our second studio in Miraj. Choose a location below for directions and get in touch to plan your session.</p>
          <div className="branch-grid">
            {branches.map((branch, index) => (
              <article className="branch-card animated-card" key={branch.id} style={{ animationDelay: `${index * 100}ms` }}>
                {branch.image ? <img src={branch.image} alt={branch.name} loading="lazy" decoding="async" /> : null}
                <div className="branch-card-copy">
                  <h3>{branch.name}</h3>
                  <p>{branch.description}</p>
                  <p className="branch-address">{branch.address}</p>
                  <a href={branch.locationUrl} target="_blank" rel="noreferrer" aria-label={`Get directions to ${branch.name}`}>Get directions <span aria-hidden="true">→</span></a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
