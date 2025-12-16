import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiTrash2, FiClock, FiX } from 'react-icons/fi';

const DeleteModal = ({ isOpen, onClose, onMoveToTrash, onDeletePermanently }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
        }}
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="glass-panel"
                style={{
                    width: '90%',
                    maxWidth: '400px',
                    padding: '2rem',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'relative',
                    border: '1px solid var(--glass-border)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-danger)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '2rem'
                    }}>
                        <FiAlertTriangle />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Delete Note?</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        What would you like to do with this note?
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {onMoveToTrash && (
                        <button
                            onClick={onMoveToTrash}
                            className="btn"
                            style={{
                                background: 'var(--color-bg-tertiary)',
                                color: 'var(--color-text-primary)',
                                justifyContent: 'flex-start',
                                padding: '1rem'
                            }}
                        >
                            <FiClock size={20} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '600' }}>Move to Trash</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Automatically deleted after 72 hours</div>
                            </div>
                        </button>
                    )}

                    <button
                        onClick={onDeletePermanently}
                        className="btn"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--color-danger)',
                            justifyContent: 'flex-start',
                            padding: '1rem'
                        }}
                    >
                        <FiTrash2 size={20} />
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: '600' }}>Delete Permanently</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>This action cannot be undone</div>
                        </div>
                    </button>

                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                        style={{ marginTop: '0.5rem' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
