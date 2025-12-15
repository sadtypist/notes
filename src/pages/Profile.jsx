import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useNotes } from '../context/NotesContext';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiCamera, FiActivity, FiCalendar, FiFileText } from 'react-icons/fi';

const Profile = () => {
    const { user, updateProfile } = useUser();
    const { notes } = useNotes(); // Get notes for stats
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const fileInputRef = useRef(null);

    // Stats
    const totalNotes = notes ? notes.length : 0;
    const activeNotes = notes ? notes.filter(n => !n.deletedAt).length : 0;
    // Mock join date can be added later


    const handleSave = () => {
        updateProfile({ name, avatar });
        navigate(-1);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size must be less than 2MB');
                return;
            }

            // Convert to base64 for localStorage storage
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatar(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    // Default avatar if none set
    const defaultAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${name || 'User'}`;
    const displayAvatar = avatar || defaultAvatar;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '1rem' }}>
                <FiArrowLeft /> Back
            </button>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', borderBottom: '1px solid var(--color-bg-tertiary)', paddingBottom: '1rem' }}>
                    Edit Profile
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '10px', background: 'var(--color-bg-tertiary)', borderRadius: '50%', color: 'var(--color-accent-primary)' }}>
                            <FiFileText size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{activeNotes}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Active Notes</div>
                        </div>
                    </div>
                    <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '10px', background: 'var(--color-bg-tertiary)', borderRadius: '50%', color: 'var(--color-success)' }}>
                            <FiActivity size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalNotes}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Total Created</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Avatar Upload */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div
                            onClick={handleAvatarClick}
                            style={{
                                position: 'relative',
                                cursor: 'pointer',
                                borderRadius: '50%',
                            }}
                        >
                            <img
                                src={displayAvatar}
                                alt="Avatar Preview"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    border: '3px solid var(--color-accent-primary)',
                                    objectFit: 'cover',
                                    transition: 'opacity var(--transition-fast)'
                                }}
                            />
                            {/* Camera overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '36px',
                                height: '36px',
                                backgroundColor: 'var(--color-accent-primary)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: 'var(--shadow-md)',
                                transition: 'transform var(--transition-fast)'
                            }}>
                                <FiCamera size={16} />
                            </div>
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '-0.5rem' }}>
                        Click to upload a new photo
                    </p>

                    {/* Display Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Display Name</label>
                        <input
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    <button onClick={handleSave} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        <FiSave /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;

