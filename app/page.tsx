import Link from 'next/link';

const galleryMoments = [
  {
    title: 'Wedding Moments',
    body:
      'Weddings are a beautiful symphony of love, family, and tradition. We capture the emotional glances, joyful tears, and warm celebrations that turn a single day into a lifetime of treasured memories. Every frame is composed to feel cinematic, personal, and timeless.',
    details: ['Candid couple portraits', 'Family traditions and rituals', 'Cinematic storytelling from morning to reception'],
    image: '/images/Wedding (34).JPG',
  },
  {
    title: 'Pre-Wedding Love Story',
    body:
      'Your journey as a couple deserves a meaningful beginning. We create romantic, natural images that reflect your chemistry, personality, and the quiet moments that make your story unique. These portraits become a beautiful chapter before the wedding begins.',
    details: ['Location-based romantic frames', 'Natural posing with candid emotions', 'Elegant storytelling for couples'],
    image: '/images/Prewedding (23).jpg',
    reverse: true,
  },
  {
    title: 'Engagement Elegance',
    body:
      'Engagements are the promise of a lifetime, and we frame that promise with grace. From surprise proposals to ring ceremonies, we document the excitement, affection, and togetherness that define this special milestone with elegant storytelling.',
    details: ['Proposal and ring ceremony coverage', 'Stylish close-up portraits', 'Story-driven celebration moments'],
    image: '/images/Engg (1).jpeg',
  },
  {
    title: 'Maternity Magic',
    body:
      'Pregnancy is a miraculous chapter filled with glow, anticipation, and deep emotion. Our maternity shoots celebrate the beauty of motherhood through soft light, gentle posing, and portraits that feel calm, intimate, and deeply personal.',
    details: ['Soft natural-light portraits', 'Comfortable styling guidance', 'Keepsake images for family albums'],
    image: '/images/Maternity (30).jpg',
    reverse: true,
  },
  {
    title: 'Candid Moments',
    body:
      'Life’s most beautiful memories are often the unplanned ones. We focus on natural smiles, heartfelt laughter, tears of joy, and the honest expressions that make every celebration feel real, warm, and unforgettable.',
    details: ['Authentic real-life expressions', 'Fun family laughter and reactions', 'Emotion-rich event storytelling'],
    image: '/images/Candid (8).jpeg',
  },
  {
    title: 'Modeling Portfolio',
    body:
      'First impressions matter, and we build portfolios that reflect confidence and individuality. From styling guidance to elegant posing, each frame is designed to highlight your personality, presence, and visual identity in a polished and memorable way.',
    details: ['Editorial pose direction', 'Creative styling and visual framing', 'Work-ready portfolio visuals'],
    image: '/images/Modeling (5).jpg',
    reverse: true,
  },
];

const stats = [
  { label: 'Weddings', value: '200+' },
  { label: 'Pre-wedding', value: '150+' },
  { label: 'Portraits', value: '500+' },
  { label: 'Events', value: '350+' },
];

const photoHighlights = [
  {
    title: 'Wedding Storytelling',
    text: 'From the first look to the final dance, we document every emotion with cinematic composition, graceful detail shots, and honest human moments that feel timeless.',
  },
  {
    title: 'Pre-Wedding Romance',
    text: 'We design relaxed, natural portraits in meaningful locations so your love story feels authentic, elegant, and full of personality rather than staged or forced.',
  },
  {
    title: 'Family & Lifestyle',
    text: 'Our storytelling approach captures connection, laughter, tears, and warmth—creating visual records that feel personal, warm, and beautifully timeless.',
  },
];

const services = [
  'Wedding Shoot',
  'Pre-Wedding Shoot',
  'Cinematic Videography',
  'Maternity Photography',
  'Outdoor Sessions',
  'Event Coverage',
  'Candid Photography',
  'Modeling Portfolios',
  'Drone Shoot',
];

export default function HomePage() {
  return (
    <>
      <header className="hero-section">
        <div className="hero-overlay">
          <nav className="top-nav-mobile" aria-label="Main navigation" />
          <div className="hero-content">
            <p className="eyebrow">Moments crafted with emotion</p>
            <h1>SM PHOTOGRAPHY AND FILMS</h1>
            <p className="lead">
              Welcome to my world of photography — where love stories, milestones, and effortless
              beauty become treasured memories.
            </p>
            <div className="header-buttons">
              <Link href="/package" className="btn btn-primary">
                Packages
              </Link>
              <Link href="/ourservices" className="btn btn-secondary">
                Our Services
              </Link>
              <Link href="/booknow" className="btn btn-accent">
                Book Now Session
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="stats-strip" aria-label="Business stats">
        {stats.map((item) => (
          <div key={item.label} className="stat-box">
            <span>{item.value}</span>
            <small>{item.label}</small>
          </div>
        ))}
      </section>

      <section className="story-highlights section-block">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Why families choose us</p>
            <h2>Photography that feels personal, cinematic, and real</h2>
          </div>

          <div className="feature-grid">
            {photoHighlights.map((item) => (
              <div key={item.title} className="feature-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gallery-section">
        {galleryMoments.map((item) => {
          const imageUrl = encodeURI(item.image);

          return (
            <div key={item.title} className={`gallery-row ${item.reverse ? 'reverse' : ''}`}>
              <div className="gallery-image" style={{ backgroundImage: `url("${imageUrl}")` }} />
              <div className="gallery-text">
                <h2>{item.title}</h2>
                <p>{item.body}</p>
                {item.details && (
                  <ul className="gallery-details">
                    {item.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}

        <div className="visit-gallery">
          <h2>Visit Our Full Gallery</h2>
          <p>Experience the complete collection of our photography — from weddings to lifestyle, every image is a piece of art.</p>
          <Link href="/gallery" className="btn btn-primary">
            Explore Gallery
          </Link>
        </div>
      </section>

      <section className="studio-overview section-block">
        <div className="container narrow">
          <h2>About Studio</h2>
          <p>
            Welcome to <strong>SM Photography</strong>, founded by <strong>Satish Molekar</strong> and based in Malgaon Sangli — where timeless moments are captured with passion, creativity, and care.
          </p>
          <p>
            Every photograph we take is a reflection of emotion, beauty, and a unique story waiting to be told. Our studio is equipped with modern technology and warm, welcoming spaces designed to make each session comfortable and memorable.
          </p>
          <p>
            Whether you are celebrating love, expecting a new life, launching a brand, or embracing everyday joy — we are here to frame those special moments into everlasting memories.
          </p>
        </div>
      </section>

      <section className="services-showcase section-block">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">What we do best</p>
            <h2>Signature Services</h2>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service} className="service-card">
                <h3>{service}</h3>
                <p>
                  Crafted with artistic direction, thoughtful planning, and professional execution to turn your vision into timeless imagery.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container cta-inner">
          <div>
            <p className="eyebrow">Let’s create your story</p>
            <h2>Your perfect moments deserve the perfect frame.</h2>
          </div>
          <Link href="/contact" className="btn btn-primary">
            Contact Us
          </Link>
        </div>
      </section>

      <section className="contact-section section-block">
        <div className="contact-container">
          <h2>Get in Touch</h2>
          <p className="contact-message">
            Whether you’re planning your big day, a personal shoot, or need branding content, we’re here to bring your vision to life through the lens.
          </p>

          <ul className="contact-details">
            <li>
              <strong>Phone:</strong> <span className="nowrap">+91-95118 35507</span>
            </li>
            <li>
              <strong>Email:</strong> <a href="mailto:smphotography5207@gmail.com">smphotography5207@gmail.com</a>
            </li>
            <li>
              <strong>Branch 1:</strong> <a href="https://maps.app.goo.gl/AwgoQrcp92duJkoT6" target="_blank" rel="noreferrer">SM Photo Studio &amp; Films - Malgaon</a>
            </li>
            <li>
              <strong>Branch 2:</strong> <a href="https://share.google/ZnDunM3nDt7smSKDr" target="_blank" rel="noreferrer">SM Photo Studio &amp; Films - Miraj Sangli Miraj Kupwad</a>
            </li>
          </ul>

          <div className="social-links">
            <a href="https://www.linkedin.com/in/satishmolekar" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://www.facebook.com/share/1FDbovcGCA" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://www.instagram.com/sm_photography_official__/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
            </a>
            <a href="https://youtube.com/@sm_photography_film" target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
            <a href="https://wa.me/9511835507" target="_blank" rel="noreferrer" aria-label="WhatsApp">✆</a>
          </div>
        </div>
      </section>
    </>
  );
}
