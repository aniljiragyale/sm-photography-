'use client';

import { FormEvent, useState } from 'react';
import { getEmailErrorMessage, sendEnquiryEmail } from '@/lib/email';

export function EnquiryForm() {
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    setStatus('Sending your enquiry...');

    try {
      await sendEnquiryEmail(form);
      setStatus('Enquiry sent successfully. We will get back to you soon.');
      form.reset();
    } catch (error) {
      setStatus(`Enquiry could not be sent: ${getEmailErrorMessage(error)}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="enquiry-form-shell">
      <form className="form-grid" onSubmit={handleSubmit}>
        <input className="field" type="text" name="user_name" placeholder="Your Full Name" required />
        <input className="field" type="email" name="user_email" placeholder="Your Email Address" required />
        <input className="field" type="tel" name="user_phone" placeholder="Your Phone Number" required />
        <textarea className="form-field" name="message" placeholder="Your Message..." rows={5} required />
        <button type="submit" className="submit-btn" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Enquiry'}
        </button>
        <div className="form-status">{status}</div>
      </form>
    </div>
  );
}
