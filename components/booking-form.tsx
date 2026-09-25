'use client';

import { FormEvent, useState } from 'react';
import { getEmailErrorMessage, sendBookingEmail } from '@/lib/email';

export function BookingForm() {
  const [status, setStatus] = useState('');
  const [eventType, setEventType] = useState('');
  const [packageTier, setPackageTier] = useState('');
  const [referral, setReferral] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    setStatus('Sending your booking request...');

    try {
      await sendBookingEmail(form);
      setStatus('Booking request sent successfully. We will get back to you soon.');
      form.reset();
      setEventType('');
      setPackageTier('');
      setReferral('');
    } catch (error) {
      setStatus(`Booking request could not be sent: ${getEmailErrorMessage(error)}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-row">
        <input className="field" type="text" name="first_name" placeholder="First Name" required />
        <input className="field" type="text" name="last_name" placeholder="Last Name" required />
      </div>

      <div className="form-row">
        <input className="field" type="email" name="email" placeholder="Email" required />
        <input className="field" type="tel" name="phone" placeholder="Contact Number" required />
      </div>

      <div className="form-row">
        <select
          className="field"
          name="event_type"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          required
        >
          <option value="">Select Event</option>
          <option>Wedding</option>
          <option>Pre-Wedding</option>
          <option>Maternity</option>
          <option>Birthday</option>
          <option>Corporate</option>
          <option>Other</option>
        </select>

        {eventType === 'Other' && (
          <input className="field" type="text" name="event_type_other" placeholder="Specify Other Event" required />
        )}
      </div>

      <div className="form-row">
        <select
          className="field"
          name="package"
          value={packageTier}
          onChange={(e) => setPackageTier(e.target.value)}
          required
        >
          <option value="">Select Package</option>
          <option>Silver</option>
          <option>Gold</option>
          <option>Diamond</option>
          <option>Other</option>
        </select>

        {packageTier === 'Other' && (
          <input className="field" type="text" name="package_other" placeholder="Specify Other Package" required />
        )}
      </div>

      <div className="form-row">
        <input className="field" type="date" name="event_date" required />
      </div>

      <div className="form-row">
        <input className="field" type="text" name="venue" placeholder="Venue / Location" required />
      </div>

      <div className="form-row">
        <textarea className="form-field" name="schedule" placeholder="Event Schedule (e.g., 10AM - 5PM)" rows={3} required />
      </div>

      <div className="form-row">
        <select
          className="field"
          name="referral"
          value={referral}
          onChange={(e) => setReferral(e.target.value)}
        >
          <option value="">How did you hear about us?</option>
          <option>Instagram</option>
          <option>Facebook</option>
          <option>Google</option>
          <option>Friend/Referral</option>
          <option>Other</option>
        </select>

        {referral === 'Other' && (
          <input className="field" type="text" name="referral_other" placeholder="Please specify" required />
        )}
      </div>

      <button type="submit" className="submit-btn" disabled={isSending}>
        {isSending ? 'Sending...' : 'Send Request'}
      </button>
      <div className="form-status">{status}</div>
    </form>
  );
}
