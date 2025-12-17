import React, { createContext, useContext, useState, useEffect } from 'react';
/* eslint-disable react-refresh/only-export-components */

import { v4 as uuidv4 } from 'uuid';
import db from '../services/db';
import { useUser } from './UserContext';
import { fileSystemService } from '../services/FileSystemService';

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
    // Initial state empty, fetch on load
    const [notes, setNotes] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLocalSyncConnected, setIsLocalSyncConnected] = useState(false);

    // 1. Fetch notes and folders on load or user change
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const userId = isAuthenticated && user ? user.id : 'local-guest';

            // 1. Initialize File System Service (check for existing handle)
            const hasHandle = await fileSystemService.init();
            setIsLocalSyncConnected(hasHandle);

            // 2. Load Notes
            try {
                const fetchedNotes = await db.getNotes(userId);
                // If we found notes on disk via FS init (and we want to prioritize them or merge), logic would go here.
                // For now, we stick to db.getNotes which reads LocalStorage/Supabase.
                // TODO: Optional 'Load from Disk' button in settings could trigger a merge.
                setNotes(fetchedNotes);
            } catch (error) {
                console.error("Failed to fetch notes", error);
            }

            // 3. Load Folders
            try {
                const fetchedFolders = await db.getFolders(userId);
                if (fetchedFolders) {
                    setFolders(fetchedFolders);
                } else {
                    // Seed defaults if null (first run local)
                    const defaultFolders = [
                        { id: 'f-personal', name: 'Personal', color: '#3b82f6', bgColor: '#3b82f626', userId },
                        { id: 'f-work', name: 'Work', color: '#10b981', bgColor: '#10b98126', userId },
                        { id: 'f-ideas', name: 'Ideas', color: '#f59e0b', bgColor: '#f59e0b26', userId }
                    ];
                    // Save defaults one by one or batch if db supported it. 
                    // db.saveFolder saves individual.
                    for (const f of defaultFolders) {
                        await db.saveFolder(f, userId);
                    }
                    setFolders(defaultFolders);
                }
            } catch (error) {
                console.error("Failed to fetch folders", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [isAuthenticated, user]);

    const addNote = async (note) => {
        const userId = isAuthenticated && user ? user.id : 'local-guest';

        // Ensure note has required fields if passed incompletely
        const noteToSave = {
            ...note,
            id: note.id || uuidv4(),
            title: note.title || 'Untitled Note',
            content: note.content || '',
            tags: note.tags || [],
            isPinned: note.isPinned || false,
            audioRecordings: note.audioRecordings || [],
            folderId: note.folderId || null // Ensure folderId is handled
        };

        const savedNote = await db.saveNote(noteToSave, userId);

        setNotes(prev => {
            const exists = prev.find(n => n.id === savedNote.id);
            if (exists) {
                return prev.map(n => n.id === savedNote.id ? savedNote : n);
            }
            return [savedNote, ...prev];
        });

        return savedNote.id;
    };

    const updateNote = async (id, updates) => {
        const note = notes.find(n => n.id === id);
        if (!note) return;
        const updated = { ...note, ...updates };
        await addNote(updated);
    };

    const deleteNote = async (id, permanent = false) => {
        const userId = isAuthenticated && user ? user.id : 'local-guest';

        if (permanent) {
            await db.deleteNote(id, userId);
            setNotes(prev => prev.filter(n => n.id !== id));
        } else {
            // Soft delete
            await db.softDeleteNote(id, userId);
            setNotes(prev => prev.map(n => n.id === id ? { ...n, deletedAt: new Date().toISOString(), isPinned: false } : n));
        }
    };

    const restoreNote = async (id) => {
        const userId = isAuthenticated && user ? user.id : 'local-guest';
        await db.restoreNote(id, userId);
        setNotes(prev => prev.map(n => n.id === id ? { ...n, deletedAt: null } : n));
    };

    const emptyTrash = async () => {
        const userId = isAuthenticated && user ? user.id : 'local-guest';
        await db.emptyTrash(userId);
        setNotes(prev => prev.filter(n => !n.deletedAt));
    };

    const getNote = (id) => {
        return notes.find(n => n.id === id);
    };

    const addAudioToNote = async (noteId, audioData) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const audioId = uuidv4();
        const updatedNote = {
            ...note,
            audioRecordings: [
                ...(note.audioRecordings || []),
                { id: audioId, ...audioData, createdAt: new Date().toISOString() }
            ],
            // updatedAt will be handled by saveNote logic if passed, or we set it here
            updatedAt: new Date().toISOString()
        };

        await addNote(updatedNote);
    };

    const deleteAudioFromNote = async (noteId, audioId) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const updatedNote = {
            ...note,
            audioRecordings: (note.audioRecordings || []).filter(a => a.id !== audioId),
            updatedAt: new Date().toISOString()
        };
        await addNote(updatedNote);
    };

    const updateAudioTranscript = async (noteId, audioId, transcript) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const updatedNote = {
            ...note,
            audioRecordings: (note.audioRecordings || []).map(audio =>
                audio.id === audioId
                    ? { ...audio, transcript }
                    : audio
            ),
            updatedAt: new Date().toISOString()
        };
        await addNote(updatedNote);
    };

    const togglePin = async (id) => {
        const note = notes.find(n => n.id === id);
        if (!note) return;

        const updatedNote = { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() };
        await addNote(updatedNote);
    };

    const toggleFavorite = async (id) => {
        const note = notes.find(n => n.id === id);
        if (!note) return;

        const updatedNote = { ...note, isFavorite: !note.isFavorite, updatedAt: new Date().toISOString() };
        await addNote(updatedNote);
    };

    // --- Folders Logic ---
    const addFolder = async (name, color, categoryName, categoryColor) => {
        const userId = isAuthenticated && user ? user.id : 'local-guest';
        const newFolder = {
            id: uuidv4(),
            name,
            color,
            bgColor: `${color}26`, // 15% opacity hex roughly
            categoryName: categoryName || name, // Fallback to folder name
            categoryColor: categoryColor || color // Fallback to folder color
        };
        await db.saveFolder(newFolder, userId);
        setFolders(prev => [...prev, newFolder]);
        return newFolder;
    };

    const deleteFolder = async (id) => {
        const userId = isAuthenticated && user ? user.id : 'local-guest';
        await db.deleteFolder(id, userId);
        setFolders(prev => prev.filter(f => f.id !== id));
        // Also update notes? Optionally clear folderId from notes.
        // For now, we'll leave notes orphan or they just won't show in the folder.
        // Better UX would be to move them to "All Notes" (which is null folderId).
    };

    // Auto-cleanup functionality (Client side check)
    useEffect(() => {
        if (!loading && notes.length > 0) {
            const now = new Date();
            const threeDaysMs = 72 * 60 * 60 * 1000;

            notes.forEach(async (note) => {
                if (note.deletedAt) {
                    const deletedDate = new Date(note.deletedAt);
                    if (now - deletedDate > threeDaysMs) {
                        const userId = isAuthenticated && user ? user.id : 'local-guest';
                        await db.deleteNote(note.id, userId);
                        setNotes(prev => prev.filter(n => n.id !== note.id));
                    }
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, notes]);

    // Filter notes
    const activeNotes = notes.filter(n => !n.deletedAt);
    const trashNotes = notes.filter(n => n.deletedAt).sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    const filteredNotes = activeNotes
        .filter(note => {
            const query = searchQuery.toLowerCase();
            return (
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query)
            );
        })
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

    return (
        <NotesContext.Provider value={{
            notes,
            folders,
            filteredNotes,
            trashNotes,
            searchQuery,
            setSearchQuery,
            loading,
            addNote,
            updateNote,
            deleteNote,
            restoreNote,
            emptyTrash,
            getNote,
            togglePin,
            toggleFavorite,
            addAudioToNote,
            deleteAudioFromNote,
            updateAudioTranscript,
            addFolder,
            deleteFolder,
            isLocalSyncConnected
        }}>
            {children}
        </NotesContext.Provider>
    );
};
