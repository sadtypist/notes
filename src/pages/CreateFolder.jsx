import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFolder, FiCheck, FiSave } from 'react-icons/fi';
import { useNotes } from '../context/NotesContext';

const CreateFolder = () => {
    const navigate = useNavigate();
    const { addFolder } = useNotes();
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');

    const colors = [
        '#3b82f6', // Blue
        '#8b5cf6', // Violet
        '#f59e0b', // Amber
        '#10b981', // Emerald
        '#ec4899', // Pink
        '#06b6d4', // Cyan
        '#84cc16', // Lime
        '#ef4444', // Red
        '#6366f1', // Indigo
        '#f43f5e', // Rose
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name.trim()) {
            await addFolder(name, color);
            navigate('/');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '1rem' }}>
                <FiArrowLeft /> Back
            </button>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        background: color,
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '1.5rem',
                        transition: 'background 0.3s ease'
                    }}>
                        <FiFolder fill="rgba(255,255,255,0.2)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Create New Folder</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Organize your notes with categories</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Folder Name</label>
                        <input
                            autoFocus
                            className="input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Travel, Ideas, Receipts..."
                            style={{ fontSize: '1.1rem', padding: '1rem' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Folder Color</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', gap: '1rem' }}>
                            {colors.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: c,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: color === c ? '3px solid var(--color-bg-primary)' : '3px solid transparent',
                                        boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                                        transform: color === c ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {color === c && <FiCheck color="white" size={24} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                        <button type="submit" className="btn btn-primary" disabled={!name.trim()} style={{ flex: 1, justifyContent: 'center', padding: '1rem' }}>
                            <FiSave /> Create Folder
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                <p>Preview:</p>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-secondary)',
                    marginTop: '0.5rem',
                    border: '1px solid var(--glass-border)'
                }}>
                    <FiFolder color={color} fill={`${color}33`} />
                    <span style={{ fontWeight: '500' }}>{name || 'Folder Name'}</span>
                </div>
            </div>
        </div>
    );
};

export default CreateFolder;
