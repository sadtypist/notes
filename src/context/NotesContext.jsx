import React, { createContext, useContext, useState, useEffect } from 'react';
/* eslint-disable react-refresh/only-export-components */

import { v4 as uuidv4 } from 'uuid';
import db from '../services/db';
import { useUser } from './UserContext';

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
    // Initial state empty, fetch on load
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useUser();
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Fetch notes on load or user change
    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const userId = isAuthenticated && user ? user.id : 'local-guest';
                const fetched = await db.getNotes(userId);
                setNotes(fetched);
            } catch (err) {
                console.error("Failed to fetch notes:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
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

    // Auto-cleanup functionality (Client side check)
    useEffect(() => {
        if (!loading && notes.length > 0) {
            const now = new Date();
            const threeDaysMs = 72 * 60 * 60 * 1000;

            notes.forEach(async (note) => {
                if (note.deletedAt) {
                    const deletedDate = new Date(note.deletedAt);
                    if (now - deletedDate > threeDaysMs) {
                        // FIX: calling deleteNote directly inside useEffect might refer to stale closure if not careful,
                        // but here deleteNote uses user from context which is stable-ish.
                        // Ideally we should use the function from the scope.
                        // To allow this to be correct, we just let it run.
                        const userId = isAuthenticated && user ? user.id : 'local-guest';
                        await db.deleteNote(note.id, userId);
                        setNotes(prev => prev.filter(n => n.id !== note.id));
                    }
                }
            });
        }
        // removing deleteNote from dep array intentionally to avoid loop, or we must memoize deleteNote
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
            updateAudioTranscript
        }}>
            {children}
        </NotesContext.Provider>
    );
};
