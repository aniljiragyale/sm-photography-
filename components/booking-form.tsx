'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getEmailErrorMessage, sendBookingEmail } from '@/lib/email';
import { subscribeToPublishedContent } from '@/lib/admin-data';

type BookingPackage = { name: string };

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function packageMatchesSession(session: string, packageName: string) {
  const event = normalize(session);
  const name = normalize(packageName);
  if (!event || event === 'other') return true;

  if (event.includes('pre wedding') || event.includes('prewedding')) {
    return name.includes('pre wedding') || name.includes('prewedding');
  }
  if (event.includes('wedding')) {
    return !name.includes('pre wedding') && !name.includes('prewedding') &&
      (name.includes('wedding') || /\b(silver|gold|diamond)\b/.test(name));
  }
  if (event.includes('maternity')) return name.includes('maternity');
  if (event.includes('baby') || event.includes('newborn') || event.includes('child')) {
    return name.includes('baby') || name.includes('newborn') || name.includes('child');
  }

  const words = event.split(' ').filter((word) => word.length > 3 && !['shoot', 'session', 'photography'].includes(word));
  if (words.some((word) => name.includes(word))) return true;

  // General occasions use general event packages, not packages made for weddings or maternity.
  return !['pre wedding', 'prewedding', 'wedding', 'maternity', 'baby', 'newborn', 'child']
    .some((specialty) => name.includes(specialty));
}

export function BookingForm() {
  const [status, setStatus] = useState('');
  const [bookingContext] = useState(() => {
    if (typeof window === 'undefined') return { eventType: '', packageTier: '', offer: '' };
    const query = new URLSearchParams(window.location.search);
    return { eventType: query.get('eventType') || '', packageTier: query.get('package') || '', offer: query.get('offer') || '' };
  });
  const [eventType, setEventType] = useState(bookingContext.eventType);
  const [packageTier, setPackageTier] = useState(bookingContext.packageTier);
  const [packages, setPackages] = useState<BookingPackage[]>([]);
  const [referral, setReferral] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    return subscribeToPublishedContent((content) => {
      setPackages(content.packages.filter((item) => typeof item.name === 'string').map(({ name }) => ({ name })));
    });
  }, []);

  const availablePackages = useMemo(() => {
    const filtered = packages.filter((item) =>
      !normalize(item.name).includes('terms and conditions') && packageMatchesSession(eventType, item.name)
    );
    if (bookingContext.packageTier && !filtered.some((item) => item.name === bookingContext.packageTier)) {
      filtered.unshift({ name: bookingContext.packageTier });
    }
    return filtered;
  }, [bookingContext.packageTier, eventType, packages]);

  useEffect(() => {
    if (packageTier && packageTier !== 'Other' && !availablePackages.some((item) => item.name === packageTier)) {
      setPackageTier('');
    }
  }, [availablePackages, packageTier]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    setStatus('Sending your booking request...');

    try {
      const values = new FormData(form);
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: values.get('first_name'),
          lastName: values.get('last_name'),
          email: values.get('email'),
          phone: values.get('phone'),
          eventType: values.get('event_type_other') || values.get('event_type'),
          packageName: values.get('package_other') || values.get('package'),
          eventDate: values.get('event_date'),
          venue: values.get('venue'),
          schedule: values.get('schedule'),
          referral: values.get('referral_other') || values.get('referral'),
          offer: values.get('offer'),
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Booking request could not be saved.');

      let emailWarning = '';
      try {
        await sendBookingEmail(form);
      } catch (error) {
        emailWarning = ` The request is saved, but the studio email notification failed: ${getEmailErrorMessage(error)}`;
      }
      setStatus(`Booking request saved successfully. We will get back to you soon.${emailWarning}`);
      form.reset();
      setEventType('');
      setPackageTier('');
      setReferral('');
    } catch (error) {
      setStatus(`Booking request could not be saved: ${error instanceof Error ? error.message : getEmailErrorMessage(error)}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {bookingContext.offer && <input type="hidden" name="offer" value={bookingContext.offer} />}
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
          <option>Engagement</option>
          <option>Maternity</option>
          <option>Baby Shoot</option>
          <option>Birthday</option>
          <option>Corporate</option>
          <option>Event Coverage</option>
          <option>Outdoor Session</option>
          <option>Modeling Portfolio</option>
          <option>Portrait Session</option>
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
          {availablePackages.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
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
