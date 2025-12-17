import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUser, FiFolder, FiStar, FiGrid, FiColumns } from 'react-icons/fi';
import { BsPin, BsPinFill, BsStar, BsStarFill } from 'react-icons/bs';
import ThemeToggle from '../components/ThemeToggle';
import TemplateModal from '../components/TemplateModal';
import DeleteModal from '../components/DeleteModal';
import NoteCard from '../components/NoteCard';
import BoardSettingsModal from '../components/BoardSettingsModal';

const Home = () => {
    const { filteredNotes, folders, setSearchQuery, deleteNote, addNote, updateFolder, togglePin, toggleFavorite } = useNotes();
    const { user } = useUser();
    // const { isDark } = useTheme(); // Unused
    const navigate = useNavigate();
    const location = useLocation();
    const { categoryId } = useParams();
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, noteId: null });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'board'
    const [showBoardSettings, setShowBoardSettings] = useState(false);

    // Helper to get folder info
    const getFolderById = (id) => {
        if (!folders) return null;
        return folders.find(f => f.id === id);
    };

    // Filter Logic
    const displayNotes = filteredNotes.filter(note => {
        // Folder check
        if (location.pathname === '/favorites') {
            if (!note.isFavorite) return false;
        } else if (categoryId) {
            if (!note.tags || !note.tags.includes(categoryId)) return false;
        }
        return true;
    });

    const getPageTitle = () => {
        if (location.pathname === '/favorites') return 'Favorites';
        if (categoryId) {
            const cat = getFolderById(categoryId);
            return cat ? cat.name : 'Folder';
        }
        return 'All Notes';
    };

    const handleCreateNote = async (template) => {
        // Create note with template content
        const newId = await addNote({
            title: template.title,
            content: template.content,
            tags: categoryId ? [categoryId] : [] // Auto-tag if inside a folder
        });
        navigate(`/note/${newId}`);
    };

    // Active Folder & Board Config
    const activeFolder = categoryId ? getFolderById(categoryId) : null;
    const defaultBoardColumns = [
        { id: 'todo', title: 'To Do', color: '#3b82f6' },
        { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
        { id: 'done', title: 'Done', color: '#10b981' }
    ];
    const boardColumns = activeFolder?.boardConfig?.columns || defaultBoardColumns;

    const handleSaveBoardConfig = (config) => {
        if (activeFolder) {
            updateFolder(activeFolder.id, { boardConfig: config });
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '80px', paddingTop: '2rem' }}>

            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        background: 'var(--header-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        {categoryId && <FiFolder className="animate-fade-in" size={28} style={{ color: activeFolder?.color }} />}
                        {getPageTitle()}
                        {/* Board Settings Button */}
                        {categoryId && viewMode === 'board' && (
                            <button
                                onClick={() => setShowBoardSettings(true)}
                                className="btn-ghost animate-fade-in"
                                style={{ marginLeft: '1rem', padding: '0.5rem', fontSize: '1rem', color: 'var(--color-text-secondary)' }}
                                title="Board Settings"
                            >
                                <FiEdit2 />
                            </button>
                        )}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                        {displayNotes.length} notes found
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ThemeToggle />
                    <button onClick={() => navigate('/profile')} className="btn glass-panel" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        ) : (
                            <FiUser />
                        )}
                    </button>
                </div>
            </header>

            {/* Search */}
            <div className="glass-panel" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                borderRadius: 'var(--radius-xl)',
                marginBottom: '2rem',
                border: '1px solid var(--color-bg-tertiary)'
            }}>
                <FiSearch style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }} />
                <input
                    type="text"
                    placeholder="Search your notes..."
                    className="input"
                    style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* View Toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
                <button
                    onClick={() => setViewMode('grid')}
                    className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                    title="Grid View"
                >
                    <FiGrid />
                </button>
                <button
                    onClick={() => setViewMode('board')}
                    className={`btn ${viewMode === 'board' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                    title="Kanban Board View"
                >
                    <FiColumns />
                </button>
            </div>

            {/* Content View */}
            {viewMode === 'grid' ? (
                /* Grid View */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {displayNotes.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem' }}>
                            <p>No notes found in this folder. Create one to get started!</p>
                        </div>
                    ) : (
                        displayNotes.map(note => (
                            <NoteCard key={note.id} note={note} navigate={navigate} getFolderById={getFolderById} toggleFavorite={toggleFavorite} togglePin={togglePin} setDeleteModalState={setDeleteModalState} />
                        ))
                    )}
                </div>
            ) : (
                /* Kanban Board View */
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    overflowX: 'auto',
                    paddingBottom: '2rem',
                    minHeight: '60vh'
                }}>
                    {boardColumns.map(col => {
                        return (
                            <div
                                key={col.id}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const noteId = e.dataTransfer.getData('noteId');
                                    if (noteId) {
                                        // Update Note Status
                                        addNote({ ...displayNotes.find(n => n.id === noteId), status: col.id });
                                    }
                                }}
                                style={{
                                    flex: '1',
                                    minWidth: '300px',
                                    background: 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '1rem',
                                    border: `1px solid ${col.color}40`
                                }}
                            >
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1rem',
                                    color: col.color,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    {col.title}
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7, background: 'var(--color-bg-primary)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                        {displayNotes.filter(n => (n.status || 'todo') === col.id).length}
                                    </span>
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {displayNotes.filter(n => (n.status || 'todo') === col.id).map(note => (
                                        <div key={note.id} draggable onDragStart={(e) => e.dataTransfer.setData('noteId', note.id)} style={{ cursor: 'grab' }}>
                                            <NoteCard note={note} navigate={navigate} getFolderById={getFolderById} toggleFavorite={toggleFavorite} togglePin={togglePin} setDeleteModalState={setDeleteModalState} compact />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* FAB - Opens Template Modal */}
            <button
                onClick={() => setShowTemplateModal(true)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'white',
                    fontSize: '1.5rem',
                    boxShadow: 'var(--shadow-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100
                }}
                className="animate-fade-in"
                title="Create new note"
            >
                <FiPlus />
            </button>

            {/* Template Selection Modal */}
            <TemplateModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                onSelectTemplate={handleCreateNote}
            />

            <DeleteModal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ isOpen: false, noteId: null })}
                onMoveToTrash={() => {
                    deleteNote(deleteModalState.noteId, false);
                    setDeleteModalState({ isOpen: false, noteId: null });
                }}
                onDeletePermanently={() => {
                    deleteNote(deleteModalState.noteId, true);
                    setDeleteModalState({ isOpen: false, noteId: null });
                }}
            />

            <BoardSettingsModal
                isOpen={showBoardSettings}
                onClose={() => setShowBoardSettings(false)}
                folder={activeFolder}
                onSave={handleSaveBoardConfig}
            />

        </div>
    );
};

export default Home;
