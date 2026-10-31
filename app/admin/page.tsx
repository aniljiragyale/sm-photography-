'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  galleryCategories,
  getAllGalleryItems,
  getCustomGalleryItems,
  defaultPackages,
  defaultServices,
  defaultBranches,
  defaultGalleryItems,
  defaultOfferPopup,
  defaultWebsiteSettings,
  loadPublishedContent,
  isAdminLoggedIn,
  resetPublishedContent,
  saveCustomGalleryItems,
  savePublishedContent,
  setAdminLoggedIn,
  type GalleryItem,
  type PackageItem,
  type ServiceItem,
  type BranchItem,
  type OfferPopupSettings,
  type WebsiteSettings,
} from '@/lib/admin-data';
import { clearBackendToken, getBackendToken } from '@/lib/backend';

const initialForm = {
  title: '',
  category: 'wedding',
  image: '',
  description: '',
  featured: false,
};

type AnalyticsSummary = { totalVisits: number; dailyVisits: Array<{ date: string; visits: number }> };

export default function AdminPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>(defaultPackages);
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [branches, setBranches] = useState<BranchItem[]>(defaultBranches);
  const [bannerImage, setBannerImage] = useState('');
  const [offerPopup, setOfferPopup] = useState<OfferPopupSettings>(defaultOfferPopup);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(defaultWebsiteSettings);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [isBannerSaving, setIsBannerSaving] = useState(false);
  const [isBranchesSaving, setIsBranchesSaving] = useState(false);
  const [serviceUploadIndex, setServiceUploadIndex] = useState<number | null>(null);
  const [branchMessage, setBranchMessage] = useState('');
  const [message, setMessage] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsError, setAnalyticsError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace('/admin/login');
      return;
    }

    fetch('/api/analytics', {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${getBackendToken() || ''}` },
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load website analytics.');
      setAnalytics(result as AnalyticsSummary);
      setAnalyticsError('');
    }).catch((error: unknown) => {
      setAnalyticsError(error instanceof Error ? error.message : 'Could not load website analytics.');
    });

    loadPublishedContent().then((content) => {
      setPackages(content.packages);
      setServices(content.services);
      setBranches(content.branches);
      setBannerImage(content.bannerImage || '');
      setOfferPopup(content.offerPopup || defaultOfferPopup);
      setWebsiteSettings(content.settings || defaultWebsiteSettings);
      setItems([...defaultGalleryItems, ...content.gallery]);
    });
    setIsReady(true);
  }, [router]);

  const customItems = useMemo(() => items.filter((item) => !defaultGalleryItems.some((defaultItem) => defaultItem.id === item.id)), [items]);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    setMessage('Uploading image...');
    const response = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${getBackendToken() || ''}` }, body: data });
    const result = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !result.url) {
      setMessage(result.error || 'Image upload failed.');
      return;
    }
    setForm((prev) => ({ ...prev, image: result.url || '' }));
    setMessage('Image uploaded. Save the photo to publish it.');
  };

  const saveItem = async () => {
    if (!form.title.trim() || !form.image.trim()) {
      setMessage('Please add a title and upload an image.');
      return;
    }

    const newItem: GalleryItem = {
      id: editingGalleryId || `${form.category}-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      image: form.image.trim(),
      description: form.description.trim(),
      featured: form.featured,
    };

    const content = await loadPublishedContent();
    const nextGallery = editingGalleryId
      ? content.gallery.map((item) => item.id === editingGalleryId ? newItem : item)
      : [...content.gallery, newItem];
    saveCustomGalleryItems(nextGallery.filter((item) => !defaultGalleryItems.some((defaultItem) => defaultItem.id === item.id)));
    const isPublished = await savePublishedContent({ ...content, packages, services, gallery: nextGallery, branches: content.branches });
    setItems([...defaultGalleryItems, ...nextGallery]);
    setForm(initialForm);
    setEditingGalleryId(null);
    setMessage(isPublished ? (editingGalleryId ? 'Gallery photo updated on the public website.' : 'New gallery item added and published.') : 'Could not publish the photo. Check your admin session and Redis settings.');
  };

  const editGalleryItem = (item: GalleryItem) => {
    setEditingGalleryId(item.id);
    setForm({ title: item.title, category: item.category, image: item.image, description: item.description || '', featured: Boolean(item.featured) });
    setMessage('Edit the selected gallery photo, then save it.');
  };

  const removeItem = async (id: string) => {
    const nextItems = getCustomGalleryItems().filter((item) => item.id !== id);
    saveCustomGalleryItems(nextItems);
    const content = await loadPublishedContent();
    const isPublished = await savePublishedContent({ ...content, packages, services, gallery: content.gallery.filter((item) => item.id !== id), branches: content.branches });
    setItems([...defaultGalleryItems, ...content.gallery.filter((item) => item.id !== id)]);
    if (editingGalleryId === id) { setEditingGalleryId(null); setForm(initialForm); }
    setMessage(isPublished ? 'Item removed from the public gallery.' : 'The item was removed in this browser only. Confirm admin login and configure Upstash Redis to publish the change.');
  };

  const logout = () => {
    clearBackendToken();
    setAdminLoggedIn(false);
    void fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
  };

  const saveContent = async () => {
    const validPackages = packages.filter((item) => item.name.trim() && item.price.trim());
    const validServices = services.filter((item) => item.title.trim() && item.description.trim());
    const currentContent = await loadPublishedContent();
    const content = {
      packages: validPackages.map((item) => ({ ...item, name: item.name.trim(), price: item.price.trim(), items: item.items.filter(Boolean) })),
      services: validServices.map((item) => ({ ...item, title: item.title.trim(), description: item.description.trim(), deliverables: item.deliverables.trim(), active: item.active !== false })),
      gallery: currentContent.gallery,
      branches,
      bannerImage: bannerImage || currentContent.bannerImage || '/images/Prewedding (21).jpg',
      offerPopup,
      settings: websiteSettings,
    };
    const isPublished = await savePublishedContent(content);
    setPackages(content.packages);
    setServices(content.services);
    setMessage(isPublished ? 'Packages and services published successfully.' : 'Saved in this browser only. Confirm admin login and configure Upstash Redis to publish changes for everyone.');
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    setIsBannerUploading(true);
    setMessage('Uploading studio banner image...');
    try {
      const response = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${getBackendToken() || ''}` }, body: data });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setMessage(result.error || 'Studio banner upload failed.');
        return;
      }
      setBannerImage(result.url);
      setMessage('Banner uploaded. Select Save banner to publish it.');
    } catch {
      setMessage('Studio banner upload failed. Check your connection and try again.');
    } finally {
      setIsBannerUploading(false);
      input.value = '';
    }
  };

  const handleServiceImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    setServiceUploadIndex(index);
    setMessage('Uploading service image...');
    try {
      const response = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${getBackendToken() || ''}` }, body: data });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || 'Service image upload failed.');
      setServices((current) => current.map((service, itemIndex) => itemIndex === index ? { ...service, image: result.url } : service));
      setMessage('Service image uploaded. Save changes to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Service image upload failed.');
    } finally {
      setServiceUploadIndex(null);
      input.value = '';
    }
  };

  const handlePopupImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    setMessage('Uploading popup image...');
    try {
      const response = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${getBackendToken() || ''}` }, body: data });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || 'Popup image upload failed.');
      setOfferPopup((current) => ({ ...current, image: result.url || '' }));
      setMessage('Popup image uploaded. Save changes to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Popup image upload failed.');
    } finally {
      input.value = '';
    }
  };

  const saveBanner = async () => {
    if (!bannerImage) {
      setMessage('Upload a banner image before saving.');
      return;
    }

    setIsBannerSaving(true);
    setMessage('Saving studio banner...');
    try {
      const currentContent = await loadPublishedContent();
      const isPublished = await savePublishedContent({ ...currentContent, bannerImage });
      setMessage(isPublished ? 'Studio banner saved and published.' : 'Banner saved in this browser only. Confirm admin login and configure Upstash Redis to publish changes for everyone.');
    } catch {
      setMessage('Studio banner could not be saved. Check your connection and try again.');
    } finally {
      setIsBannerSaving(false);
    }
  };

  const handleBranchUpload = async (event: React.ChangeEvent<HTMLInputElement>, branchId: string, branchName: string) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    setIsBranchesSaving(true);
    setBranchMessage(`Uploading the ${branchName} photo...`);
    try {
      const response = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${getBackendToken() || ''}` }, body: data });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setBranchMessage(result.error || `${branchName} photo upload failed.`);
        return;
      }
      const updatedBranches = branches.map((entry) => entry.id === branchId ? { ...entry, image: result.url || '' } : entry);
      setBranches(updatedBranches);
      setBranchMessage(`Publishing the ${branchName} photo to the About page...`);
      const currentContent = await loadPublishedContent();
      const isPublished = await savePublishedContent({ ...currentContent, branches: updatedBranches });
      setBranchMessage(isPublished
        ? `${branchName} photo is saved and published in its branch card on the About page.`
        : `${branchName} photo uploaded, but publishing failed. Confirm the Upstash Redis settings in Vercel and try again.`);
    } catch {
      setBranchMessage(`${branchName} photo upload failed. Check your connection and try again.`);
    } finally {
      setIsBranchesSaving(false);
      input.value = '';
    }
  };

  const saveBranchImages = async () => {
    setIsBranchesSaving(true);
    setBranchMessage('Saving studio branch images...');
    try {
      const currentContent = await loadPublishedContent();
      const isPublished = await savePublishedContent({ ...currentContent, branches });
      setBranchMessage(isPublished ? 'Branch details saved and published.' : 'Branch details could not be published. Confirm admin login and configure Upstash Redis.');
    } catch {
      setBranchMessage('Studio branch images could not be saved. Check your connection and try again.');
    } finally {
      setIsBranchesSaving(false);
    }
  };

  const restoreContent = async () => {
    const isPublished = await resetPublishedContent();
    setPackages(defaultPackages);
    setServices(defaultServices);
    setBannerImage('');
    setOfferPopup(defaultOfferPopup);
    setWebsiteSettings(defaultWebsiteSettings);
    setMessage(isPublished ? 'Packages and services restored for everyone.' : 'Restored in this browser only. Confirm admin login and configure Upstash Redis to publish changes for everyone.');
  };

  if (!isReady) {
    return <div className="page-shell"><div className="page-content"><p>Loading admin panel...</p></div></div>;
  }

  return (
    <div className="page-shell admin-shell">
      <div className="page-header admin-header-row">
        <div>
          <div className="page-actions page-actions-top">
            <Link href="/" className="page-back back-icon" aria-label="Back to home" title="Back to home"><span aria-hidden="true">←</span></Link>
          </div>
          <p className="eyebrow">Private dashboard</p>
          <h1>Admin Panel</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="page-content admin-panel">
        <section className="admin-card analytics-card" aria-labelledby="analytics-heading">
          <div>
            <p className="eyebrow">Website traffic</p>
            <h2 id="analytics-heading">Website visits</h2>
            <p className="form-note">Refreshes and page changes in the same active visit are counted once. A new visit is counted after 30 minutes without activity. Visit counts start fresh; older page-view totals used a different measure.</p>
          </div>
          {analytics ? (
            <>
              <div className="analytics-headline">
                <strong className="analytics-total">{analytics.totalVisits.toLocaleString()}</strong>
                <span>Total visits</span>
              </div>
              <div className="analytics-day-list" aria-label="Daily website visits for the last 7 days">
                {analytics.dailyVisits.slice(-7).map((day) => (
                  <div className="analytics-day" key={day.date}>
                    <strong>{day.visits.toLocaleString()}</strong>
                    <span>{new Date(`${day.date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="form-status" role="status">{analyticsError || 'Loading website traffic...'}</p>}
        </section>

        <section className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <h2>Offers &amp; promotions</h2>
          <p>Create and publish homepage offers, upload promotional images, set dates, and copy shareable offer links.</p>
          <div className="admin-actions">
            <Link href="/studio/offers" className="submit-btn">Manage Offers</Link>
            <Link href="/admin/bookings" className="btn btn-secondary">Manage Bookings</Link>
          </div>
        </section>
        <div className="admin-layout">
          <section className="admin-card">
            <h2>Add a new photo</h2>
            <div className="admin-form grid-form">
              <label>
                Title
                <input
                  className="field"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  placeholder="Example: Sunset Couple Session"
                />
              </label>

              <label>
                Category
                <input
                  className="field"
                  list="gallery-category-options"
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  placeholder="Choose or enter a category"
                />
                <datalist id="gallery-category-options">{[...new Set([...galleryCategories.filter((item) => item !== 'all'), ...items.map((item) => item.category)])].map((category) => <option key={category} value={category} />)}</datalist>
              </label>

              <label>
                Image file
                <div className="upload-row">
                  <button
                    type="button"
                    className="btn btn-secondary upload-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileUpload}
                  />
                </div>
              </label>

              <label>
                Description
                <textarea
                  className="field"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  placeholder="Add a short story or caption for this photo"
                />
              </label>

              <label className="offer-active-toggle"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Feature this photograph</label>

              <div className="admin-actions">
                <button type="button" className="submit-btn" onClick={saveItem}>
                  {editingGalleryId ? 'Update photo' : 'Save photo'}
                </button>
                {editingGalleryId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingGalleryId(null); setForm(initialForm); setMessage('Photo edit cancelled.'); }}>Cancel edit</button>}
                <Link href="/gallery" className="page-back">
                  View gallery
                </Link>
              </div>

              {message ? <p className="form-status">{message}</p> : null}
            </div>
          </section>

          <section className="admin-card">
            <h2>Live gallery items</h2>
            <div className="admin-item-list">
              {customItems.length === 0 ? (
                <p className="form-note">No custom items yet. Add your first image to make it visible on the site.</p>
              ) : (
                customItems.map((item) => (
                  <div key={item.id} className="admin-item-card">
                    <div className="admin-thumb" style={{ backgroundImage: `url("${encodeURI(item.image)}")` }} />
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description || 'New gallery moment added by admin.'}</p>
                      <span className="admin-tag">{item.category}</span>
                      {item.featured && <span className="offer-admin-featured">Featured photo</span>}
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={() => editGalleryItem(item)}>Edit</button>
                    <button type="button" className="remove-btn" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="admin-card admin-content-editor">
            <div className="admin-card-heading">
              <div>
                <h2>Packages and services</h2>
                <p className="form-note">Edit the text shown on the public Packages and Our Services pages.</p>
              </div>
              <div className="admin-actions">
                <button type="button" className="btn btn-secondary" onClick={restoreContent}>Restore defaults</button>
                <button type="button" className="submit-btn" onClick={saveContent}>Save changes</button>
              </div>
            </div>

            <h3 className="admin-section-title">Packages</h3>
            <div className="content-editor-list">
              {packages.map((item, index) => (
                <div className="content-editor-item" key={`package-${index}`}>
                  <div className="grid-form two-column-form">
                    <label>Package name<input className="field" value={item.name} onChange={(event) => setPackages((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, name: event.target.value } : entry))} /></label>
                    <label>Price<input className="field" value={item.price} onChange={(event) => setPackages((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, price: event.target.value } : entry))} /></label>
                  </div>
                  <label>What is included<textarea className="field" rows={4} value={item.items.join('\n')} onChange={(event) => setPackages((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, items: event.target.value.split('\n') } : entry))} /></label>
                </div>
              ))}
            </div>

            <h3 className="admin-section-title">Services</h3>
            <div className="content-editor-list">
              {services.map((item, index) => (
                <div className="content-editor-item" key={`service-${index}`}>
                  <label>Service title<input className="field" value={item.title} onChange={(event) => setServices((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry))} /></label>
                  <label>Description<textarea className="field" rows={4} value={item.description} onChange={(event) => setServices((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry))} /></label>
                  <label>What the client receives<textarea className="field" rows={3} value={item.deliverables} onChange={(event) => setServices((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, deliverables: event.target.value } : entry))} /></label>
                  <div className="grid-form two-column-form">
                    <label>Service price (optional)<input className="field" value={item.price || ''} onChange={(event) => setServices((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, price: event.target.value } : entry))} placeholder="Contact for pricing" /></label>
                    <label>Service photo<input className="field" type="file" accept="image/*" disabled={serviceUploadIndex === index} onChange={(event) => void handleServiceImageUpload(event, index)} /></label>
                  </div>
                  {item.image && <img className="branch-admin-preview" src={item.image} alt={`${item.title} preview`} />}
                  <label className="offer-active-toggle"><input type="checkbox" checked={item.active !== false} onChange={(event) => setServices((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, active: event.target.checked } : entry))} /> Show this service on the public website</label>
                  <button type="button" className="btn btn-secondary" onClick={() => setServices((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                    Remove service
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="submit-btn"
              onClick={() => setServices((current) => [...current, { title: 'New Service', description: '', deliverables: '', active: true }])}
            >
              + Add another service
            </button>

            <h3 className="admin-section-title">Homepage banner image</h3>
            <div className="content-editor-item">
              {bannerImage ? (
                <img className="banner-preview" src={bannerImage} alt="Current homepage banner preview" />
              ) : (
                <p className="form-note">No homepage banner selected yet.</p>
              )}
              <div className="upload-row">
                <button type="button" className="btn btn-secondary upload-button" onClick={() => document.getElementById('banner-upload')?.click()} disabled={isBannerUploading || isBannerSaving}>
                  {isBannerUploading ? 'Uploading...' : 'Upload homepage banner'}
                </button>
                <input id="banner-upload" type="file" accept="image/*" hidden onChange={handleBannerUpload} />
                <button type="button" className="submit-btn" onClick={saveBanner} disabled={isBannerUploading || isBannerSaving}>
                  {isBannerSaving ? 'Saving...' : 'Save banner'}
                </button>
              </div>
              {message ? <p className="form-status" role="status">{message}</p> : null}
            </div>

            <h3 className="admin-section-title">Homepage offer popup</h3>
            <div className="content-editor-item">
              <label className="offer-active-toggle"><input type="checkbox" checked={offerPopup.enabled} onChange={(event) => setOfferPopup((current) => ({ ...current, enabled: event.target.checked }))} /> Show promotional popup to visitors</label>
              <label>Popup heading<input className="field" maxLength={120} value={offerPopup.title} onChange={(event) => setOfferPopup((current) => ({ ...current, title: event.target.value }))} /></label>
              <label>Popup message<textarea className="field" rows={3} maxLength={500} value={offerPopup.description} onChange={(event) => setOfferPopup((current) => ({ ...current, description: event.target.value }))} /></label>
              {offerPopup.image && <img className="offer-upload-preview" src={offerPopup.image} alt="Offer popup preview" />}
              <label>Popup image<input className="field" type="file" accept="image/*" onChange={(event) => void handlePopupImageUpload(event)} /></label>
              <p className="form-note">Save changes above to publish popup text, visibility, and image.</p>
            </div>

            <h3 className="admin-section-title">Contact details and social links</h3>
            <div className="content-editor-item grid-form two-column-form">
              <label>Phone number<input className="field" value={websiteSettings.contactPhone} onChange={(event) => setWebsiteSettings((current) => ({ ...current, contactPhone: event.target.value }))} /></label>
              <label>Contact email<input className="field" type="email" value={websiteSettings.contactEmail} onChange={(event) => setWebsiteSettings((current) => ({ ...current, contactEmail: event.target.value }))} /></label>
              <label>WhatsApp number (country code + number)<input className="field" value={websiteSettings.whatsappNumber} onChange={(event) => setWebsiteSettings((current) => ({ ...current, whatsappNumber: event.target.value.replace(/\D/g, '') }))} /></label>
              <label>Facebook URL<input className="field" type="url" value={websiteSettings.socialLinks.facebook} onChange={(event) => setWebsiteSettings((current) => ({ ...current, socialLinks: { ...current.socialLinks, facebook: event.target.value } }))} /></label>
              <label>Instagram URL<input className="field" type="url" value={websiteSettings.socialLinks.instagram} onChange={(event) => setWebsiteSettings((current) => ({ ...current, socialLinks: { ...current.socialLinks, instagram: event.target.value } }))} /></label>
              <label>YouTube URL<input className="field" type="url" value={websiteSettings.socialLinks.youtube} onChange={(event) => setWebsiteSettings((current) => ({ ...current, socialLinks: { ...current.socialLinks, youtube: event.target.value } }))} /></label>
              <label>LinkedIn URL<input className="field" type="url" value={websiteSettings.socialLinks.linkedin} onChange={(event) => setWebsiteSettings((current) => ({ ...current, socialLinks: { ...current.socialLinks, linkedin: event.target.value } }))} /></label>
            </div>

            <h3 className="admin-section-title">Homepage testimonials</h3>
            <div className="content-editor-list">
              {websiteSettings.testimonials.map((testimonial, index) => <div className="content-editor-item" key={`testimonial-${index}`}>
                <label>Client quote<textarea className="field" rows={3} value={testimonial.quote} onChange={(event) => setWebsiteSettings((current) => ({ ...current, testimonials: current.testimonials.map((item, itemIndex) => itemIndex === index ? { ...item, quote: event.target.value } : item) }))} /></label>
                <div className="grid-form two-column-form"><label>Client name<input className="field" value={testimonial.name} onChange={(event) => setWebsiteSettings((current) => ({ ...current, testimonials: current.testimonials.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} /></label><label>Client type<input className="field" value={testimonial.role} onChange={(event) => setWebsiteSettings((current) => ({ ...current, testimonials: current.testimonials.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item) }))} /></label></div>
                <button type="button" className="btn btn-secondary" onClick={() => setWebsiteSettings((current) => ({ ...current, testimonials: current.testimonials.filter((_, itemIndex) => itemIndex !== index) }))}>Remove testimonial</button>
              </div>)}
            </div>
            <button type="button" className="submit-btn" onClick={() => setWebsiteSettings((current) => ({ ...current, testimonials: [...current.testimonials, { quote: '', name: '', role: '' }] }))}>+ Add testimonial</button>
            <p className="form-note">Save changes above to publish contact details, social links, and testimonials.</p>

            <h3 className="admin-section-title">Studio branch banner images</h3>
            <p className="form-note">Each uploaded photo is published automatically to its matching branch card on the About page. Save below after editing branch names, addresses, links, or descriptions.</p>
            <div className="admin-actions">
              <button type="button" className="submit-btn" onClick={saveBranchImages} disabled={isBranchesSaving}>
                {isBranchesSaving ? 'Saving branch details...' : 'Save branch details'}
              </button>
            </div>
            {branchMessage ? <p className="form-status" role="status">{branchMessage}</p> : null}
            <div className="content-editor-list">
              {branches.map((branch, index) => (
                <div className="content-editor-item" key={branch.id}>
                  <label>Branch name<input className="field" value={branch.name} onChange={(event) => setBranches((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, name: event.target.value } : entry))} /></label>
                  <label>Address<input className="field" value={branch.address} onChange={(event) => setBranches((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, address: event.target.value } : entry))} /></label>
                  <label>Location link<input className="field" value={branch.locationUrl} onChange={(event) => setBranches((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, locationUrl: event.target.value } : entry))} /></label>
                  <label>Description<textarea className="field" rows={3} value={branch.description} onChange={(event) => setBranches((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry))} /></label>
                  {branch.image ? <img className="branch-admin-preview" src={branch.image} alt={`${branch.name} banner preview`} /> : <p className="form-note">No branch image selected.</p>}
                  <div className="upload-row">
                    <button type="button" className="btn btn-secondary upload-button" onClick={() => document.getElementById(`branch-upload-${branch.id}`)?.click()} disabled={isBranchesSaving}>
                      {isBranchesSaving ? 'Publishing image...' : `Upload ${branch.name} photo`}
                    </button>
                    <input id={`branch-upload-${branch.id}`} type="file" accept="image/*" hidden onChange={(event) => handleBranchUpload(event, branch.id, branch.name)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
