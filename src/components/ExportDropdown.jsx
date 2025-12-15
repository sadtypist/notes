import React, { useState, useRef, useEffect } from 'react';
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi';
import { exportAsPDF, exportAsDOCX, exportAsTXT } from '../utils/exportNote';

const ExportDropdown = ({ title, getContent }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = async (format) => {
        setIsExporting(true);
        const content = getContent();

        try {
            switch (format) {
                case 'pdf':
                    exportAsPDF(title, content);
                    break;
                case 'docx':
                    await exportAsDOCX(title, content);
                    break;
                case 'txt':
                    exportAsTXT(title, content);
                    break;
                default:
                    console.error('Unknown export format:', format);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
            setIsOpen(false);
        }
    };

    const exportOptions = [
        { format: 'pdf', label: 'PDF Document', icon: <FiFileText /> },
        { format: 'docx', label: 'Word Document', icon: <FiFile /> },
        { format: 'txt', label: 'Plain Text', icon: <FiFileText /> },
    ];

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost"
                title="Export Note"
                disabled={isExporting}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-accent-primary)'
                }}
            >
                <FiDownload />
                <span style={{ fontSize: '0.875rem' }}>Export</span>
            </button>

            {isOpen && (
                <div
                    className="glass-panel"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        minWidth: '180px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        zIndex: 1000,
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    {exportOptions.map((option) => (
                        <button
                            key={option.format}
                            onClick={() => handleExport(option.format)}
                            disabled={isExporting}
                            className="export-option-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-primary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center' }}>{option.icon}</span>
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;
