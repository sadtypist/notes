import React, { useState, useRef, useEffect } from 'react';
import { FiMic, FiSquare } from 'react-icons/fi';

const VoiceRecorder = ({ onRecordingComplete, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    onRecordingComplete({
                        base64: reader.result,
                        duration: duration
                    });
                };
                reader.readAsDataURL(blob);

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="voice-recorder">
            {!isRecording ? (
                <button
                    onClick={startRecording}
                    className="btn btn-primary recorder-btn"
                    title="Start Recording"
                >
                    <FiMic /> Record
                </button>
            ) : (
                <div className="recording-controls">
                    <div className="recording-indicator">
                        <span className="recording-dot"></span>
                        <span className="recording-time">{formatTime(duration)}</span>
                    </div>
                    <button
                        onClick={stopRecording}
                        className="btn stop-btn"
                        title="Stop Recording"
                    >
                        <FiSquare /> Stop
                    </button>
                    <button
                        onClick={() => {
                            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                                mediaRecorderRef.current.stop();
                            }
                            if (timerRef.current) clearInterval(timerRef.current);
                            setIsRecording(false);
                            onCancel?.();
                        }}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
