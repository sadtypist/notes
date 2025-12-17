import { get, set, del } from 'idb-keyval'; // We might not have this, so I will write a simple IDB helper instead to avoid deps.

/*
 * FileSystemService handles interaction with the local file system
 * via the File System Access API.
 * It uses IndexedDB to persist the directory handle.
 */

const DB_NAME = 'EaseNotesDB';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'rootDirectory';

// Simple IDB Wrapper
const idb = {
    open: () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    get: async (key) => {
        const db = await idb.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    set: async (key, value) => {
        const db = await idb.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    del: async (key) => {
        const db = await idb.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};

export const fileSystemService = {
    directoryHandle: null,

    // Initialize: try to load handle from IDB
    init: async () => {
        try {
            const handle = await idb.get(HANDLE_KEY);
            if (handle) {
                fileSystemService.directoryHandle = handle;
                // We cannot verify permission immediately without user interaction usually,
                // but we check if we have it.
                return true; // Handle exists
            }
        } catch (e) {
            console.error("FS Init error", e);
        }
        return false;
    },

    // Connect: User picks folder
    connect: async () => {
        try {
            const handle = await window.showDirectoryPicker({
                mode: 'readwrite',
                id: 'ease-notes-root' // remebers default path
            });
            fileSystemService.directoryHandle = handle;
            await idb.set(HANDLE_KEY, handle);
            return handle.name;
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
            throw err;
        }
    },

    disconnect: async () => {
        fileSystemService.directoryHandle = null;
        await idb.del(HANDLE_KEY);
    },

    // Verify permission (must be called before read/write if state is unknown)
    verifyPermission: async (readWrite = true) => {
        if (!fileSystemService.directoryHandle) return false;
        const opts = { mode: readWrite ? 'readwrite' : 'read' };
        if ((await fileSystemService.directoryHandle.queryPermission(opts)) === 'granted') {
            return true;
        }
        if ((await fileSystemService.directoryHandle.requestPermission(opts)) === 'granted') {
            return true;
        }
        return false;
    },

    // Save a note as a JSON file
    saveNote: async (note) => {
        if (!fileSystemService.directoryHandle) return;
        try {
            // Create "notes" subdirectory
            const notesDir = await fileSystemService.directoryHandle.getDirectoryHandle('notes', { create: true });

            // File setup
            const fileName = `${note.id}.json`;
            const fileHandle = await notesDir.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(note, null, 2));
            await writable.close();
        } catch (err) {
            console.error("FS Save Note Error", err);
            throw err;
        }
    },

    deleteNote: async (noteId) => {
        if (!fileSystemService.directoryHandle) return;
        try {
            const notesDir = await fileSystemService.directoryHandle.getDirectoryHandle('notes', { create: false });
            await notesDir.removeEntry(`${noteId}.json`);
        } catch (err) {
            console.warn("FS Delete Note Error (might not exist)", err);
        }
    },

    // Save folders configuration
    saveFolders: async (folders) => {
        if (!fileSystemService.directoryHandle) return;
        try {
            const fileHandle = await fileSystemService.directoryHandle.getFileHandle('folders.json', { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(folders, null, 2));
            await writable.close();
        } catch (err) {
            console.error("FS Save Folders Error", err);
        }
    },

    // Load everything (Initial sync)
    loadAll: async () => {
        if (!fileSystemService.directoryHandle) return { notes: [], folders: [] };

        const notes = [];
        let folders = [];

        try {
            // Load Notes
            try {
                const notesDir = await fileSystemService.directoryHandle.getDirectoryHandle('notes');
                for await (const entry of notesDir.values()) {
                    if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                        const file = await entry.getFile();
                        const text = await file.text();
                        try {
                            notes.push(JSON.parse(text));
                        } catch (e) {
                            console.error("Error parsing note", entry.name, e);
                        }
                    }
                }
            } catch (e) {
                // 'notes' dir might not exist yet
            }

            // Load Folders
            try {
                const foldersHandle = await fileSystemService.directoryHandle.getFileHandle('folders.json');
                const file = await foldersHandle.getFile();
                const text = await file.text();
                folders = JSON.parse(text);
            } catch (e) {
                // folders.json might not exist
            }

        } catch (err) {
            console.error("FS Load All Error", err);
            throw err;
        }

        return { notes, folders };
    }
};
