# Deploying EaseNotes

EaseNotes is a static React application built with Vite. It can be deployed to any static site hosting provider for free.

## Recommended Hosting: Netlify

Netlify is the easiest way to deploy this project.

1.  **Create a GitHub Repository**
    - Push your local code to a new GitHub repository.

2.  **Sign up for Netlify**
    - Go to [netlify.com](https://www.netlify.com) and sign up (you can use your GitHub account).

3.  **Deploy**
    - Click "Add new site" > "Import from existing project".
    - Select GitHub and choose your `notes` repository.
    - **Build Settings**: Netlify should detect these automatically:
        - **Build command**: `npm run build`
        - **Publish directory**: `dist`
    - Click **Deploy Site**.

## Alternative: Vercel

1.  Go to [vercel.com](https://vercel.com) and sign up.
2.  Import your GitHub repository.
3.  Vite defaults (`npm run build`, `dist` folder) will be auto-detected.
4.  Click **Deploy**.

## ⚠️ Important Note on Data

EaseNotes currently uses `localStorage` to save your data (Notes, Account, Sketches).

-   **Data is Local**: Your notes are stored **only on the device/browser** where you created them. If you open the deploy link on your phone, you won't see the notes you created on your laptop.
-   **Security**: Clearing your browser cache will delete all your notes.
-   **Storage Limits**: Browser storage is limited.
    -   **Cloud Sync**: This application supports **Supabase** for keeping your notes synced across devices.
    
## ☁️ Cloud Sync Setup (Supabase)

To enable cloud synchronization on your deployed site:

1.  **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a free project.
2.  **Database Setup**: The app automatically handles table creation if you have the correct permissions, or you can run the SQL snippets provided in the `db.js` comments if needed (usually not required for this simple setup).
3.  **Connect App**:
    -   Open your deployed EaseNotes app.
    -   Go to **Settings**.
    -   Enter your Supabase **Project URL** and **Anon Key**.
    -   Click **Save Configuration**.
4.  **Login**: Use the Login / Signup page to create an account in your connected Supabase project.

Now your notes will be stored in the cloud!
