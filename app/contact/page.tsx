'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { getEmailErrorMessage, sendEnquiryEmail } from '@/lib/email';

export default function ContactPage() {
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    setStatus('Sending your message...');

    try {
      await sendEnquiryEmail(form);
      setStatus('Message sent successfully. We will get back to you soon.');
      form.reset();
    } catch (error) {
      setStatus(`Message could not be sent: ${getEmailErrorMessage(error)}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-actions page-actions-top">
          <Link href="/" className="page-back">
            ← Back
          </Link>
        </div>
        <p className="eyebrow">Let’s talk</p>
        <h1>Contact</h1>
      </div>

      <div className="page-content contact-layout">
        <div>
          <h2>Get in Touch</h2>
          <p>Whether you are planning a wedding, personal session, or brand content, we are ready to help bring your vision to life.</p>
          <ul className="contact-details" style={{ marginTop: '1.5rem' }}>
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

          <div className="social-links" style={{ marginTop: '1.25rem' }}>
            <a href="https://www.linkedin.com/in/satishmolekar" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://www.facebook.com/share/1FDbovcGCA" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://www.instagram.com/sm_photography_official__/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
            </a>
            <a href="https://youtube.com/@sm_photography_film" target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
            <a href="https://wa.me/9511835507" target="_blank" rel="noreferrer" aria-label="WhatsApp">✆</a>
          </div>
        </div>

        <div className="form-section">
          <h3 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Send a Message</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input className="field" type="text" name="user_name" placeholder="Your name" required />
            <input className="field" type="email" name="user_email" placeholder="Your email" required />
            <input className="field" type="tel" name="user_phone" placeholder="Your phone number" required />
            <textarea className="form-field" name="message" placeholder="Tell us about your shoot, event, or question..." rows={5} required />
            <button type="submit" className="submit-btn" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Message'}
            </button>
            <div className="form-status">{status}</div>
          </form>
        </div>
      </div>
    </div>
  );
}
