import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import DeleteModal from '../components/DeleteModal';
import DrawingCanvas from '../components/DrawingCanvas';
import ToolbarButton from '../components/ToolbarButton'; // Imported
import { FiArrowLeft, FiBold, FiItalic, FiUnderline, FiTrash2, FiMic, FiPenTool } from 'react-icons/fi';
import { BsPin, BsPinFill, BsStar, BsStarFill } from 'react-icons/bs';
import { RiSubscript, RiSuperscript } from 'react-icons/ri';
import VoiceRecorder from '../components/VoiceRecorder';
import AudioPlayer from '../components/AudioPlayer';
import ExportDropdown from '../components/ExportDropdown';
import CategorySelector from '../components/CategorySelector';

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notes, updateNote, deleteNote, togglePin, toggleFavorite, addAudioToNote, deleteAudioFromNote, updateAudioTranscript } = useNotes();

    // Derived state for note
    const note = notes.find(n => n.id === id);

    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [initialContent, setInitialContent] = useState('');
    const [contentLoaded, setContentLoaded] = useState(false);

    const contentRef = useRef(null);
    const [showRecorder, setShowRecorder] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Initialize/Reset local state when note ID changes
    useEffect(() => {
        if (id) {
            // We use getNote just to check existence or we can rely on 'note' derived from 'notes'
            // Using 'note' from 'notes' context is reactive.
            if (note) {
                setTitle(note.title);
                setCategories(note.tags || []);
                setInitialContent(note.content);
                setContentLoaded(false); // Valid to reset this to trigger content injection
            } else if (!note) {
                // If notes are loaded but note not found, redirect.
                // Depending on loading state of notes, this might be premature.
                // Assuming notes are loaded relatively fast or we need a loading state check.
            }
        }
    }, [id, note]); // Depend on 'note' object reference

    // Apply content to contentEditable div after it's mounted
    useEffect(() => {
        if (contentRef.current && initialContent !== undefined && !contentLoaded) {
            contentRef.current.innerHTML = initialContent;
            setContentLoaded(true);
        }
        // ESLint might warn about setContentLoaded, but it's conditioned on !contentLoaded

    }, [initialContent, contentLoaded]);

    // Auto-save when categories change
    useEffect(() => {
        if (note && contentLoaded) {
            updateNote(note.id, { tags: categories });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories]);

    // Handle auto-saving content on blur or specialized interval could go here
    // For now we save on change of title and content blur
    const handleSave = () => {
        if (note && contentRef.current) {
            updateNote(note.id, {
                title,
                content: contentRef.current.innerHTML,
                tags: categories
            });
        }
    };

    const handleFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        contentRef.current.focus();
    };

    const handleDeleteClick = () => {
        setDeleteModalOpen(true);
    };

    const handleMoveToTrash = () => {
        deleteNote(note.id, false); // Soft delete
        setDeleteModalOpen(false);
        navigate('/');
    };

    const handleDeletePermanently = () => {
        deleteNote(note.id, true); // Hard delete
        setDeleteModalOpen(false);
        navigate('/');
    };

    const handleRecordingComplete = (audioData) => {
        addAudioToNote(note.id, audioData);
        setShowRecorder(false);
        // Note updates automatically via context
    };

    const handleDeleteAudio = (audioId) => {
        deleteAudioFromNote(note.id, audioId);
    };

    const handleTranscribe = (audioId, transcript) => {
        updateAudioTranscript(note.id, audioId, transcript);
    };

    const handleSaveCanvas = (imageData) => {
        if (contentRef.current) {
            const img = document.createElement('img');
            img.src = imageData;
            img.style.maxWidth = '100%';
            img.style.borderRadius = 'var(--radius-md)';
            img.style.boxShadow = 'var(--shadow-md)';
            img.style.margin = '1rem 0';

            contentRef.current.appendChild(img);
            contentRef.current.appendChild(document.createElement('div'));

            handleSave();
        }
        setShowCanvas(false);
    };

    if (!note) return null;

    return (
        <div className="container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Top Bar */}
            <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-bg-tertiary)' }}>
                <button onClick={() => { handleSave(); navigate('/'); }} className="btn btn-ghost">
                    <FiArrowLeft /> Back
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {note.updatedAt === note.createdAt ? 'Created ' : 'Edited '}
                    {new Date(note.updatedAt).toLocaleTimeString()}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        onClick={() => { toggleFavorite(note.id); }}
                        className="btn btn-ghost"
                        style={{ color: note.isFavorite ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
                        title={note.isFavorite ? 'Unfavorite' : 'Favorite'}
                    >
                        {note.isFavorite ? <BsStarFill /> : <BsStar />}
                    </button>
                    <button
                        onClick={() => { togglePin(note.id); }}
                        className="btn btn-ghost"
                        style={{ color: note.isPinned ? 'var(--color-accent-primary)' : 'var(--color-text-muted)' }}
                        title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                        {note.isPinned ? <BsPinFill /> : <BsPin />}
                    </button>
                    <ExportDropdown title={title} getContent={() => contentRef.current?.innerHTML || ''} />
                    <button onClick={handleDeleteClick} className="btn" style={{ color: 'var(--color-danger)' }}>
                        <FiTrash2 />
                    </button>
                </div>
            </div>

            {/* Title Input */}
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                placeholder="Note Title"
                style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    background: 'transparent',
                    border: 'none',
                    width: '100%',
                    padding: '1rem 0 0.5rem 0',
                    color: 'var(--color-text-primary)',
                    outline: 'none'
                }}
            />

            {/* Categories */}
            <div style={{ marginBottom: '1rem' }}>
                <CategorySelector
                    selectedCategories={categories}
                    onChange={(newCats) => { setCategories(newCats); }}
                    onBlur={handleSave}
                />
            </div>

            {/* Toolbar */}
            <div className="glass-panel" style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <ToolbarButton icon={<FiBold />} onClick={() => handleFormat('bold')} tooltip="Bold" />
                <ToolbarButton icon={<FiItalic />} onClick={() => handleFormat('italic')} tooltip="Italic" />
                <ToolbarButton icon={<FiUnderline />} onClick={() => handleFormat('underline')} tooltip="Underline" />

                <div style={{ width: '1px', height: '24px', background: 'var(--color-bg-tertiary)', margin: '0 0.5rem' }} />

                <ToolbarButton icon={<RiSubscript />} onClick={() => handleFormat('subscript')} tooltip="Subscript" />
                <ToolbarButton icon={<RiSuperscript />} onClick={() => handleFormat('superscript')} tooltip="Superscript" />

                <div style={{ width: '1px', height: '24px', background: 'var(--color-bg-tertiary)', margin: '0 0.5rem' }} />

                <select
                    onChange={(e) => handleFormat('fontName', e.target.value)}
                    style={{
                        background: 'var(--color-bg-primary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-bg-tertiary)',
                        padding: '0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                    }}
                    defaultValue="Inter"
                >
                    <option value="Inter">Default (Inter)</option>
                    <option value="Playfair Display">Serif</option>
                    <option value="VT323">Monospace</option>
                    <option value="Dancing Script">Cursive</option>
                </select>

                <div style={{ width: '1px', height: '24px', background: 'var(--color-bg-tertiary)', margin: '0 0.5rem' }} />

                <ToolbarButton icon={<FiPenTool />} onClick={() => setShowCanvas(true)} tooltip="Sketch / Draw" />
                <ToolbarButton icon={<FiMic />} onClick={() => setShowRecorder(!showRecorder)} tooltip="Voice Note" />
            </div>

            {/* Voice Recorder */}
            {showRecorder && (
                <div style={{ marginBottom: '1rem' }}>
                    <VoiceRecorder
                        onRecordingComplete={handleRecordingComplete}
                        onCancel={() => setShowRecorder(false)}
                    />
                </div>
            )}

            {/* Audio Recordings */}
            {note.audioRecordings && note.audioRecordings.length > 0 && (
                <div className="audio-recordings-list" style={{ marginBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Voice Notes</h4>
                    {note.audioRecordings.map(audio => (
                        <AudioPlayer
                            key={audio.id}
                            audioData={audio}
                            onDelete={handleDeleteAudio}
                            onTranscribe={handleTranscribe}
                        />
                    ))}
                </div>
            )}

            {/* Editor Area */}
            <div
                ref={contentRef}
                contentEditable
                onBlur={handleSave}
                style={{
                    flex: 1,
                    outline: 'none',
                    fontSize: '1.1rem',
                    lineHeight: '1.8',
                    overflowY: 'auto',
                    paddingBottom: '2rem'
                }}
                placeholder="Start typing..."
                className="editor-content"
            />

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onMoveToTrash={handleMoveToTrash}
                onDeletePermanently={handleDeletePermanently}
            />

            {showCanvas && (
                <DrawingCanvas
                    onClose={() => setShowCanvas(false)}
                    onSave={handleSaveCanvas}
                />
            )}
        </div>
    );
};

export default Editor;
