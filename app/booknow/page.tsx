import { BookingForm } from '@/components/booking-form';
import Link from 'next/link';

export default function BookNowPage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-actions page-actions-top">
          <Link href="/" className="page-back">← Back</Link>
        </div>
        <p className="eyebrow">Reserve your date</p>
        <h1>Book Your Photography Session</h1>
      </div>

      <div className="form-section">
        <BookingForm />
      </div>
    </div>
  );
}
