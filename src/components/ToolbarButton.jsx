import React from 'react';

const ToolbarButton = ({ icon, onClick, tooltip }) => (
    <button
        onClick={onClick}
        title={tooltip}
        className="btn-ghost"
        style={{ padding: '0.5rem', fontSize: '1.1rem' }}
    >
        {icon}
    </button>
);

export default ToolbarButton;
