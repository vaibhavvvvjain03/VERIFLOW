# Veriflow — 24/7 Live Deployment & Judge Testing Guide

Veriflow has been configured as a **unified, production-ready web platform**. 
In production, a single Node/Express server serves:
1. The **React Frontend UI** (`/`, `/workspace`, `/demo-store`).
2. The **REST API** (`/api/plan`, `/api/runs`, `/api/preview`, `/api/validate-url`, `/api/demo/*`).
3. The **Headless Chromium Execution Engine** (Playwright automation with milestone screenshot frame streaming).
4. The **Evidence Artifacts** (`/artifacts/...`).

This guarantees that judges get **one single HTTPS link**, zero CORS conflicts, and full browser automation without needing local setup.

---

## Method 1: Railway (Fastest 24/7 Live Link — ~2 Minutes)

Railway provides native Docker container hosting with generous free trial credits and instant HTTPS domains.

### Step 1: Initialize Git and Push to GitHub (if not already pushed)
Run these commands in PowerShell or your terminal:
```powershell
git init
git add .
git commit -m "feat: unified production deployment with Playwright Dockerfile"
git branch -M main
git remote add origin https://github.com/<your-username>/veriflow.git
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **+ New Project** -> **Deploy from GitHub repo**.
3. Select your `veriflow` repository.
4. Railway will automatically detect the [`Dockerfile`](file:///c:/Users/Vaibhav%20A%20Jain/Documents/Projects%20Vaibhav/Veriflow/Dockerfile) and [`railway.json`](file:///c:/Users/Vaibhav%20A%20Jain/Documents/Projects%20Vaibhav/Veriflow/railway.json).
5. Once deployed, click on the service card -> **Settings** -> **Networking** -> **Generate Domain**.
6. You will get a permanent public link like: `https://veriflow-production.up.railway.app`.

---

## Method 2: Render (Free Tier 24/7 Live Link)

Render provides free Docker container hosting.

### Step 1: Push to GitHub (same as Step 1 above)

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select your `veriflow` repository.
4. Set the following settings:
   - **Name**: `veriflow`
   - **Language / Environment**: `Docker` (Render automatically uses [`Dockerfile`](file:///c:/Users/Vaibhav%20A%20Jain/Documents/Projects%20Vaibhav/Veriflow/Dockerfile))
   - **Region**: Nearest to you (e.g., Singapore or Frankfurt or US)
   - **Instance Type**: Free or Starter
5. Click **Create Web Service**.
6. Render builds the Playwright image and serves the app at: `https://veriflow.onrender.com`.

---

## Method 3: Instant Live Tunnel (Zero Cloud Setup, Immediate Link)

If you need a live public link **right now** for a judge evaluation session without waiting for cloud deployment:

1. **Build and start the unified server locally:**
   ```powershell
   npm run build
   npm start
   ```
2. **Expose it with an instant Cloudflare Tunnel (no account required):**
   Open a second terminal and run:
   ```powershell
   npx cloudflared tunnel --url http://localhost:3000
   ```
   *(Or using localtunnel: `npx localtunnel --port 3000`)*
3. Copy the generated `https://*.trycloudflare.com` link and share it with judges. It connects directly to your live Playwright engine!

---

## How Judges Test the Platform Safely

When judges open the live link:
1. **Homepage (`/`)**: Displays the hero section, Veri mascot introduction, and "Start Testing" CTA.
2. **Workspace (`/workspace`)**:
   - **Target URL**: Judges can test public websites (e.g., `https://www.wemakedevs.org`, `https://example.com`, `https://news.ycombinator.com`) or test the internal `/demo-store`.
   - **Voice / Natural Language Command Bar**: Dictate or type commands (e.g., *"Check if navigation bar is visible"*, *"Verify page title"*).
   - **Universal Command Chips**: Quick-select presets (`CMD-TITLE`, `CMD-HEADING`, `CMD-NAV`, etc.).
   - **Structured Plan Review**: Displays transparent step breakdown before execution.
   - **Real Execution**: When clicking **Confirm & Run Plan**, Playwright Chromium launches headlessly on the server, visits the URL, captures honest milestone screenshots, and streams frames to the live preview panel.
   - **Telemetry & Evidence**: View real-time step status, response status codes, console error audits, and click **Export Report** to download complete JSON & Markdown audit reports.
3. **Security Protection**:
   - SSRF protection actively blocks attempts to probe private IPs (`10.0.0.0/8`, `192.168.0.0/16`, `127.0.0.1`) and cloud metadata endpoints (`169.254.169.254`), keeping the cloud host 100% secure.
