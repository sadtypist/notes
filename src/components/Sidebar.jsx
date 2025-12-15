import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiStar, FiFolder, FiTrash2, FiLogOut, FiSettings, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useUser } from '../context/UserContext';
import { useNotes } from '../context/NotesContext';

const Sidebar = () => {
    const { logout } = useUser();
    const { folders, deleteFolder } = useNotes();
    const navigate = useNavigate(); // Added hook
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleCreateFolder = () => {
        navigate('/folder/new');
    };

    return (
        <>
            <aside className="sidebar glass-panel" style={{
                width: isCollapsed ? '80px' : '240px',
                height: 'calc(100vh - 2rem)',
                position: 'sticky',
                top: '1rem',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem 1rem',
                borderRadius: 'var(--radius-xl)',
                overflowY: 'auto',
                flexShrink: 0,
                transition: 'width 0.3s ease',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', marginBottom: '2rem' }}>
                    {!isCollapsed && (
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            paddingLeft: '0.75rem',
                            background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            whiteSpace: 'nowrap'
                        }}>
                            EaseNotes
                        </h2>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="btn-icon"
                        style={{ background: 'transparent', color: 'var(--color-text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
                    </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {!isCollapsed && (
                        <div style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Menu
                        </div>
                    )}

                    <NavLink
                        to="/"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        end
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}
                        title={isCollapsed ? "All Notes" : ""}
                    >
                        <FiGrid size={20} />
                        {!isCollapsed && <span>All Notes</span>}
                    </NavLink>

                    <NavLink
                        to="/favorites"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}
                        title={isCollapsed ? "Favorites" : ""}
                    >
                        <FiStar size={20} />
                        {!isCollapsed && <span>Favorites</span>}
                    </NavLink>

                    {!isCollapsed ? (
                        <div style={{
                            padding: '0 0.75rem',
                            margin: '1.5rem 0 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>Folders</span>
                            <button
                                onClick={handleCreateFolder}
                                className="btn-icon-small"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    display: 'flex'
                                }}
                                title="New Folder"
                            >
                                <FiPlus size={14} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ margin: '1rem 0 0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={handleCreateFolder}
                                className="btn-icon"
                                style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                title="New Folder"
                            >
                                <FiPlus size={20} />
                            </button>
                        </div>
                    )}

                    {folders && folders.map(cat => (
                        <div key={cat.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <NavLink
                                to={`/folder/${cat.id}`}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-secondary)',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    flex: 1,
                                    width: '100%'
                                }}
                                title={isCollapsed ? cat.name : ""}
                            >
                                <div style={{ color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiFolder size={20} fill={cat.bgColor} />
                                </div>
                                {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>}
                            </NavLink>

                            {!isCollapsed && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (window.confirm(`Delete folder "${cat.name}"? Notes inside will not be deleted.`)) {
                                            deleteFolder(cat.id);
                                        }
                                    }}
                                    className="folder-delete-btn"
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-text-muted)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        opacity: 0.5,
                                        zIndex: 10
                                    }}
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    <NavLink
                        to="/trash"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            marginTop: '1rem',
                            borderTop: '1px solid var(--glass-border)'
                        }}
                        title={isCollapsed ? "Trash Bin" : ""}
                    >
                        <div style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center' }}>
                            <FiTrash2 size={20} />
                        </div>
                        {!isCollapsed && <span>Trash Bin</span>}
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            marginTop: '0.5rem'
                        }}
                        title={isCollapsed ? "Settings" : ""}
                    >
                        <FiSettings size={20} />
                        {!isCollapsed && <span>Settings</span>}
                    </NavLink>

                    <button
                        onClick={logout}
                        className="sidebar-link"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            width: '100%',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                        title={isCollapsed ? "Sign Out" : ""}
                    >
                        <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                            <FiLogOut size={20} />
                        </div>
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;

