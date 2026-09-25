'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  galleryCategories,
  ADMIN_PASSWORD,
  getAllGalleryItems,
  getCustomGalleryItems,
  defaultPackages,
  defaultServices,
  defaultBranches,
  defaultGalleryItems,
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
} from '@/lib/admin-data';

const initialForm = {
  title: '',
  category: 'wedding',
  image: '',
  description: '',
};

export default function AdminPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>(defaultPackages);
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [branches, setBranches] = useState<BranchItem[]>(defaultBranches);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace('/admin/login');
      return;
    }

    loadPublishedContent().then((content) => {
      setPackages(content.packages);
      setServices(content.services);
      setBranches(content.branches);
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
    const response = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-password': ADMIN_PASSWORD }, body: data });
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
      id: `${form.category}-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      image: form.image.trim(),
      description: form.description.trim(),
    };

    const nextItems = [...getCustomGalleryItems(), newItem];
    saveCustomGalleryItems(nextItems);
    const content = await loadPublishedContent();
    await savePublishedContent({ packages, services, gallery: [...content.gallery, newItem], branches: content.branches }, ADMIN_PASSWORD);
    setItems([...defaultGalleryItems, ...content.gallery, newItem]);
    setForm(initialForm);
    setMessage('New gallery item added successfully.');
  };

  const removeItem = async (id: string) => {
    const nextItems = getCustomGalleryItems().filter((item) => item.id !== id);
    saveCustomGalleryItems(nextItems);
    const content = await loadPublishedContent();
    await savePublishedContent({ packages, services, gallery: content.gallery.filter((item) => item.id !== id), branches: content.branches }, ADMIN_PASSWORD);
    setItems([...defaultGalleryItems, ...content.gallery.filter((item) => item.id !== id)]);
    setMessage('Item removed from the public gallery.');
  };

  const logout = () => {
    setAdminLoggedIn(false);
    router.push('/');
  };

  const saveContent = async () => {
    const validPackages = packages.filter((item) => item.name.trim() && item.price.trim());
    const validServices = services.filter((item) => item.title.trim() && item.description.trim());
    const currentContent = await loadPublishedContent();
    const content = {
      packages: validPackages.map((item) => ({ ...item, name: item.name.trim(), price: item.price.trim(), items: item.items.filter(Boolean) })),
      services: validServices.map((item) => ({ ...item, title: item.title.trim(), description: item.description.trim(), deliverables: item.deliverables.trim() })),
      gallery: currentContent.gallery,
      branches,
    };
    const isPublished = await savePublishedContent(content, ADMIN_PASSWORD);
    setPackages(content.packages);
    setServices(content.services);
    setMessage(isPublished ? 'Packages and services published successfully.' : 'Saved on this device. Connect Vercel shared storage to publish for everyone.');
  };

  const restoreContent = async () => {
    const isPublished = await resetPublishedContent(ADMIN_PASSWORD);
    setPackages(defaultPackages);
    setServices(defaultServices);
    setMessage(isPublished ? 'Packages and services restored for everyone.' : 'Restored on this device. Connect Vercel shared storage to publish for everyone.');
  };

  if (!isReady) {
    return <div className="page-shell"><div className="page-content"><p>Loading admin panel...</p></div></div>;
  }

  return (
    <div className="page-shell admin-shell">
      <div className="page-header admin-header-row">
        <div>
          <div className="page-actions page-actions-top">
            <Link href="/" className="page-back">← Back</Link>
          </div>
          <p className="eyebrow">Private dashboard</p>
          <h1>Admin Panel</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="page-content admin-panel">
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
                <select
                  className="field"
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                >
                  {galleryCategories.filter((item) => item !== 'all').map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
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

              <div className="admin-actions">
                <button type="button" className="submit-btn" onClick={saveItem}>
                  Save photo
                </button>
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
                    </div>
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
                </div>
              ))}
            </div>

            <h3 className="admin-section-title">Studio branches</h3>
            <div className="content-editor-list">
              {branches.map((branch, index) => (
                <div className="content-editor-item" key={branch.id}>
                  <label>Branch name<input className="field" value={branch.name} onChange={(event) => setBranches((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, name: event.target.value } : entry))} /></label>
                  <label>Address<input className="field" value={branch.address} onChange={(event) => setBranches((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, address: event.target.value } : entry))} /></label>
                  <label>Location link<input className="field" value={branch.locationUrl} onChange={(event) => setBranches((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, locationUrl: event.target.value } : entry))} /></label>
                  <label>Description<textarea className="field" rows={3} value={branch.description} onChange={(event) => setBranches((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry))} /></label>
                  <div className="upload-row">
                    <button type="button" className="btn btn-secondary upload-button" onClick={() => document.getElementById(`branch-upload-${branch.id}`)?.click()}>Upload branch photo</button>
                    <input id={`branch-upload-${branch.id}`} type="file" accept="image/*" hidden onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const data = new FormData();
                      data.append('file', file);
                      setMessage(`Uploading ${branch.name} photo...`);
                      const response = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-password': ADMIN_PASSWORD }, body: data });
                      const result = (await response.json()) as { url?: string; error?: string };
                      if (!response.ok || !result.url) { setMessage(result.error || 'Branch image upload failed.'); return; }
                      setBranches((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, image: result.url || '' } : entry));
                      setMessage('Branch photo uploaded. Save changes to publish it.');
                    }} />
                    {branch.image ? <span className="form-note">Photo ready to publish</span> : null}
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
