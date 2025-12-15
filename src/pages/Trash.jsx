import React from 'react';
import { useNotes } from '../context/NotesContext';
import { FiTrash2, FiRefreshCw, FiAlertTriangle, FiClock } from 'react-icons/fi';


const Trash = () => {
    const { trashNotes, restoreNote, deleteNote, emptyTrash } = useNotes();

    const calculateTimeRemaining = (deletedAt) => {
        const deletedDate = new Date(deletedAt);
        const expiresAt = new Date(deletedDate.getTime() + (72 * 60 * 60 * 1000));
        const now = new Date();
        const diffValid = expiresAt - now;

        if (diffValid <= 0) return 'Expiring soon';

        const hours = Math.floor(diffValid / (1000 * 60 * 60));
        if (hours > 24) {
            return `${Math.floor(hours / 24)} days left`;
        }
        return `${hours} hours left`;
    };

    return (
        <div className="container" style={{ paddingBottom: '80px', paddingTop: '2rem' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                borderBottom: '1px solid var(--color-bg-tertiary)',
                paddingBottom: '1.5rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: 'var(--color-danger)'
                    }}>
                        <FiTrash2 /> Trash Bin
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                        Notes are automatically removed after 72 hours.
                    </p>
                </div>

                {trashNotes.length > 0 && (
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to empty the trash? This cannot be undone.')) {
                                emptyTrash();
                            }
                        }}
                        className="btn"
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--color-danger)',
                            border: '1px solid var(--color-danger)'
                        }}
                    >
                        Empty Trash
                    </button>
                )}
            </header>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}>
                {trashNotes.length === 0 ? (
                    <div style={{
                        gridColumn: '1/-1',
                        textAlign: 'center',
                        color: 'var(--color-text-muted)',
                        padding: '4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <FiTrash2 size={48} style={{ opacity: 0.3 }} />
                        <p>Trash is empty</p>
                    </div>
                ) : (
                    trashNotes.map(note => (
                        <div
                            key={note.id}
                            className="glass-panel"
                            style={{
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '220px',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid var(--color-danger)30',
                                opacity: 0.8
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--color-danger)',
                                fontSize: '0.7rem',
                                padding: '0.25rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: '600'
                            }}>
                                <FiClock size={12} />
                                {calculateTimeRemaining(note.deletedAt)}
                            </div>

                            <h3 style={{
                                fontSize: '1.25rem',
                                marginBottom: '0.5rem',
                                marginTop: '1rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textDecoration: 'line-through',
                                color: 'var(--color-text-muted)'
                            }}>
                                {note.title}
                            </h3>

                            <div
                                style={{
                                    flex: 1,
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.9rem',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical'
                                }}
                                dangerouslySetInnerHTML={{ __html: note.content }}
                            />

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '1rem',
                                alignItems: 'center',
                                borderTop: '1px solid var(--color-bg-tertiary)',
                                paddingTop: '0.75rem'
                            }}>
                                <button
                                    onClick={() => restoreNote(note.id)}
                                    className="btn btn-ghost"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--color-success)' }}
                                    title="Restore note"
                                >
                                    <FiRefreshCw style={{ marginRight: '0.25rem' }} /> Restore
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete permanently?')) deleteNote(note.id, true);
                                    }}
                                    className="btn btn-ghost"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--color-danger)' }}
                                    title="Delete forever"
                                >
                                    <FiTrash2 style={{ marginRight: '0.25rem' }} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Trash;
