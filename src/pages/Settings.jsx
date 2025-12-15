import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiCloud, FiSave, FiSettings, FiTrash2, FiGrid, FiCheck, FiPlus, FiHardDrive, FiDownload, FiUpload } from 'react-icons/fi';
import db from '../services/db';
import { driveService } from '../services/GoogleDriveService';

const Settings = () => {
    const location = useLocation();
    const [url, setUrl] = useState(localStorage.getItem('easeNotes_supabaseUrl') || '');
    const [key, setKey] = useState(localStorage.getItem('easeNotes_supabaseKey') || '');

    // Google Drive State
    const [gClientId, setGClientId] = useState(localStorage.getItem('easeNotes_gClientId') || '');
    const [isGDriveConnected, setIsGDriveConnected] = useState(false);
    const [driveBackups, setDriveBackups] = useState([]);
    const [driveStatus, setDriveStatus] = useState('');

    const [activeTab, setActiveTab] = useState('cloud'); // 'cloud', 'data', 'general'

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
        if (!gClientId) return alert("Please enter a Google Client ID first.");
        setDriveStatus("Initializing...");
        try {
            localStorage.setItem('easeNotes_gClientId', gClientId);
            await driveService.init(gClientId);
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
                                    <input
                                        type="text"
                                        placeholder="Enter Google Client ID"
                                        value={gClientId}
                                        onChange={(e) => setGClientId(e.target.value)}
                                        className="input"
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button
                                            onClick={handleConnectDrive}
                                            className="btn"
                                            style={{ background: 'var(--color-accent-primary)', color: 'white' }}
                                        >
                                            <FiCloud /> Connect Drive
                                        </button>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{driveStatus}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                        Don't have a Client ID? <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Create one here</a> (Enable "Google Drive API" first).
                                    </p>
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
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Appearance</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            The application theme currently follows your system preferences (Dark/Light).
                        </p>
                        {/* Future theme toggle implementation */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;


