import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiMove } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_COLUMNS = [
    { id: 'todo', title: 'To Do', color: '#3b82f6' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' }
];

const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'
];

const BoardSettingsModal = ({ isOpen, onClose, folder, onSave }) => {
    const [columns, setColumns] = useState([]);

    // Initialize state when modal opens
    useEffect(() => {
        if (isOpen && folder) {
            if (folder.boardConfig && folder.boardConfig.columns) {
                setColumns(folder.boardConfig.columns);
            } else {
                setColumns(DEFAULT_COLUMNS);
            }
        }
    }, [isOpen, folder]);

    const handleAddColumn = () => {
        setColumns([
            ...columns,
            { id: uuidv4(), title: 'New Column', color: '#64748b' }
        ]);
    };

    const handleRemoveColumn = (id) => {
        setColumns(columns.filter(c => c.id !== id));
    };

    const handleUpdateColumn = (id, field, value) => {
        setColumns(columns.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const handleSave = () => {
        onSave({
            enabled: true,
            columns
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div
                className="glass-panel animate-scale-in"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Board Settings</h2>
                    <button onClick={onClose} className="btn-ghost" style={{ padding: '0.5rem' }}>
                        <FiX size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                        Customize columns for <strong>{folder?.name}</strong>. Notes will be grouped by these statuses.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {columns.map((col, index) => (
                            <div key={col.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: `1px solid ${col.color}`
                            }}>
                                {/* Color Picker Trigger */}
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="color"
                                        value={col.color}
                                        onChange={(e) => handleUpdateColumn(col.id, 'color', e.target.value)}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            padding: 0,
                                            background: 'none'
                                        }}
                                    />
                                </div>

                                <input
                                    type="text"
                                    value={col.title}
                                    onChange={(e) => handleUpdateColumn(col.id, 'title', e.target.value)}
                                    className="input"
                                    style={{ flex: 1, padding: '0.25rem 0.5rem' }}
                                    placeholder="Column Name"
                                />

                                <button
                                    onClick={() => handleRemoveColumn(col.id)}
                                    className="btn-ghost"
                                    style={{ color: 'var(--color-important)', padding: '0.25rem' }}
                                    title="Remove Column"
                                    disabled={columns.length <= 1}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddColumn}
                        className="btn-ghost"
                        style={{
                            width: '100%',
                            marginTop: '1rem',
                            border: '1px dashed var(--color-border)',
                            color: 'var(--color-text-secondary)'
                        }}
                    >
                        <FiPlus /> Add Column
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn-ghost">Cancel</button>
                    <button onClick={handleSave} className="btn-primary">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default BoardSettingsModal;
