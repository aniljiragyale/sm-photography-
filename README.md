# 📸 SM Photography

Welcome to **SM Photography** – a modern and responsive photography portfolio website designed to showcase stunning visual works.

## Run locally

From the repository root:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Deploy on Vercel

Leave the Vercel **Root Directory** at the repository root, use the detected Next.js framework, and deploy from the `main` branch. The build and install commands are already configured in `vercel.json`.

### Enable shared admin updates

The admin editor publishes package and service changes through `/api/content`. Connect an **Upstash Redis** integration to the Vercel project so these environment variables are available:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Connect a Vercel Blob store to the same project so Vercel provides:

- `BLOB_READ_WRITE_TOKEN`

After connecting both integrations, redeploy the `main` branch. Gallery and branch photos are uploaded to Blob, while their published records are stored in Redis.

### View website traffic

The site records a page view whenever a visitor opens a public page or moves to another page. The admin dashboard at `/admin` shows the all-time total and daily views for the last seven days. Local development stores the count in `data/site-analytics.json`; Vercel stores it in the connected Upstash Redis database, so configure both Upstash variables above and redeploy for production reporting.

### Manage offers

Sign in at `/studio-login`, then open **Manage Offers** in the studio dashboard (or visit `/studio/offers`). Offers are stored in the same Upstash Redis database; uploaded offer images use Vercel Blob. In local development, offer records fall back to `data/offers.json` and images to `public/uploads`.

The homepage's **Admin Login** and `/studio-login` both authenticate through the Next.js `/api/admin/login` route. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a long random `JWT_SECRET` as server-side environment variables in `.env.local` for development and in Vercel's project settings for deployment (Production, and Preview too if needed). Redeploy after changing them. These values must not use the `NEXT_PUBLIC_` prefix. A deployment without any of the three returns a configuration error instead of accepting a password. Change the sample admin password before production use. Admin saves use the signed login token. Offer records, site content, and page-view counts use Upstash Redis; local development falls back to files. Vercel requires Redis because serverless local files do not persist. Image uploads use Vercel Blob in production, so also configure `BLOB_READ_WRITE_TOKEN`.

## Project Structure

- **HTML** – Semantic markup for a well-structured layout
- **CSS** – Clean styling for responsiveness and visual appeal
- **JavaScript** – (Optional) for interactivity (if added)

## ✨ Features

- Fully responsive design for all screen sizes
- Elegant layout to highlight photography work
- Clean, minimalistic style
- Contact and social media integration (if added)

## 🛠️ Tech Stack

- HTML5
- CSS3
- (Optional) JavaScript
- Hosted on **Vercel**

## 📷 Preview

![Website Preview](relative/path/to/screenshot.png)

> Replace `relative/path/to/screenshot.png` with the actual path to your screenshot image in the repo

---

## 📬 Contact

Feel free to connect or collaborate!

- 📧 aniljiragyale213@gmail.com
- 💼 [LinkedIn](https://linkedin.com/in/aniljiragyale)

---

> Project maintained by [Anil Jiragyale](https://github.com/aniljiragyale)
