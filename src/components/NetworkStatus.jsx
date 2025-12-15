import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { FiWifiOff } from 'react-icons/fi';

const NetworkStatus = () => {
    const isOnline = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed',
            bottom: '1rem',
            left: '1rem',
            backgroundColor: 'var(--color-danger)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            fontSize: '0.875rem',
            fontWeight: '500'
        }}>
            <FiWifiOff />
            <span>Offline Mode</span>
        </div>
    );
};

export default NetworkStatus;
