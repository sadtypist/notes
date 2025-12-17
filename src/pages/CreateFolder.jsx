import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFolder, FiCheck, FiSave, FiTag } from 'react-icons/fi';
import { useNotes } from '../context/NotesContext';

const CreateFolder = () => {
    const navigate = useNavigate();
    const { addFolder } = useNotes();
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');

    // Category specific state
    const [categoryName, setCategoryName] = useState('');
    const [categoryColor, setCategoryColor] = useState('#3b82f6');
    const [isCategoryNameSynced, setIsCategoryNameSynced] = useState(true);
    const [isCategoryColorSynced, setIsCategoryColorSynced] = useState(true);

    // Sync Folder Name -> Category Name
    useEffect(() => {
        if (isCategoryNameSynced) {
            setCategoryName(name);
        }
    }, [name, isCategoryNameSynced]);

    // Sync Folder Color -> Category Color
    useEffect(() => {
        if (isCategoryColorSynced) {
            setCategoryColor(color);
        }
    }, [color, isCategoryColorSynced]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name.trim()) {
            // Use categoryName if set, otherwise fallback to folder name (though it should be synced)
            const finalCategoryName = categoryName.trim() || name.trim();
            const finalCategoryColor = categoryColor;

            await addFolder(name, color, finalCategoryName, finalCategoryColor);
            navigate('/');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '1rem' }}>
                <FiArrowLeft /> Back
            </button>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Create New Folder</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Configure your folder and its corresponding category tag.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

                    {/* Left Column: Folder Settings */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiFolder /> Folder Settings
                        </h3>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Folder Name</label>
                            <input
                                autoFocus
                                className="input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Work, Personal..."
                                style={{ fontSize: '1.1rem', padding: '1rem', width: '100%' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Folder Icon Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    style={{
                                        width: '64px', height: '64px',
                                        padding: '0', border: 'none',
                                        borderRadius: '12px', cursor: 'pointer',
                                        background: 'none'
                                    }}
                                />
                                <div style={{
                                    width: '48px', height: '48px',
                                    background: color,
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '1.5rem',
                                    boxShadow: `0 0 20px ${color}40`
                                }}>
                                    <FiFolder fill="rgba(255,255,255,0.2)" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Category Settings */}
                    <div style={{ paddingLeft: '3rem', borderLeft: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiTag /> Category Tag Settings
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                            This is how notes inside this folder will be tagged.
                        </p>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Category Name</label>
                            <input
                                className="input"
                                value={categoryName}
                                onChange={e => {
                                    setCategoryName(e.target.value);
                                    setIsCategoryNameSynced(false);
                                }}
                                placeholder="e.g. work, project-alpha..."
                                style={{ fontSize: '1rem', padding: '0.75rem', width: '100%' }}
                            />
                            {isCategoryNameSynced && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    Synced with Folder Name
                                </p>
                            )}
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Category Tag Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="color"
                                    value={categoryColor}
                                    onChange={(e) => {
                                        setCategoryColor(e.target.value);
                                        setIsCategoryColorSynced(false);
                                    }}
                                    style={{
                                        width: '48px', height: '48px',
                                        padding: '0', border: 'none',
                                        borderRadius: '8px', cursor: 'pointer',
                                        background: 'none'
                                    }}
                                />
                                {/* Preview Tag */}
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    backgroundColor: `${categoryColor}26`,
                                    color: categoryColor,
                                    border: `1px solid ${categoryColor}40`
                                }}>
                                    {categoryName || 'Tag Preview'}
                                </span>
                            </div>
                            {isCategoryColorSynced && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                    Synced with Folder Color
                                </p>
                            )}
                        </div>
                    </div>
                </form>

                <div style={{ display: 'flex', gap: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', marginTop: '1rem' }}>
                    <button onClick={handleSubmit} className="btn btn-primary" disabled={!name.trim()} style={{ flex: 1, justifyContent: 'center', padding: '1rem' }}>
                        <FiSave /> Create Folder & Category
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateFolder;
