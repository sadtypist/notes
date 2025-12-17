import { getSupabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { fileSystemService } from './FileSystemService';

const LOCAL_STORAGE_KEY = 'easeNotes_notes';

// --- Local Storage Adapter ---

const localAdapter = {
    getNotes: async () => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    },

    saveNote: async (note) => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let notes = saved ? JSON.parse(saved) : [];
        const existingIndex = notes.findIndex(n => n.id === note.id);

        let finalNote;
        if (existingIndex >= 0) {
            finalNote = { ...notes[existingIndex], ...note, updatedAt: new Date().toISOString() };
            notes[existingIndex] = finalNote;
        } else {
            finalNote = { ...note, id: note.id || uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            notes.push(finalNote);
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));

        // FS Sync
        if (fileSystemService.directoryHandle) {
            fileSystemService.saveNote(finalNote).catch(err => console.error("FS Sync Error:", err));
        }

        return finalNote;
    },

    deleteNote: async (id) => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let notes = saved ? JSON.parse(saved) : [];
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));

        // FS Sync
        if (fileSystemService.directoryHandle) {
            fileSystemService.deleteNote(id).catch(err => console.error("FS Delete Error:", err));
        }
    },

    // Soft Delete (Move to Trash)
    softDeleteNote: async (id) => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let notes = saved ? JSON.parse(saved) : [];
        const noteIndex = notes.findIndex(n => n.id === id);

        if (noteIndex >= 0) {
            const updated = { ...notes[noteIndex], deletedAt: new Date().toISOString(), isPinned: false };
            notes[noteIndex] = updated;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));

            // FS Sync (Save the soft-deleted state)
            if (fileSystemService.directoryHandle) {
                fileSystemService.saveNote(updated).catch(err => console.error("FS Soft Delete Error:", err));
            }
        }
    },

    restoreNote: async (id) => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let notes = saved ? JSON.parse(saved) : [];
        const noteIndex = notes.findIndex(n => n.id === id);

        if (noteIndex >= 0) {
            const rest = { ...notes[noteIndex] };
            delete rest.deletedAt;
            notes[noteIndex] = rest;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));

            // FS Sync
            if (fileSystemService.directoryHandle) {
                fileSystemService.saveNote(rest).catch(err => console.error("FS Restore Error:", err));
            }
        }
    },

    emptyTrash: async () => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let notes = saved ? JSON.parse(saved) : [];

        // Find notes to be deleted to remove from FS
        const toDelete = notes.filter(n => n.deletedAt);

        // Keep only active notes
        notes = notes.filter(n => !n.deletedAt);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));

        // FS Sync
        if (fileSystemService.directoryHandle) {
            toDelete.forEach(n => fileSystemService.deleteNote(n.id).catch(e => console.error(e)));
        }
    },

    // --- Folders ---
    getFolders: async () => {
        const saved = localStorage.getItem('easeNotes_folders');
        // Return null if not set, so context can seed defaults
        return saved ? JSON.parse(saved) : null;
    },

    saveFolder: async (folder) => {
        const saved = localStorage.getItem('easeNotes_folders');
        let folders = saved ? JSON.parse(saved) : [];
        const index = folders.findIndex(f => f.id === folder.id);

        if (index >= 0) {
            folders[index] = folder;
        } else {
            folders.push(folder);
        }
        localStorage.setItem('easeNotes_folders', JSON.stringify(folders));

        // FS Sync
        if (fileSystemService.directoryHandle) {
            fileSystemService.saveFolders(folders).catch(err => console.error("FS Create Folder Error:", err));
        }

        return folder;
    },

    deleteFolder: async (id) => {
        const saved = localStorage.getItem('easeNotes_folders');
        if (!saved) return;
        let folders = JSON.parse(saved);
        folders = folders.filter(f => f.id !== id);
        localStorage.setItem('easeNotes_folders', JSON.stringify(folders));

        // FS Sync
        if (fileSystemService.directoryHandle) {
            fileSystemService.saveFolders(folders).catch(err => console.error("FS Delete Folder Error:", err));
        }
    }
};

// --- Supabase Adapter ---

const supabaseAdapter = {
    getNotes: async (userId) => {
        const supabase = getSupabase();
        if (!supabase || !userId) return [];

        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Supabase fetch error:', error);
            throw error;
        }
        // Map snake_case to camelCase for frontend consistency
        return data.map(n => ({
            ...n,
            isPinned: n.is_pinned,
            isFavorite: n.is_favorite,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
            // local adapter uses 'tags', supabase 'tags' is jsonb or array, which maps directly usually
        }));
    },

    saveNote: async (note, userId) => {
        const supabase = getSupabase();
        if (!supabase || !userId) return null;

        const payload = {
            id: note.id || uuidv4(),
            title: note.title,
            content: note.content,
            tags: note.tags || [], // Ensure array
            is_pinned: note.isPinned || false,
            is_favorite: note.isFavorite || false,
            user_id: userId,
            updated_at: new Date().toISOString()
        };

        // Handle new vs update
        if (!note.id) {
            payload.created_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('notes')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;
        // Map back to camelCase for frontend
        return {
            ...data,
            isPinned: data.is_pinned,
            isFavorite: data.is_favorite,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    // We map softDelete to an update
    softDeleteNote: async (id, userId) => {
        const supabase = getSupabase();
        if (!supabase) return;

        await supabase
            .from('notes')
            .update({ deleted_at: new Date().toISOString(), is_pinned: false, is_favorite: false })
            .eq('id', id)
            .eq('user_id', userId);
    },

    restoreNote: async (id, userId) => {
        const supabase = getSupabase();
        if (!supabase) return;

        await supabase
            .from('notes')
            .update({ deleted_at: null })
            .eq('id', id)
            .eq('user_id', userId);
    },

    deleteNote: async (id, userId) => {
        const supabase = getSupabase();
        if (!supabase) return;

        await supabase.from('notes').delete().eq('id', id).eq('user_id', userId);
    },

    emptyTrash: async (userId) => {
        const supabase = getSupabase();
        if (!supabase) return;

        // Delete where deleted_at is not null
        await supabase.from('notes').delete().neq('deleted_at', null).eq('user_id', userId);
    },

    // --- Folders (Supabase) ---
    getFolders: async (userId) => {
        const supabase = getSupabase();
        if (!supabase || !userId) return [];

        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.warn('Supabase folders fetch check failed (table might not exist yet):', error.message);
            return null; // Fallback to defaults if table missing or error
        }

        // Map snake_case to camelCase
        return data.map(f => ({
            id: f.id,
            name: f.name,
            color: f.color_hex,
            // Calculate bgColor from color if not stored, or store it. 
            // Simplified: we'll compute bgColor on front end or store it.
            // Let's assume we store it as bg_color if possible, or derive it.
            bgColor: f.bg_color || `${f.color_hex}26`, // 15% opacity hex roughly
            categoryName: f.category_name || f.name,
            categoryColor: f.category_color || f.color_hex
        }));
    },

    saveFolder: async (folder, userId) => {
        const supabase = getSupabase();
        if (!supabase || !userId) return;

        const { error } = await supabase
            .from('folders')
            .upsert({
                id: folder.id,
                name: folder.name,
                color_hex: folder.color,
                bg_color: folder.bgColor,
                category_name: folder.categoryName,
                category_color: folder.categoryColor,
                user_id: userId
            });

        if (error) console.error('Error saving folder:', error);
        return folder;
    },

    deleteFolder: async (id, userId) => {
        const supabase = getSupabase();
        if (!supabase || !userId) return;

        await supabase.from('folders').delete().eq('id', id).eq('user_id', userId);
    }
};


// --- Service Facade ---

const db = {
    isCloudEnabled: () => !!getSupabase(),

    getNotes: async (userId) => {
        if (db.isCloudEnabled()) return supabaseAdapter.getNotes(userId);
        return localAdapter.getNotes();
    },

    saveNote: async (note, userId) => {
        if (db.isCloudEnabled()) return supabaseAdapter.saveNote(note, userId);
        return localAdapter.saveNote(note);
    },

    softDeleteNote: async (id, userId) => {
        if (db.isCloudEnabled()) return supabaseAdapter.softDeleteNote(id, userId);
        return localAdapter.softDeleteNote(id);
    },

    restoreNote: async (id, userId) => {
        if (db.isCloudEnabled()) return supabaseAdapter.restoreNote(id, userId);
        return localAdapter.restoreNote(id);
    },

    deleteNote: async (id, userId) => {
        if (db.isCloudEnabled()) return supabaseAdapter.deleteNote(id, userId);
        return localAdapter.deleteNote(id);
    },

    emptyTrash: async (userId) => {
        if (db.isCloudEnabled()) return supabaseAdapter.emptyTrash(userId);
        return localAdapter.emptyTrash();
    },

    getFolders: async (userId) => {
        if (db.isCloudEnabled()) return supabaseAdapter.getFolders(userId);
        return localAdapter.getFolders();
    },

    saveFolder: async (folder, userId) => {
        if (db.isCloudEnabled()) return supabaseAdapter.saveFolder(folder, userId);
        return localAdapter.saveFolder(folder);
    },

    deleteFolder: async (id, userId) => {
        if (db.isCloudEnabled()) return supabaseAdapter.deleteFolder(id, userId);
        return localAdapter.deleteFolder(id);
    }
};

export default db;
