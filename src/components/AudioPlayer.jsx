import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiTrash2, FiFileText } from 'react-icons/fi';

const AudioPlayer = ({ audioData, onDelete, onTranscribe }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [localTranscript, setLocalTranscript] = useState(audioData.transcript || '');
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Update local transcript when audioData changes
    useEffect(() => {
        setLocalTranscript(audioData.transcript || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioData.transcript]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio) return;

        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * duration;
    };

    const handleTranscribe = async () => {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }

        setIsTranscribing(true);
        setLocalTranscript('');

        const audio = audioRef.current;
        if (!audio) {
            setIsTranscribing(false);
            return;
        }

        let fullTranscript = '';
        let isAudioEnded = false;
        let recognition = null;
        let restartTimeout = null;

        const createRecognition = () => {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';
            rec.maxAlternatives = 1;
            return rec;
        };

        const startRecognition = () => {
            if (isAudioEnded) return;

            recognition = createRecognition();

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        fullTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
                setLocalTranscript(fullTranscript + interimTranscript);
            };

            recognition.onerror = (event) => {
                // For any error, try to restart if audio is still playing
                if (!isAudioEnded && ['no-speech', 'audio-capture', 'network', 'aborted'].includes(event.error)) {
                    clearTimeout(restartTimeout);
                    restartTimeout = setTimeout(startRecognition, 100);
                }
            };

            recognition.onend = () => {
                if (!isAudioEnded) {
                    // Immediately restart if audio is still playing
                    clearTimeout(restartTimeout);
                    restartTimeout = setTimeout(startRecognition, 50);
                } else {
                    // Finalize
                    setIsTranscribing(false);
                    if (fullTranscript.trim()) {
                        onTranscribe?.(audioData.id, fullTranscript.trim());
                    }
                }
            };

            try {
                recognition.start();
            } catch {
                if (!isAudioEnded) {
                    restartTimeout = setTimeout(startRecognition, 100);
                }
            }
        };

        // Start recognition and play audio
        try {
            audio.currentTime = 0;
            startRecognition();
            await audio.play();
            setIsPlaying(true);

            // Handle audio end
            audio.onended = () => {
                isAudioEnded = true;
                setIsPlaying(false);
                clearTimeout(restartTimeout);

                // Wait for final results then stop
                setTimeout(() => {
                    if (recognition) {
                        try {
                            recognition.stop();
                        } catch {
                            // Already stopped
                            setIsTranscribing(false);
                            if (fullTranscript.trim()) {
                                onTranscribe?.(audioData.id, fullTranscript.trim());
                            }
                        }
                    }
                }, 1000);
            };
        } catch (err) {
            console.error('Error starting transcription:', err);
            setIsTranscribing(false);
            clearTimeout(restartTimeout);
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="audio-player-wrapper">
            <div className="audio-player">
                <audio ref={audioRef} src={audioData.base64} preload="metadata" />

                <button
                    onClick={togglePlayPause}
                    className="btn play-pause-btn"
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <FiPause /> : <FiPlay />}
                </button>

                <div className="audio-progress-container" onClick={handleSeek}>
                    <div
                        className="audio-progress-bar"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                </div>

                <span className="audio-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <button
                    onClick={handleTranscribe}
                    className={`btn btn-ghost transcribe-btn ${isTranscribing ? 'transcribing' : ''}`}
                    title="Transcribe"
                    disabled={isTranscribing}
                >
                    <FiFileText />
                </button>

                <button
                    onClick={() => onDelete(audioData.id)}
                    className="btn btn-ghost delete-audio-btn"
                    title="Delete Recording"
                >
                    <FiTrash2 />
                </button>
            </div>

            {/* Transcript Display */}
            {(localTranscript || isTranscribing) && (
                <div className="audio-transcript">
                    {isTranscribing && !localTranscript && (
                        <span className="transcript-loading">Listening...</span>
                    )}
                    {localTranscript && (
                        <p className="transcript-text">{localTranscript}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;
