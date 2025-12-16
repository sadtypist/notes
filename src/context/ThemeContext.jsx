import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_THEMES } from '../data/themes';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // 1. Load Custom Themes from localStorage
    const [customThemes, setCustomThemes] = useState(() => {
        try {
            const saved = localStorage.getItem('easeNotes_customThemes');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse custom themes", e);
            return [];
        }
    });

    // 2. Load Active Theme ID
    const [themeId, setThemeId] = useState(() => {
        return localStorage.getItem('easeNotes_themeId') || 'midnight-slate';
    });

    // 3. Helper to find the full theme object
    const getThemeObject = (id) => {
        // Search custom themes first, then defaults
        const custom = customThemes.find(t => t.id === id);
        if (custom) return custom;

        const defaultTheme = DEFAULT_THEMES.find(t => t.id === id);
        return defaultTheme || DEFAULT_THEMES[0]; // Fallback
    };

    // 4. Apply CSS Variables
    useEffect(() => {
        const theme = getThemeObject(themeId);
        if (!theme) return;

        const root = document.documentElement;

        // Apply Variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Set data-theme attribute (mostly for external CSS hooks if any)
        root.setAttribute('data-theme', theme.type);

        // Persist ID
        localStorage.setItem('easeNotes_themeId', themeId);
    }, [themeId, customThemes]);

    // Persist Custom Themes whenever they change
    useEffect(() => {
        localStorage.setItem('easeNotes_customThemes', JSON.stringify(customThemes));
    }, [customThemes]);

    // Actions
    const applyTheme = (id) => setThemeId(id);

    const createCustomTheme = (newTheme) => {
        setCustomThemes(prev => [...prev, newTheme]);
        setThemeId(newTheme.id); // Auto-select created theme
    };

    const deleteCustomTheme = (id) => {
        setCustomThemes(prev => prev.filter(t => t.id !== id));
        if (themeId === id) {
            setThemeId(DEFAULT_THEMES[0].id); // Revert to default if active theme is deleted
        }
    };

    const value = {
        themeId,
        currentTheme: getThemeObject(themeId),
        defaultThemes: DEFAULT_THEMES,
        customThemes,
        applyTheme,
        createCustomTheme,
        deleteCustomTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
