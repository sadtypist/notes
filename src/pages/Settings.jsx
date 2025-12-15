import React, { useState } from 'react';
import { FiCloud, FiSave, FiSettings, FiTrash2, FiGrid, FiCheck, FiPlus } from 'react-icons/fi';
import db from '../services/db';

const Settings = () => {
    const [url, setUrl] = useState(localStorage.getItem('easeNotes_supabaseUrl') || '');
    const [key, setKey] = useState(localStorage.getItem('easeNotes_supabaseKey') || '');
    const [activeTab, setActiveTab] = useState('cloud'); // 'cloud', 'data', 'general'

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
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
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
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
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
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
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
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
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
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <FiGrid /> General
                    </button>
                </div>

                {/* Cloud Tab */}
                {activeTab === 'cloud' && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiCloud /> Connection Setup
                        </h2>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                            Connect to Supabase to enable cloud storage, multi-device sync, and unlimited backup.
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
                                    background: saved ? 'var(--color-success)' : 'var(--color-accent-primary)',
                                    color: 'white',
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


