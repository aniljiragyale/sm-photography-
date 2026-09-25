import emailjs from '@emailjs/browser';

const bookingEmail = {
  serviceId: 'service_yil2ugi',
  templateId: 'template_pctxvfg',
  publicKey: 'EfFovMSVNZE-iwywJ',
};

const enquiryEmail = {
  serviceId: 'service_kn0lggs',
  templateId: 'template_vx9mv8g',
  publicKey: 'hOn2D3wSwyZIQRSft',
};

export function sendBookingEmail(form: HTMLFormElement) {
  emailjs.init(bookingEmail.publicKey);
  const formData = new FormData(form);
  const firstName = String(formData.get('first_name') || '');
  const lastName = String(formData.get('last_name') || '');
  const eventType = String(formData.get('event_type') || '');
  const packageName = String(formData.get('package') || '');
  const referral = String(formData.get('referral') || '');

  return emailjs.send(bookingEmail.serviceId, bookingEmail.templateId, {
    from_name: `${firstName} ${lastName}`.trim(),
    email: String(formData.get('email') || ''),
    phone: String(formData.get('phone') || ''),
    event_type: `${eventType}${formData.get('event_type_other') ? `: ${formData.get('event_type_other')}` : ''}`,
    package: `${packageName}${formData.get('package_other') ? `: ${formData.get('package_other')}` : ''}`,
    event_date: String(formData.get('event_date') || ''),
    venue: String(formData.get('venue') || ''),
    details: String(formData.get('schedule') || ''),
    source: `${referral}${formData.get('referral_other') ? `: ${formData.get('referral_other')}` : ''}`,
  });
}

export function sendEnquiryEmail(form: HTMLFormElement) {
  emailjs.init(enquiryEmail.publicKey);
  return emailjs.sendForm(enquiryEmail.serviceId, enquiryEmail.templateId, form);
}

export function getEmailErrorMessage(error: unknown) {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object' && 'text' in error) {
    const text = (error as { text?: unknown }).text;
    if (typeof text === 'string' && text.trim()) return text;
  }

  return 'Email service rejected the request. Please try again later.';
}