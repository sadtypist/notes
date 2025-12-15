import React from 'react';
import { noteTemplates } from '../data/noteTemplates';
import { FiX } from 'react-icons/fi';

const TemplateModal = ({ isOpen, onClose, onSelectTemplate }) => {
    if (!isOpen) return null;

    const handleTemplateClick = (template) => {
        onSelectTemplate(template);
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
                backdropFilter: 'blur(4px)',
            }}
        >
            <div
                className="glass-panel animate-fade-in"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--color-bg-tertiary)',
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                            Create New Note
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                            Choose a template to get started
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                        style={{ padding: '0.5rem' }}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Template Grid */}
                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '1rem',
                }}>
                    {noteTemplates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => handleTemplateClick(template)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                padding: '1.25rem',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all var(--transition-fast)',
                                minHeight: '200px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-bg-tertiary)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '1.75rem' }}>
                                    {template.icon}
                                </span>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: 'var(--color-text-primary)',
                                }}>
                                    {template.name}
                                </h3>
                            </div>
                            <p style={{
                                fontSize: '0.8rem',
                                color: 'var(--color-text-muted)',
                                marginBottom: '0.75rem',
                            }}>
                                {template.description}
                            </p>
                            {/* Content Preview */}
                            {template.preview && (
                                <div style={{
                                    flex: 1,
                                    width: '100%',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.75rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--color-text-secondary)',
                                    lineHeight: '1.5',
                                    overflow: 'hidden',
                                }}>
                                    {template.preview.map((line, idx) => (
                                        <div key={idx} style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            opacity: idx > 3 ? 0.5 : 1,
                                        }}>
                                            {line}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateModal;
