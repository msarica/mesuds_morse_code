import { useCallback, useRef, useState, useEffect } from 'react';
import { morseToTiming, DEFAULT_TIMING } from '../utils/morseCode';
import type { MorseTiming } from '../utils/morseCode';

export interface AudioControls {
    isPlaying: boolean;
    play: () => void;
    stop: () => void;
    volume: number;
    setVolume: (volume: number) => void;
}

export function useMorseAudio(
    morseCode: string,
    timing: MorseTiming = DEFAULT_TIMING
): AudioControls {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const audioContextRef = useRef<AudioContext | null>(null);
    const isPlayingRef = useRef(false);
    const timeoutRefs = useRef<number[]>([]);
    const activeOscillatorsRef = useRef<OscillatorNode[]>([]);

    const createAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    const createOscillator = useCallback(() => {
        const audioContext = createAudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz tone

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        return { oscillator, gainNode };
    }, [createAudioContext]);

    const playTone = useCallback((duration: number) => {
        return new Promise<void>((resolve) => {
            try {
                const { oscillator, gainNode } = createOscillator();
                const audioContext = audioContextRef.current!;

                // Add to active oscillators for cleanup
                activeOscillatorsRef.current.push(oscillator);

                const now = audioContext.currentTime;

                console.log(`Playing tone with volume: ${volume}`);

                // Fade in
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);

                // Fade out
                gainNode.gain.setValueAtTime(volume, now + duration - 0.01);
                gainNode.gain.linearRampToValueAtTime(0, now + duration);

                oscillator.start(now);
                oscillator.stop(now + duration);

                // Fallback timeout in case onended doesn't fire
                const fallbackTimeout = window.setTimeout(() => {
                    try {
                        oscillator.stop();
                    } catch (e) {
                        // Oscillator might already be stopped
                    }
                    // Remove from active oscillators
                    const index = activeOscillatorsRef.current.indexOf(oscillator);
                    if (index > -1) {
                        activeOscillatorsRef.current.splice(index, 1);
                    }
                    resolve();
                }, duration + 10); // 10ms buffer

                oscillator.onended = () => {
                    window.clearTimeout(fallbackTimeout);
                    // Remove from active oscillators
                    const index = activeOscillatorsRef.current.indexOf(oscillator);
                    if (index > -1) {
                        activeOscillatorsRef.current.splice(index, 1);
                    }
                    resolve();
                };
            } catch (error) {
                console.error('Error in playTone:', error);
                resolve(); // Resolve anyway to continue the sequence
            }
        });
    }, [createOscillator, volume]);

    const playSilence = useCallback((duration: number) => {
        return new Promise<void>((resolve) => {
            const timeout = window.setTimeout(() => {
                resolve();
            }, duration);
            timeoutRefs.current.push(timeout);
        });
    }, []);

    const play = useCallback(async () => {
        if (isPlayingRef.current || !morseCode.trim()) return;

        setIsPlaying(true);
        isPlayingRef.current = true;

        try {
            // Resume audio context if suspended (required for mobile browsers)
            const audioContext = createAudioContext();

            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const timingSequence = morseToTiming(morseCode, timing);

            for (let i = 0; i < timingSequence.length; i++) {
                if (!isPlayingRef.current) break; // Check if stopped

                const duration = timingSequence[i];
                console.log(`Step ${i}: Playing ${i % 2 === 0 ? 'tone' : 'pause'} for ${duration}ms`);

                if (i % 2 === 0) {
                    // Even indices are tones
                    await playTone(duration);
                    console.log(`Step ${i}: Tone completed`);
                } else {
                    // Odd indices are pauses
                    await playSilence(duration);
                    console.log(`Step ${i}: Pause completed`);
                }
            }
        } catch (error) {
            console.error('Error playing morse code:', error);
        } finally {
            setIsPlaying(false);
            isPlayingRef.current = false;
        }
    }, [morseCode, timing, createAudioContext, playTone, playSilence]);

    const stop = useCallback(() => {
        setIsPlaying(false);
        isPlayingRef.current = false;

        // Stop all active oscillators
        activeOscillatorsRef.current.forEach(oscillator => {
            try {
                oscillator.stop();
            } catch (error) {
                // Oscillator might already be stopped
            }
        });
        activeOscillatorsRef.current = [];

        // Clear all timeouts
        timeoutRefs.current.forEach(timeout => window.clearTimeout(timeout));
        timeoutRefs.current = [];
    }, []);

    const setVolumeCallback = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        console.log('Setting volume to:', clampedVolume);
        setVolume(clampedVolume);
    }, []);

    // Cleanup effect
    useEffect(() => {
        return () => {
            // Stop all audio when component unmounts
            stop();
        };
    }, [stop]);

    return {
        isPlaying,
        play,
        stop,
        volume,
        setVolume: setVolumeCallback,
    };
}
