import React, { useRef, useState, useEffect } from 'react';
import { FiX, FiCheck, FiTrash2, FiRotateCcw, FiRotateCw, FiEdit2, FiDisc } from 'react-icons/fi';

const PRESET_COLORS = [
    '#000000', // Black
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
];

const DrawingCanvas = ({ onClose, onSave }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(3);
    const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
    const [context, setContext] = useState(null);

    // History State
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (e.touches && e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return {
            offsetX: e.nativeEvent.offsetX,
            offsetY: e.nativeEvent.offsetY
        };
    };

    const saveState = React.useCallback((ctx = context, canvas = canvasRef.current) => {
        if (!ctx || !canvas) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        setHistory(prev => {
            const newHistory = prev.slice(0, historyStep + 1);
            newHistory.push(imageData);
            return newHistory;
        });
        setHistoryStep(prev => prev + 1);
    }, [context, historyStep]);

    // Initialize canvas context - RUNS ONCE
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth * 0.9;
            canvas.height = window.innerHeight * 0.8;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = color; // Initial
            ctx.lineWidth = lineWidth; // Initial
            setContext(ctx);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // We can't call saveState here easily because it depends on context state which is just being set.
            // Using a direct history push for init.
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory([imageData]);
            setHistoryStep(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentional empty dependency array for mount only

    // Update context style when state changes
    useEffect(() => {
        if (context) {
            context.lineCap = 'round';
            context.lineJoin = 'round';

            if (tool === 'eraser') {
                context.strokeStyle = '#ffffff';
                context.lineWidth = lineWidth * 2;
            } else {
                context.strokeStyle = color;
                context.lineWidth = lineWidth;
            }
        }
    }, [color, lineWidth, tool, context]);

    const undo = () => {
        if (historyStep > 0) {
            const newStep = historyStep - 1;
            const imageData = history[newStep];
            context.putImageData(imageData, 0, 0);
            setHistoryStep(newStep);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            const imageData = history[newStep];
            context.putImageData(imageData, 0, 0);
            setHistoryStep(newStep);
        }
    };

    const startDrawing = (e) => {
        const { offsetX, offsetY } = getCoordinates(e);
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(e);
        context.lineTo(offsetX, offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            context.closePath();
            setIsDrawing(false);
            saveState(); // Uses latest context/canvas refs
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        const image = canvas.toDataURL('image/png');
        onSave(image);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            {/* Toolbar */}
            <div className="glass-panel" style={{
                backgroundColor: 'var(--color-bg-primary)',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginBottom: '1rem',
                maxWidth: '95vw',
                overflowX: 'auto'
            }}>
                {/* Tools */}
                <div style={{ display: 'flex', gap: '0.5rem', borderRight: '1px solid var(--color-bg-tertiary)', paddingRight: '1rem' }}>
                    <button
                        onClick={() => setTool('pen')}
                        className={`btn ${tool === 'pen' ? 'active' : 'btn-ghost'}`}
                        title="Pen"
                        style={{ color: tool === 'pen' ? 'var(--color-accent-primary)' : 'inherit' }}
                    >
                        <FiEdit2 size={20} />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`btn ${tool === 'eraser' ? 'active' : 'btn-ghost'}`}
                        title="Eraser"
                        style={{ color: tool === 'eraser' ? 'var(--color-accent-primary)' : 'inherit' }}
                    >
                        <FiDisc size={20} /> {/* Disc icon as Eraser representation */}
                    </button>
                    <button onClick={clearCanvas} className="btn btn-ghost" title="Clear All">
                        <FiTrash2 size={20} />
                    </button>
                </div>

                {/* History */}
                <div style={{ display: 'flex', gap: '0.5rem', borderRight: '1px solid var(--color-bg-tertiary)', paddingRight: '1rem' }}>
                    <button
                        onClick={undo}
                        disabled={historyStep <= 0}
                        className="btn btn-ghost"
                        title="Undo"
                        style={{ opacity: historyStep <= 0 ? 0.3 : 1 }}
                    >
                        <FiRotateCcw size={20} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={historyStep >= history.length - 1}
                        className="btn btn-ghost"
                        title="Redo"
                        style={{ opacity: historyStep >= history.length - 1 ? 0.3 : 1 }}
                    >
                        <FiRotateCw size={20} />
                    </button>
                </div>

                {/* Properties */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Size</label>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={lineWidth}
                            onChange={(e) => setLineWidth(parseInt(e.target.value))}
                            style={{ width: '80px', height: '4px' }}
                        />
                    </div>

                    {/* Color Presets */}
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {PRESET_COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => { setColor(c); setTool('pen'); }}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: c,
                                    border: color === c && tool === 'pen' ? '2px solid white' : '2px solid transparent',
                                    boxShadow: color === c && tool === 'pen' ? '0 0 0 2px var(--color-accent-primary)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s'
                                }}
                                title={c}
                            />
                        ))}
                    </div>

                    {/* Custom Color */}
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => { setColor(e.target.value); setTool('pen'); }}
                        style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            padding: 0,
                            overflow: 'hidden'
                        }}
                        title="Custom Color"
                    />
                </div>

                <div style={{ width: '1px', height: '24px', background: 'var(--color-bg-tertiary)', margin: '0 0.5rem' }} />

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={onClose} className="btn btn-ghost" title="Cancel">
                        <FiX size={20} />
                    </button>
                    <button onClick={handleSave} className="btn" style={{ background: 'var(--color-accent-primary)', color: 'white', padding: '0.5rem 1rem' }}>
                        Save <FiCheck />
                    </button>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-lg)',
                    cursor: tool === 'eraser' ? 'cell' : 'crosshair',
                    touchAction: 'none',
                    boxShadow: 'var(--shadow-lg)'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>
    );
};

export default DrawingCanvas;
