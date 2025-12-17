import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUser, FiFolder, FiStar } from 'react-icons/fi';
import { BsPin, BsPinFill, BsStar, BsStarFill } from 'react-icons/bs';
import ThemeToggle from '../components/ThemeToggle';
import TemplateModal from '../components/TemplateModal';
import DeleteModal from '../components/DeleteModal';

const Home = () => {
    const { filteredNotes, folders, setSearchQuery, deleteNote, addNote, togglePin, toggleFavorite } = useNotes();
    const { user } = useUser();
    // const { isDark } = useTheme(); // Unused
    const navigate = useNavigate();
    const location = useLocation();
    const { categoryId } = useParams();
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, noteId: null });

    // Helper to get folder info
    const getFolderById = (id) => {
        if (!folders) return null;
        return folders.find(f => f.id === id);
    };

    // Filter Logic
    const displayNotes = filteredNotes.filter(note => {
        // 1. If searching, skip folder filtering (or combine them? Usually global search is better)
        // Let's combine: Search query + Folder constraint

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
                        {categoryId && <FiFolder className="animate-fade-in" size={28} style={{ color: getFolderById(categoryId)?.color }} />}
                        {getPageTitle()}
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

            {/* Grid */}
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
                        <div
                            key={note.id}
                            className="glass-panel animate-fade-in"
                            style={{
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '220px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                position: 'relative',
                                overflow: 'hidden',
                                border: note.isPinned ? '2px solid var(--color-accent-primary)' : undefined,
                            }}
                            onClick={() => navigate(`/note/${note.id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {/* Pin indicator */}
                            {note.isPinned && (
                                <div style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    color: 'var(--color-accent-primary)',
                                    fontSize: '0.9rem',
                                }}>
                                    <BsPinFill />
                                </div>
                            )}
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: note.isPinned ? '1.5rem' : 0 }}>
                                {note.title}
                            </h3>
                            {/* Categories */}
                            {note.tags && note.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                                    {note.tags.slice(0, 3).map(tagId => {
                                        const cat = getFolderById(tagId);
                                        if (!cat) return null;
                                        // Use category properties
                                        const displayName = cat.categoryName || cat.name;
                                        const displayColor = cat.categoryColor || cat.color;
                                        const displayBg = `${displayColor}26`;

                                        return (
                                            <span
                                                key={tagId}
                                                style={{
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: '500',
                                                    backgroundColor: displayBg,
                                                    color: displayColor,
                                                }}
                                            >
                                                {displayName}
                                            </span>
                                        );
                                    })}
                                    {note.tags.length > 3 && (
                                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                            +{note.tags.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div
                                style={{
                                    flex: 1,
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.9rem',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: note.tags && note.tags.length > 0 ? 3 : 4,
                                    WebkitBoxOrient: 'vertical'
                                }}
                                dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }}
                                        className="btn-ghost"
                                        style={{ padding: '0.25rem', color: note.isFavorite ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
                                        title={note.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                                    >
                                        {note.isFavorite ? <BsStarFill /> : <BsStar />}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                                        className="btn-ghost"
                                        style={{ padding: '0.25rem', color: note.isPinned ? 'var(--color-accent-primary)' : 'var(--color-text-muted)' }}
                                        title={note.isPinned ? 'Unpin note' : 'Pin note'}
                                    >
                                        {note.isPinned ? <BsPinFill /> : <BsPin />}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteModalState({ isOpen: true, noteId: note.id }); }}
                                        className="btn-ghost"
                                        style={{ padding: '0.25rem', color: 'var(--color-text-muted)' }}
                                        title="Delete note"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

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

        </div>
    );
};

export default Home;
