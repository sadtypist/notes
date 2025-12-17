import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import LZString from 'lz-string';
import { FiAlertCircle, FiCopy, FiCheck } from 'react-icons/fi';

const SharedNote = () => {
    const location = useLocation();
    const [note, setNote] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        try {
            const params = new URLSearchParams(location.search);
            const data = params.get('data');

            if (!data) {
                setError('No note data found in link.');
                return;
            }

            const decompressed = LZString.decompressFromEncodedURIComponent(data);
            if (!decompressed) {
                setError('Failed to decompress note. Link might be broken.');
                return;
            }

            const parsed = JSON.parse(decompressed);
            setNote(parsed);
        } catch (err) {
            console.error(err);
            setError('Invalid note data.');
        }
    }, [location]);

    const handleCopyContent = () => {
        if (!note) return;
        // Strip HTML for simple clipboard copy, or just copy text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        const text = tempDiv.textContent || tempDiv.innerText || "";
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (error) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <FiAlertCircle size={48} color="var(--color-danger)" />
                <h2 style={{ margin: '1rem 0' }}>Oops!</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
                    Go to EaseNotes
                </Link>
            </div>
        );
    }

    if (!note) {
        return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="container" style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '2rem 1rem',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
                borderBottom: '1px solid var(--color-bg-tertiary)',
                paddingBottom: '1rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--color-accent-primary)',
                        fontWeight: '600'
                    }}>
                        Shared via EaseNotes
                    </span>
                    <h1 style={{
                        fontSize: '2rem',
                        margin: '0.5rem 0 0 0',
                        color: 'var(--color-text-primary)'
                    }}>{note.title || 'Untitled Note'}</h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={handleCopyContent}
                        className="btn btn-ghost"
                        title="Copy text content"
                    >
                        {copied ? <FiCheck /> : <FiCopy />} {copied ? 'Copied' : 'Copy Text'}
                    </button>
                    <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        Create Your Own
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div
                className="editor-content"
                style={{
                    flex: 1,
                    fontSize: '1.2rem',
                    lineHeight: '1.8',
                    color: 'var(--color-text-primary)',
                    paddingBottom: '4rem'
                }}
                dangerouslySetInnerHTML={{ __html: note.content }}
            />
        </div>
    );
};

export default SharedNote;
