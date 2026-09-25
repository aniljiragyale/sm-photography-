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

Leave the Vercel **Root Directory** at the repository root, use the detected Next.js framework, and deploy from the `master` branch. The build and install commands are already configured in `vercel.json`.

### Enable shared admin updates

The admin editor publishes package and service changes through `/api/content`. Connect an **Upstash Redis** integration to the Vercel project so these environment variables are available:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Connect a Vercel Blob store to the same project so Vercel provides:

- `BLOB_READ_WRITE_TOKEN`

After connecting both integrations, redeploy the `master` branch. Gallery and branch photos are uploaded to Blob, while their published records are stored in Redis.

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
