'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OFFER_PACKAGES, type Offer } from '@/lib/offer-types';
import { getBackendToken } from '@/lib/backend';
import { isAdminLoggedIn } from '@/lib/admin-data';

type FormState = {
  title: string; slug: string; description: string; image: string; discountType: 'percentage' | 'fixed' | 'none'; discountValue: string;
  packages: string[]; startsAt: string; endsAt: string; active: boolean; label: '' | 'Special Offer' | 'Limited Time Offer';
  featured: boolean;
};

function localDateTime(value: string) {
  const date = value ? new Date(value) : new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function emptyForm(): FormState {
  const start = new Date();
  return { title: '', slug: '', description: '', image: '', discountType: 'percentage', discountValue: '10', packages: [], startsAt: localDateTime(start.toISOString()), endsAt: '', active: true, featured: false, label: 'Limited Time Offer' };
}

export default function StudioOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = getBackendToken();

  const headers = useMemo(() => ({ Authorization: token ? `Bearer ${token}` : '' }), [token]);
  const loadOffers = useCallback(async () => {
    const response = await fetch('/api/offers?manage=1', { headers, cache: 'no-store' });
    if (response.status === 401) { router.replace('/studio-login?next=%2Fstudio%2Foffers'); return; }
    if (!response.ok) throw new Error((await response.json()).error || 'Could not load offers.');
    setOffers(await response.json() as Offer[]);
  }, [headers, router]);

  useEffect(() => {
    if (!isAdminLoggedIn() || !getBackendToken()) { router.replace('/studio-login?next=%2Fstudio%2Foffers'); return; }
    loadOffers().catch((error: unknown) => setStatus(error instanceof Error ? error.message : 'Could not load offers.')).finally(() => setLoading(false));
  }, [loadOffers, router]);

  const resetForm = () => { setEditing(null); setForm(emptyForm()); setStatus(''); };
  const resetEditor = () => {
    if (!editing) {
      setForm(emptyForm());
      setStatus('Form reset. Saved offers are unchanged.');
      return;
    }
    const saved = offers.find((offer) => offer.slug === editing);
    if (!saved) { resetForm(); return; }
    setForm({ title: saved.title, slug: saved.slug, description: saved.description, image: saved.image, discountType: saved.discountType, discountValue: String(saved.discountValue), packages: saved.packages, startsAt: localDateTime(saved.startsAt), endsAt: saved.endsAt ? localDateTime(saved.endsAt) : '', active: saved.active, featured: Boolean(saved.featured), label: saved.label });
    setStatus('Changes reset to the saved offer.');
  };
  const editOffer = (offer: Offer) => {
    setEditing(offer.slug);
    setForm({ title: offer.title, slug: offer.slug, description: offer.description, image: offer.image, discountType: offer.discountType, discountValue: String(offer.discountValue), packages: offer.packages, startsAt: localDateTime(offer.startsAt), endsAt: offer.endsAt ? localDateTime(offer.endsAt) : '', active: offer.active, featured: Boolean(offer.featured), label: offer.label });
    setStatus('');
    document.getElementById('offer-editor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    const data = new FormData(); data.append('file', file); setUploading(true); setStatus('Uploading offer image...');
    try {
      const response = await fetch('/api/offers/upload', { method: 'POST', headers, body: data });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || 'Image upload failed.');
      setForm((current) => ({ ...current, image: result.url! })); setStatus('Image uploaded. Save the offer to publish it.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Image upload failed.'); }
    finally { setUploading(false); }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setStatus('Saving offer...');
    const slug = form.slug.trim().toLowerCase();
    const payload = { ...form, existingId: editing ? offers.find((offer) => offer.slug === editing)?.id : undefined, slug, discountValue: Number(form.discountValue || 0), startsAt: new Date(form.startsAt).toISOString(), endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null };
    try {
      const response = await fetch('/api/offers', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json() as Offer | { error?: string };
      if (!response.ok) throw new Error('error' in result ? result.error : 'Could not save offer.');
      await loadOffers(); setStatus('Offer saved.'); setEditing(null); setForm(emptyForm());
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not save offer.'); }
    finally { setSaving(false); }
  };

  const removeOffer = async (slug: string) => {
    if (!window.confirm('Delete this offer? This cannot be undone.')) return;
    const response = await fetch(`/api/offers?slug=${encodeURIComponent(slug)}`, { method: 'DELETE', headers });
    if (!response.ok) { const result = await response.json(); setStatus(result.error || 'Could not delete offer.'); return; }
    await loadOffers(); if (editing === slug) resetForm(); setStatus('Offer deleted.');
  };

  const togglePackage = (item: string) => setForm((current) => ({ ...current, packages: current.packages.includes(item) ? current.packages.filter((value) => value !== item) : [...current.packages, item] }));
  const updateTitle = (value: string) => setForm((current) => ({ ...current, title: value, slug: editing ? current.slug : value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
  const useMaternityPosterContent = () => setForm((current) => ({
    ...current,
    title: 'Maternity Photography Packages',
    slug: 'maternity-photography-packages',
    description: 'Celebrate your journey to motherhood with a maternity session designed around you.\n\nBASIC — ₹3,000\n10 edited photos · 1 cinematic reel · 1 outfit included\n\nPREMIUM — ₹5,000\n15 edited photos · 1 cinematic reel · 2 outfits included\n\nPREMIUM PLUS — ₹7,000\n15 edited photos · 1 cinematic reel · 2 outfits · professional makeup and hairstyling\n\nLUXURY — ₹10,000\n15 edited photos · 1 cinematic reel · premium album · 2 outfits · professional makeup and hairstyling\n\nProfessional photography, creative concepts, a comfortable and safe experience, and timeless memories.',
    discountType: 'none',
    discountValue: '0',
    packages: ['Maternity'],
    featured: true,
    active: true,
    label: 'Special Offer',
  }));
  const baseUrl = typeof window === 'undefined' ? '' : window.location.origin;

  return (
    <div className="page-shell">
      <div className="page-header admin-header-row"><div><p className="eyebrow">Studio dashboard</p><h1>Offers &amp; promotions</h1></div><Link href="/studio" className="page-back back-icon" aria-label="Back to studio" title="Back to studio"><span aria-hidden="true">←</span></Link></div>
      <div className="page-content offers-admin-layout">
        <section className="admin-card"><h2>Saved offers</h2>{loading ? <p>Loading offers…</p> : offers.length === 0 ? <p className="form-note">No offers yet. Create your first offer using the form.</p> : (
          <div className="offers-admin-list">{offers.map((offer) => {
            const live = offer.active && Date.parse(offer.startsAt) <= Date.now() && (!offer.endsAt || Date.parse(offer.endsAt) > Date.now());
            const expired = Boolean(offer.endsAt && Date.parse(offer.endsAt) <= Date.now());
            return <article className="offers-admin-item" key={offer.id}>
              {offer.image && <img src={offer.image} alt="" />}
              <div className="offers-admin-item-copy"><h3>{offer.title}</h3><p>{offer.packages.join(' · ')} · {offer.discountType === 'percentage' ? `${offer.discountValue}% off` : offer.discountType === 'fixed' ? `₹${offer.discountValue} off` : 'Special price'}</p><p className="form-note">Starts {new Date(offer.startsAt).toLocaleString()}{offer.endsAt ? ` · Expires ${new Date(offer.endsAt).toLocaleString()}` : ' · No expiry'}</p><span className={`offer-admin-state ${live ? 'is-live' : ''}`}>{live ? 'Live' : expired ? 'Expired' : offer.active ? 'Scheduled' : 'Inactive'}</span>{offer.featured && <span className="offer-admin-featured">Featured on homepage</span>}<div className="admin-actions"><button className="btn btn-secondary" type="button" onClick={() => editOffer(offer)}>Edit</button><button className="btn btn-secondary" type="button" onClick={() => void navigator.clipboard.writeText(`${baseUrl}/offers/${offer.slug}`).then(() => setStatus('Offer link copied.'))}>Copy link</button><a className="btn btn-secondary" href={`/offers/${offer.slug}`} target="_blank" rel="noreferrer">Preview</a><button className="remove-btn" type="button" onClick={() => void removeOffer(offer.slug)}>Delete offer</button></div></div>
            </article>;
          })}</div>
        )}</section>

        <section className="admin-card" id="offer-editor"><h2>{editing ? 'Edit offer' : 'Create an offer'}</h2>{!editing && <button type="button" className="btn btn-secondary offer-template-button" onClick={useMaternityPosterContent}>Fill details from the maternity poster</button>}<form className="admin-form" onSubmit={save}>
          <div className="grid-form two-column-form"><label>Offer title<input className="field" required maxLength={100} value={form.title} onChange={(event) => updateTitle(event.target.value)} /></label><label>Share link slug<input className="field" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} disabled={Boolean(editing)} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} /></label></div>
          <label>Description<textarea className="field" required maxLength={1000} rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
          <fieldset className="offer-package-picker"><legend>Applicable packages</legend>{OFFER_PACKAGES.map((item) => <label key={item}><input type="checkbox" checked={form.packages.includes(item)} onChange={() => togglePackage(item)} /> {item}</label>)}</fieldset>
          <div className="grid-form two-column-form"><label>Discount type<select className="field" value={form.discountType} onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value as FormState['discountType'], discountValue: event.target.value === 'none' ? '0' : current.discountValue }))}><option value="percentage">Percentage</option><option value="fixed">Fixed amount (₹)</option><option value="none">No discount amount</option></select></label>{form.discountType !== 'none' && <label>{form.discountType === 'percentage' ? 'Discount percent' : 'Discount amount (₹)'}<input className="field" type="number" min="1" max={form.discountType === 'percentage' ? '100' : '10000000'} step="1" required value={form.discountValue} onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))} /></label>}</div>
          <div className="grid-form two-column-form"><label>Starts at<input className="field" type="datetime-local" required value={form.startsAt} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))} /></label><label>Expires at (optional)<input className="field" type="datetime-local" value={form.endsAt} onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))} /></label></div>
          <div className="grid-form two-column-form"><label>Offer label<select className="field" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value as FormState['label'] }))}><option value="">No label</option><option>Special Offer</option><option>Limited Time Offer</option></select></label><div className="offer-check-toggles"><label className="offer-active-toggle"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} /> Active offer</label><label className="offer-active-toggle"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Feature as the big homepage offer</label></div></div>
          <label>Promotional image {form.image ? <img className="offer-upload-preview" src={form.image} alt="Offer banner preview" /> : null}<input className="field" type="file" accept="image/*" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])} /></label>
          <p className="form-note">Offer link: {baseUrl}/offers/{form.slug || 'offer-name'}</p>
          {status && <p className="form-status" role="status">{status}</p>}
          <div className="admin-actions"><button className="submit-btn" disabled={saving || uploading}>{saving ? 'Saving…' : editing ? 'Save offer' : 'Create offer'}</button><button type="button" className="btn btn-secondary" disabled={saving || uploading} onClick={resetEditor}>{editing ? 'Reset changes' : 'Reset form'}</button>{editing && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel edit</button>}</div>
        </form></section>
      </div>
    </div>
  );
}
