# EaseNotes 📝

**EaseNotes** is a powerful, beautiful, and offline-first note-taking application built with React and Vite. It combines rich text part-editing, voice memos, digital sketching, and seamless cloud backups into a premium user experience.

![EaseNotes Preview](https://via.placeholder.com/800x400?text=EaseNotes+App+Preview)

## ✨ Key Features

- **Rich Text Editor**: Format your thoughts with bold, italics, custom fonts, and more.
- **Smart Templates**: Jumpstart your writing with templates for Meetings, Journals, To-Do lists, and infinite Canvases.
- **Voice Memos**: Record audio notes directly within your documents.
- **Digital Sketching**: Visual thinker? Draw and sketch ideas directly on an infinite canvas.
- **Organization**: Keep things tidy with Folders, Pinned Notes, and Favorites. Includes a Trash Bin for safe deletion.
- **Cloud Sync & Backup**: 
  - **Google Drive**: Securely backup and restore your notes to your personal Google Drive.
  - **Supabase**: Real-time sync capabilities (configurable).
- **Privacy First**: All data is stored locally in your browser by default. You own your data.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Modern CSS3 (Variables, Glassmorphism design)
- **Icons**: React Icons (Feather, Bootstrap Icons)
- **State Management**: React Context API
- **Routing**: React Router v6

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sadtypist/notes.git
   cd notes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`.

## ⚙️ Configuration

### Environment Variables
To enable Google Drive integration, create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 📦 Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist/` directory, ready to be deployed to Vercel, Netlify, or any static host.

## 📄 License

This project is licensed under the MIT License.
