'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/admin-data';

type GalleryPhoto = { id: string; title: string; category: string; image_url: string; description: string };
type GalleryEvent = { id: string; slug: string; clientName: string; galleryName: string; eventType: string; eventDate: string; location: string; status: string; photos: GalleryPhoto[]; selectionLimit: number | null; expiresAt: string | null; submissions: Array<{ id: string; selectedCount: number; submittedAt: string; status: string }> };

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [gallery, setGallery] = useState<GalleryEvent | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('BRIDE');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const fetchGallery = useCallback(async () => {
    const response = await fetch('/api/admin/galleries', { cache: 'no-store' });
    if (response.status === 401) { router.replace('/studio-login'); return; }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load gallery.');
    const found = (result as GalleryEvent[]).find((item) => item.id === id || item.slug === id);
    setGallery(found || null);
  }, [id, router]);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/studio-login'); return; }
    if (id) fetchGallery().catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Unable to load gallery.')).finally(() => setLoading(false));
  }, [fetchGallery, id, router]);

  const categories = useMemo(() => [...new Set(gallery?.photos.map((photo) => photo.category) || [])], [gallery]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || !gallery) return;
    setWorking(true);
    setMessage('Uploading photo to persistent storage...');
    try {
      const data = new FormData();
      data.append('file', file);
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: data });
      const uploaded = await uploadResponse.json() as { url?: string; error?: string };
      if (!uploadResponse.ok || !uploaded.url) throw new Error(uploaded.error || 'Image upload failed.');
      setMessage('Saving photo in the client gallery...');
      const response = await fetch(`/api/admin/galleries/${encodeURIComponent(gallery.id)}/photos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || file.name, category, description, imageUrl: uploaded.url }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save photo.');
      setTitle(''); setDescription('');
      await fetchGallery();
      setMessage('Photo uploaded and published to the client gallery.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Image upload failed.');
    } finally { setWorking(false); input.value = ''; }
  };

  const removePhoto = async (photo: GalleryPhoto) => {
    if (!gallery || !window.confirm(`Remove “${photo.title}” from this gallery?`)) return;
    const response = await fetch(`/api/admin/galleries/${encodeURIComponent(gallery.id)}/photos?photoId=${encodeURIComponent(photo.id)}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || 'Could not remove photo.'); return; }
    await fetchGallery();
    setMessage('Photo removed from the client gallery.');
  };

  if (loading) return <div className="page-shell"><div className="page-content"><p>Loading gallery...</p></div></div>;
  if (!gallery) return <div className="page-shell"><div className="page-content"><p>{message || 'Gallery not found.'}</p><Link href="/studio/events">Back to galleries</Link></div></div>;

  const clientUrl = `${typeof window === 'undefined' ? '' : window.location.origin}/client-gallery/${gallery.slug}`;
  return <div className="page-shell">
    <div className="page-header admin-header-row"><div><p className="eyebrow">Client gallery</p><h1>{gallery.galleryName}</h1><p>{gallery.clientName} · {gallery.eventType} · {gallery.eventDate}</p></div><Link href="/studio/events" className="btn btn-secondary">All galleries</Link></div>
    <div className="page-content">
      <section className="admin-card"><p><strong>Client link:</strong> <a href={clientUrl} target="_blank" rel="noreferrer">{clientUrl}</a></p><p><strong>Photos:</strong> {gallery.photos.length} · <strong>Selection limit:</strong> {gallery.selectionLimit || 'No limit'} · <strong>Status:</strong> {gallery.status}</p><p><strong>Location:</strong> {gallery.location || 'Not set'} · <strong>Expires:</strong> {gallery.expiresAt ? new Date(gallery.expiresAt).toLocaleDateString() : 'Never'}</p><button className="btn btn-secondary" type="button" onClick={() => void navigator.clipboard.writeText(clientUrl).then(() => setMessage('Client gallery link copied.'))}>Copy client link</button></section>
      <section className="admin-card" style={{ marginTop: '1.25rem' }}><h2>Add photo to this gallery</h2><div className="admin-form">
        <label>Photo title<input className="field" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Wedding photo 01" /></label>
        <label>Category<input className="field" list="client-gallery-categories" value={category} onChange={(event) => setCategory(event.target.value)} />{categories.length > 0 && <datalist id="client-gallery-categories">{categories.map((name) => <option key={name} value={name} />)}</datalist>}</label>
        <label>Description<textarea className="field" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></label>
        <div className="upload-row"><button type="button" className="btn btn-secondary upload-button" disabled={working} onClick={() => fileInputRef.current?.click()}>{working ? 'Uploading...' : 'Upload & Save Photo'}</button><input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(event) => void handleUpload(event)} /></div>
        {message && <p className="form-status" role="status">{message}</p>}
      </div></section>
      <section className="admin-card" style={{ marginTop: '1.25rem' }}><h2>Uploaded photos</h2>{gallery.photos.length === 0 ? <p>No photos uploaded yet.</p> : <div className="admin-item-list">{gallery.photos.map((photo) => <article className="admin-item-card" key={photo.id}><img src={photo.image_url} alt={photo.title} style={{ width: 150, height: 120, objectFit: 'cover', borderRadius: 10 }} /><div><h3>{photo.title}</h3><p>{photo.category}</p>{photo.description && <p>{photo.description}</p>}</div><button type="button" className="remove-btn" onClick={() => void removePhoto(photo)}>Remove photo</button></article>)}</div>}</section>
      {gallery.submissions.length > 0 && <section className="admin-card" style={{ marginTop: '1.25rem' }}><h2>Client selections</h2>{gallery.submissions.map((submission) => <p key={submission.id}>{new Date(submission.submittedAt).toLocaleString()} · {submission.selectedCount} selected · {submission.status}</p>)}</section>}
    </div>
  </div>;
}
