import React from 'react';
import { BsPin, BsPinFill, BsStar, BsStarFill } from 'react-icons/bs';
import { FiTrash2 } from 'react-icons/fi';

const NoteCard = ({ note, navigate, getFolderById, toggleFavorite, togglePin, setDeleteModalState, compact = false }) => {
    return (
        <div
            className="glass-panel animate-fade-in"
            style={{
                borderRadius: 'var(--radius-lg)',
                padding: compact ? '1rem' : '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: compact ? 'auto' : '220px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                position: 'relative',
                overflow: 'hidden',
                border: note.isPinned ? '2px solid var(--color-accent-primary)' : undefined,
                background: compact ? 'var(--color-bg-primary)' : undefined // Slight contrast for board cards
            }}
            onClick={() => navigate(`/note/${note.id}`)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
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
            <h3 style={{
                fontSize: compact ? '1rem' : '1.25rem',
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingRight: note.isPinned ? '1.5rem' : 0
            }}>
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
                    WebkitLineClamp: compact ? 3 : (note.tags && note.tags.length > 0 ? 3 : 4),
                    WebkitBoxOrient: 'vertical',
                    marginBottom: compact ? '0.5rem' : 0
                }}
                dangerouslySetInnerHTML={{ __html: note.content }}
            />

            {!compact && (
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
            )}
        </div>
    );
};

export default NoteCard;
