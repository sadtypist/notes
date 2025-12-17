import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { FiX, FiPlus, FiCheck } from 'react-icons/fi';

const CategorySelector = ({ selectedCategories = [], onChange, compact = false }) => {
    const { folders } = useNotes();
    const [isOpen, setIsOpen] = useState(false);

    const getFolderById = (id) => {
        if (!folders) return null;
        return folders.find(f => f.id === id);
    };

    const handleToggleCategory = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            onChange(selectedCategories.filter(id => id !== categoryId));
        } else {
            onChange([...selectedCategories, categoryId]);
        }
    };

    const handleRemoveCategory = (categoryId, e) => {
        e.stopPropagation();
        onChange(selectedCategories.filter(id => id !== categoryId));
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Selected Categories Display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minHeight: compact ? 'auto' : '36px',
                }}
            >
                {selectedCategories.length === 0 ? (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        style={{
                            fontSize: '0.8rem',
                            padding: compact ? '0.25rem 0.5rem' : '0.5rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        <FiPlus size={14} />
                        Add Category
                    </button>
                ) : (
                    <>
                        {selectedCategories.map(catId => {
                            const cat = getFolderById(catId);
                            if (!cat) return null;
                            return (
                                <span
                                    key={catId}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        backgroundColor: cat.bgColor,
                                        color: cat.color,
                                        border: `1px solid ${cat.color}30`,
                                    }}
                                >
                                    {cat.name}
                                    <button
                                        onClick={(e) => handleRemoveCategory(catId, e)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                            color: cat.color,
                                            display: 'flex',
                                            opacity: 0.7,
                                        }}
                                    >
                                        <FiX size={12} />
                                    </button>
                                </span>
                            );
                        })}
                        <button
                            type="button"
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '0.25rem',
                                cursor: 'pointer',
                                color: 'var(--color-text-muted)',
                                display: 'flex',
                            }}
                        >
                            <FiPlus size={14} />
                        </button>
                    </>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999,
                        }}
                    />
                    {/* Dropdown Menu */}
                    <div
                        className="glass-panel"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '0.5rem',
                            minWidth: '200px',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.5rem',
                            zIndex: 1000,
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-text-muted)',
                            padding: '0.25rem 0.5rem',
                            marginBottom: '0.25rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Categories
                        </div>
                        {folders && folders.map(cat => {
                            const isSelected = selectedCategories.includes(cat.id);
                            // Use category properties for display
                            const displayName = cat.categoryName || cat.name;
                            const displayColor = cat.categoryColor || cat.color;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleToggleCategory(cat.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: 'none',
                                        background: isSelected ? `${displayColor}26` : 'transparent',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background var(--transition-fast)',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: displayColor,
                                    }} />
                                    <span style={{
                                        flex: 1,
                                        color: 'var(--color-text-primary)',
                                        fontSize: '0.875rem',
                                    }}>
                                        {displayName}
                                    </span>
                                    {isSelected && (
                                        <FiCheck size={14} style={{ color: displayColor }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default CategorySelector;
