import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { useTheme } from '../context/ThemeContext';
import { FiSearch, FiFileText, FiSettings, FiPlus, FiFolderPlus, FiDownload, FiLayout, FiMoon, FiSun, FiMonitor } from 'react-icons/fi';

const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { notes, createNote, createFolder, exportAllData } = useNotes();
    const { theme, setTheme } = useTheme();

    // Toggle with Ctrl+K or Cmd+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    return (
        <>
            {/* Background Overlay */}
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 9998
                    }}
                    onClick={() => setOpen(false)}
                />
            )}

            <Command.Dialog
                open={open}
                onOpenChange={setOpen}
                label="Global Command Menu"
                className="cmdk-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="cmdk-input-wrapper">
                    <FiSearch className="cmdk-search-icon" />
                    <Command.Input placeholder="Type a command or search..." />
                </div>

                <Command.List>
                    <Command.Empty>No results found.</Command.Empty>

                    <Command.Group heading="Actions">
                        <Command.Item onSelect={() => runCommand(() => { createNote(); navigate('/'); })}>
                            <FiPlus /> New Note
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => navigate('/folder/new'))}>
                            <FiFolderPlus /> New Folder
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => exportAllData())}>
                            <FiDownload /> Export All Data
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Navigation">
                        <Command.Item onSelect={() => runCommand(() => navigate('/'))}>
                            <FiLayout /> Home / Dashboard
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => navigate('/settings'))}>
                            <FiSettings /> Settings
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => navigate('/trash'))}>
                            <FiFileText /> Trash Bin
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Theme">
                        <Command.Item onSelect={() => runCommand(() => setTheme('light'))}>
                            <FiSun /> Light Theme
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => setTheme('dark'))}>
                            <FiMoon /> Dark Theme
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => setTheme('system'))}>
                            <FiMonitor /> System Theme
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Jump to Note">
                        {notes.map((note) => (
                            <Command.Item
                                key={note.id}
                                onSelect={() => runCommand(() => navigate(`/note/${note.id}`))}
                                value={note.title || 'Untitled Note'}
                            >
                                <FiFileText opacity={0.5} /> {note.title || 'Untitled Note'}
                            </Command.Item>
                        ))}
                    </Command.Group>

                </Command.List>
            </Command.Dialog>
        </>
    );
};

export default CommandPalette;
