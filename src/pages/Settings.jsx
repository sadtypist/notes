import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiCloud, FiSave, FiSettings, FiTrash2, FiGrid, FiCheck, FiPlus, FiHardDrive, FiDownload, FiUpload, FiType } from 'react-icons/fi';
import db from '../services/db';
import { driveService } from '../services/GoogleDriveService';
import { useTheme } from '../context/ThemeContext';

const ThemePicker = () => {
    const { themeId, defaultThemes, customThemes, applyTheme, deleteCustomTheme } = useTheme();
    const [isCreating, setIsCreating] = useState(false);

    return (
        <div>
            {isCreating ? (
                <ThemeCreator onCancel={() => setIsCreating(false)} />
            ) : (
                <>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Preset Themes</h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                            {defaultThemes.map(theme => (
                                <ThemeBubble
                                    key={theme.id}
                                    theme={theme}
                                    isActive={themeId === theme.id}
                                    onClick={() => applyTheme(theme.id)}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>My Themes</h4>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="btn"
                                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'var(--color-bg-tertiary)' }}
                            >
                                <FiPlus /> Create New
                            </button>
                        </div>

                        {customThemes.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                                {customThemes.map(theme => (
                                    <ThemeBubble
                                        key={theme.id}
                                        theme={theme}
                                        isActive={themeId === theme.id}
                                        onClick={() => applyTheme(theme.id)}
                                        onDelete={() => {
                                            if (window.confirm(`Delete theme "${theme.name}"?`)) deleteCustomTheme(theme.id);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                You haven't created any custom themes yet.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const ThemeBubble = ({ theme, isActive, onClick, onDelete }) => {
    return (
        <div
            onClick={onClick}
            style={{
                cursor: 'pointer',
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: isActive ? '2px solid var(--color-accent-primary)' : '1px solid var(--glass-border)',
                transition: 'transform 0.2s',
                transform: isActive ? 'scale(1.02)' : 'scale(1)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => !isActive && (e.currentTarget.style.transform = 'scale(1)')}
        >
            {/* Preview Area */}
            <div style={{ height: '80px', background: theme.colors['--color-bg-primary'], position: 'relative' }}>
                {/* Secondary BG Strip */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px', background: theme.colors['--color-bg-secondary'] }}></div>
                {/* Accent Dot */}
                <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: theme.colors['--color-accent-primary'],
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}></div>
                {/* Text Lines */}
                <div style={{ position: 'absolute', top: '20px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ width: '40px', height: '4px', background: theme.colors['--color-text-primary'], borderRadius: '2px', opacity: 0.8 }}></div>
                    <div style={{ width: '25px', height: '4px', background: theme.colors['--color-text-secondary'], borderRadius: '2px', opacity: 0.6 }}></div>
                </div>
            </div>

            {/* Label */}
            <div style={{ padding: '0.5rem', background: 'var(--color-bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: isActive ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {theme.name}
                </span>
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                        <FiTrash2 size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

const ThemeCreator = ({ onCancel }) => {
    const { createCustomTheme } = useTheme();
    const [name, setName] = useState('My Custom Theme');
    const [colors, setColors] = useState({
        '--color-bg-primary': '#1e1e1e',
        '--color-bg-secondary': '#252526',
        '--color-bg-tertiary': '#333333',
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#cccccc',
        '--color-text-muted': '#888888',
        '--color-accent-primary': '#007acc',
        '--color-accent-hover': '#0098ff',
        '--color-accent-subtle': 'rgba(0, 122, 204, 0.1)',
        '--glass-bg': 'rgba(30, 30, 30, 0.8)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)',
    });

    const handleChange = (key, val) => {
        setColors(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = () => {
        if (!name.trim()) return alert("Please name your theme.");
        const newTheme = {
            id: `custom-${Date.now()}`,
            name,
            type: 'dark', // defaulting to dark for simplicity in meta, essentially determines data-theme attr
            colors
        };
        createCustomTheme(newTheme);
        onCancel();
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-accent-primary)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Theme</h3>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Theme Name</label>
                <input
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Neon Nights"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {/* Backgrounds */}
                <div>
                    <h4 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Backgrounds</h4>
                    <ColorInput label="Primary BG" varName="--color-bg-primary" colors={colors} onChange={handleChange} />
                    <ColorInput label="Secondary BG" varName="--color-bg-secondary" colors={colors} onChange={handleChange} />
                    <ColorInput label="Tertiary BG" varName="--color-bg-tertiary" colors={colors} onChange={handleChange} />
                    <ColorInput label="Glass BG (Opacity ignored in native picker)" varName="--glass-bg" colors={colors} onChange={handleChange} type="text" />
                </div>
                {/* Foreground */}
                <div>
                    <h4 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Foreground</h4>
                    <ColorInput label="Primary Text" varName="--color-text-primary" colors={colors} onChange={handleChange} />
                    <ColorInput label="Secondary Text" varName="--color-text-secondary" colors={colors} onChange={handleChange} />
                    <ColorInput label="Accent Main" varName="--color-accent-primary" colors={colors} onChange={handleChange} />
                    <ColorInput label="Accent Hover" varName="--color-accent-hover" colors={colors} onChange={handleChange} />
                </div>
            </div>

            {/* Preview Box */}
            <div style={{ padding: '1rem', background: colors['--color-bg-primary'], borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ color: colors['--color-text-primary'] }}>Theme Preview</h4>
                <p style={{ color: colors['--color-text-secondary'] }}>This is how your text will look.</p>
                <button style={{
                    marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '4px',
                    background: colors['--color-accent-primary'], color: 'white', border: 'none'
                }}>
                    Primary Button
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleSave} className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' }}>
                    Save Theme
                </button>
                <button onClick={onCancel} className="btn-ghost" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' }}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

const ColorInput = ({ label, varName, colors, onChange, type = "color" }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {type === 'color' && (
                <input
                    type="color"
                    value={colors[varName]}
                    onChange={e => onChange(varName, e.target.value)}
                    style={{ width: '30px', height: '30px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
            )}
            {/* Fallback text input for precise hex or rgba editing */}
            <input
                type="text"
                value={colors[varName]}
                onChange={e => onChange(varName, e.target.value)}
                style={{ width: '90px', padding: '4px', fontSize: '0.8rem', background: 'var(--color-bg-tertiary)', border: 'none', color: 'var(--color-text-primary)', borderRadius: '4px' }}
            />
        </div>
    </div>
);

const Settings = () => {
    const location = useLocation();
    const [url, setUrl] = useState(localStorage.getItem('easeNotes_supabaseUrl') || '');
    const [key, setKey] = useState(localStorage.getItem('easeNotes_supabaseKey') || '');

    // Google Drive State
    // Try to get from Env Var first, then LocalStorage
    const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const [gClientId, setGClientId] = useState(envClientId || localStorage.getItem('easeNotes_gClientId') || '');
    const [isGDriveConnected, setIsGDriveConnected] = useState(false);
    const [driveBackups, setDriveBackups] = useState([]);
    const [driveStatus, setDriveStatus] = useState('');

    const [activeTab, setActiveTab] = useState('cloud'); // 'cloud', 'data', 'general'

    // Font Size State
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('easeNotes_fontSize') || 'medium');

    // Apply Font Size
    useLayoutEffect(() => {
        const root = document.documentElement;
        let size = '16px'; // default (medium)
        if (fontSize === 'small') size = '14px';
        if (fontSize === 'large') size = '18px';
        if (fontSize === 'xl') size = '20px';

        root.style.setProperty('--base-font-size', size);
        localStorage.setItem('easeNotes_fontSize', fontSize);
        // We might need to ensure --base-font-size is used in global CSS on body font-size
        document.body.style.fontSize = size;
    }, [fontSize]);

    // Initialize tab from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['cloud', 'data', 'general'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    // Status
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [migrationStatus, setMigrationStatus] = useState(null);
    const [migratedCount, setMigratedCount] = useState(0);

    const handleSave = () => {
        localStorage.setItem('easeNotes_supabaseUrl', url);
        localStorage.setItem('easeNotes_supabaseKey', key);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        // Force reload to re-init services
        window.location.reload();
    };

    // Google Drive Handlers
    const handleConnectDrive = async () => {
        const clientIdToUse = gClientId || envClientId;
        if (!clientIdToUse) return alert("Please configure VITE_GOOGLE_CLIENT_ID in .env or enter it manually.");

        setDriveStatus("Initializing...");
        try {
            if (!envClientId) {
                localStorage.setItem('easeNotes_gClientId', gClientId);
            }
            await driveService.init(clientIdToUse);
            await driveService.signIn();
            setIsGDriveConnected(true);
            setDriveStatus("Connected! Fetching backups...");
            await refreshBackups();
        } catch (err) {
            console.error(err);
            setDriveStatus("Connection failed. Check console.");
        }
    };

    const refreshBackups = async () => {
        try {
            const files = await driveService.listBackups();
            setDriveBackups(files);
            setDriveStatus("");
        } catch (err) {
            setDriveStatus("Failed to list backups.");
        }
    };

    const handleDriveBackup = async () => {
        setDriveStatus("Backing up...");
        try {
            const data = {
                notes: JSON.parse(localStorage.getItem('easeNotes_notes') || '[]'),
                folders: JSON.parse(localStorage.getItem('easeNotes_folders') || '[]'),
                user: JSON.parse(localStorage.getItem('easeNotes_user') || 'null'),
                timestamp: new Date().toISOString()
            };
            await driveService.uploadBackup(JSON.stringify(data));
            setDriveStatus("Backup successful!");
            refreshBackups();
        } catch (err) {
            console.error(err);
            setDriveStatus("Backup failed.");
        }
    };

    const handleDriveRestore = async (fileId) => {
        if (!window.confirm("Restore from this backup? CURRENT LOCAL DATA WILL BE REPLACED.")) return;

        setDriveStatus("Restoring...");
        try {
            const data = await driveService.fetchBackupContent(fileId);
            if (data.notes) localStorage.setItem('easeNotes_notes', JSON.stringify(data.notes));
            if (data.folders) localStorage.setItem('easeNotes_folders', JSON.stringify(data.folders));
            // We usually don't overwrite user unless it's a full snapshot restore desired by user.
            // Let's safe keep user if possible, or overwrite if data.user exists? 
            // Better to keep current login session active.

            setDriveStatus("Restore complete! Reloading...");
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            console.error(err);
            setDriveStatus("Restore failed.");
        }
    };

    const handleMigration = async () => {
        if (!url || !key) return alert("Please save cloud credentials first!");

        setLoading(true);
        setMigrationStatus("Preparing to migrate...");
        setMigratedCount(0);

        try {
            const localNotesRaw = localStorage.getItem('easeNotes_notes');
            if (!localNotesRaw) {
                setMigrationStatus("No local notes found to migrate.");
                setLoading(false);
                return;
            }
            const localNotes = JSON.parse(localNotesRaw);

            let count = 0;
            for (let i = 0; i < localNotes.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 50));
                count++;
            }

            setMigratedCount(count);
            setMigrationStatus("Migration complete! Please confirm notes are in cloud.");
        } catch (error) {
            console.error(error);
            setMigrationStatus("Migration failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const data = {
            notes: JSON.parse(localStorage.getItem('easeNotes_notes') || '[]'),
            user: JSON.parse(localStorage.getItem('easeNotes_user') || 'null'),
            settings: {
                supabaseUrl: localStorage.getItem('easeNotes_supabaseUrl'),
            },
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `easeNotes_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDeleteAll = () => {
        if (window.confirm("ARE YOU SURE? This will delete ALL local data, reset settings, and log you out. This action cannot be undone.")) {
            if (window.confirm("Really delete everything?")) {
                localStorage.clear();
                window.location.reload();
            }
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'var(--color-accent-primary)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '1.5rem'
                    }}>
                        <FiSettings />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Settings</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Configure app preferences</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', overflowX: 'auto' }}>
                    <button
                        onClick={() => setActiveTab('cloud')}
                        style={{
                            padding: '0.75rem 1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'cloud' ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                            color: activeTab === 'cloud' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            fontWeight: activeTab === 'cloud' ? '600' : '400',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <FiCloud /> Cloud Sync
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        style={{
                            padding: '0.75rem 1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'data' ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                            color: activeTab === 'data' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            fontWeight: activeTab === 'data' ? '600' : '400',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <FiSave /> Data Management
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        style={{
                            padding: '0.75rem 1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'general' ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                            color: activeTab === 'general' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            fontWeight: activeTab === 'general' ? '600' : '400',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <FiGrid /> General
                    </button>
                </div>

                {/* Cloud Tab */}
                {activeTab === 'cloud' && (
                    <div className="animate-fade-in">
                        {/* Google Drive Section */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiHardDrive /> Google Drive Backup
                            </h2>
                            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                Securely backup your notes to your personal Google Drive. Requires a Google Client ID.
                            </p>

                            {!isGDriveConnected ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {!envClientId && (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                placeholder="Enter Google Client ID"
                                                value={gClientId}
                                                onChange={(e) => setGClientId(e.target.value)}
                                                className="input"
                                                style={{ fontSize: '0.9rem' }}
                                            />
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                Tip: Add <code>VITE_GOOGLE_CLIENT_ID</code> to <code>.env</code> to hide this.
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button
                                            onClick={handleConnectDrive}
                                            className="btn"
                                            style={{
                                                background: 'white',
                                                color: '#3c4043',
                                                border: '1px solid #dadce0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                fontWeight: '500',
                                                padding: '0.5rem 1rem'
                                            }}
                                        >
                                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                                            <span>Sign in with Google</span>
                                        </button>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{driveStatus}</span>
                                    </div>

                                    {!envClientId && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                            Don't have a Client ID? <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Create one here</a> (Enable "Google Drive API" first).
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                                        <button onClick={handleDriveBackup} className="btn" style={{ background: 'var(--color-success)', color: 'white' }}>
                                            <FiUpload /> Backup Now
                                        </button>
                                        <button onClick={refreshBackups} className="btn-ghost" title="Refresh list">
                                            Refresh
                                        </button>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{driveStatus}</span>
                                    </div>

                                    {driveBackups.length > 0 ? (
                                        <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Available Backups</h4>
                                            {driveBackups.map(file => (
                                                <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{file.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                            {new Date(file.createdTime).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDriveRestore(file.id)}
                                                        className="btn-ghost"
                                                        style={{ color: 'var(--color-accent-primary)', fontSize: '0.9rem' }}
                                                    >
                                                        <FiDownload /> Restore
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No backups found.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '2rem 0' }}></div>

                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiCloud /> Supabase Sync (Legacy)
                        </h2>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                            Connect to Supabase for real-time multi-device sync.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Supabase Project URL</label>
                                <input
                                    type="text"
                                    placeholder="https://xyz.supabase.co"
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    className="input"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Supabase Anon Key</label>
                                <input
                                    type="password"
                                    placeholder="public-anon-key..."
                                    value={key}
                                    onChange={e => setKey(e.target.value)}
                                    className="input"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="btn"
                                style={{
                                    alignSelf: 'flex-start',
                                    background: saved ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                                    color: saved ? 'white' : 'var(--color-text-primary)',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                {saved ? <><FiCheck /> Saved</> : <><FiSave /> Save Configuration</>}
                            </button>
                        </div>

                        {db.isCloudEnabled() && (
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>Upload Local Data</h3>
                                <div className="alert" style={{ marginBottom: '1rem', background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ fontSize: '0.9rem' }}>
                                        Use this to push your browser-saved notes to the cloud. You must be logged in first.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button
                                        onClick={handleMigration}
                                        disabled={loading}
                                        className="btn"
                                        style={{
                                            background: 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text-primary)'
                                        }}
                                    >
                                        {loading ? 'Migrating...' : <><FiCloud /> Upload to Cloud</>}
                                    </button>
                                    {migrationStatus && <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{migrationStatus}</span>}
                                </div>
                                {migratedCount > 0 && <p style={{ marginTop: '0.5rem', color: 'var(--color-success)' }}>Successfully uploaded {migratedCount} notes!</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* Data Management Tab */}
                {activeTab === 'data' && (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiSave /> Export Data
                            </h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                                Download a backup of all your local notes and settings as a JSON file.
                            </p>
                            <button onClick={handleExport} className="btn" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}>
                                <FiPlus /> Download Backup
                            </button>
                        </div>

                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
                                <FiTrash2 /> Danger Zone
                            </h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                                Irreversibly clear all application data from this browser.
                            </p>
                            <button onClick={handleDeleteAll} className="btn" style={{ background: 'var(--color-danger)', color: 'white', border: 'none' }}>
                                <FiTrash2 /> Delete All Data
                            </button>
                        </div>
                    </div>
                )}

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiType /> Typography
                            </h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                                Adjust the base font size for the application.
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                <button
                                    onClick={() => setFontSize('small')}
                                    className={`btn ${fontSize === 'small' ? 'active' : 'btn-ghost'}`}
                                    style={{
                                        background: fontSize === 'small' ? 'var(--color-accent-primary)' : 'transparent',
                                        color: fontSize === 'small' ? 'white' : 'var(--color-text-primary)'
                                    }}
                                >
                                    Small
                                </button>
                                <button
                                    onClick={() => setFontSize('medium')}
                                    className={`btn ${fontSize === 'medium' ? 'active' : 'btn-ghost'}`}
                                    style={{
                                        background: fontSize === 'medium' ? 'var(--color-accent-primary)' : 'transparent',
                                        color: fontSize === 'medium' ? 'white' : 'var(--color-text-primary)'
                                    }}
                                >
                                    Medium
                                </button>
                                <button
                                    onClick={() => setFontSize('large')}
                                    className={`btn ${fontSize === 'large' ? 'active' : 'btn-ghost'}`}
                                    style={{
                                        background: fontSize === 'large' ? 'var(--color-accent-primary)' : 'transparent',
                                        color: fontSize === 'large' ? 'white' : 'var(--color-text-primary)'
                                    }}
                                >
                                    Large
                                </button>
                                <button
                                    onClick={() => setFontSize('xl')}
                                    className={`btn ${fontSize === 'xl' ? 'active' : 'btn-ghost'}`}
                                    style={{
                                        background: fontSize === 'xl' ? 'var(--color-accent-primary)' : 'transparent',
                                        color: fontSize === 'xl' ? 'white' : 'var(--color-text-primary)'
                                    }}
                                >
                                    Extra Large
                                </button>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '2rem 0' }}></div>

                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Appearance</h3>

                        {/* Theme Picker Component */}
                        <ThemePicker />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;


