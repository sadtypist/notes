# Deployment Guide

Since Netlify credits can run out, here are two excellent free alternatives to host **EaseNotes**.

## Option 1: Vercel (Recommended)
Vercel is very similar to Netlify but often faster and has a generous free tier.

1.  **Sign Up**: Go to [vercel.com/signup](https://vercel.com/signup) and sign up with **GitHub**.
2.  **Import Project**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Find the `notes` repository in the list and click **"Import"**.
3.  **Configure**:
    *   **Framework Preset**: It should auto-detect "Vite". If not, select it.
    *   **Root Directory**: `./` (default).
    *   **Build Command**: `vite build` (or `npm run build`).
    *   **Output Directory**: `dist`.
    *   **Environment Variables**:
        *   If you set up Supabase or Google Drive Client IDs in Netlify, copy them here (e.g., `VITE_SUPABASE_URL`, `VITE_GOOGLE_CLIENT_ID`).
4.  **Deploy**: Click **"Deploy"**.
    *   Wait ~1 minute. Your site will be live at `https://notes-app-xyz.vercel.app`!

## Option 2: GitHub Pages (Backup)
Host directly on GitHub.

1.  **Enable Pages**:
    *   Go to your GitHub Repository -> **Settings** -> **Pages**.
    *   Under **"Build and deployment"**, select **Source** -> **GitHub Actions**.
    *   (Note: configuring the standard "Deploy from Branch" requires pushing the `dist` folder, which is messier. We recommend Vercel for the easiest setup with React apps).
