import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    const [isFocusMode, setIsFocusMode] = useState(false);

    const toggleFocusMode = () => setIsFocusMode(prev => !prev);

    return (
        <UIContext.Provider value={{
            isFocusMode,
            toggleFocusMode,
            setIsFocusMode
        }}>
            {children}
        </UIContext.Provider>
    );
};
