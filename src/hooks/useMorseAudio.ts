import { useCallback, useRef, useState } from 'react';
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
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const timeoutRefs = useRef<number[]>([]);

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

        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;

        return { oscillator, gainNode };
    }, [createAudioContext]);

    const playTone = useCallback((duration: number) => {
        return new Promise<void>((resolve) => {
            const { oscillator, gainNode } = createOscillator();
            const audioContext = audioContextRef.current!;

            const now = audioContext.currentTime;

            // Fade in
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);

            // Fade out
            gainNode.gain.setValueAtTime(volume, now + duration - 0.01);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);

            oscillator.start(now);
            oscillator.stop(now + duration);

            oscillator.onended = () => {
                resolve();
            };
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
        if (isPlaying || !morseCode.trim()) return;

        setIsPlaying(true);

        try {
            // Resume audio context if suspended (required for mobile browsers)
            const audioContext = createAudioContext();
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const timingSequence = morseToTiming(morseCode, timing);

            for (let i = 0; i < timingSequence.length; i++) {
                if (!isPlaying) break; // Check if stopped

                const duration = timingSequence[i];

                if (i % 2 === 0) {
                    // Even indices are tones
                    await playTone(duration);
                } else {
                    // Odd indices are pauses
                    await playSilence(duration);
                }
            }
        } catch (error) {
            console.error('Error playing morse code:', error);
        } finally {
            setIsPlaying(false);
        }
    }, [isPlaying, morseCode, timing, createAudioContext, playTone, playSilence]);

    const stop = useCallback(() => {
        setIsPlaying(false);

        // Stop oscillator
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
            } catch (error) {
                // Oscillator might already be stopped
            }
            oscillatorRef.current = null;
        }

        // Clear all timeouts
        timeoutRefs.current.forEach(timeout => window.clearTimeout(timeout));
        timeoutRefs.current = [];

        // Disconnect audio nodes
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
        }
    }, []);

    const setVolumeCallback = useCallback((newVolume: number) => {
        setVolume(Math.max(0, Math.min(1, newVolume)));
    }, []);

    return {
        isPlaying,
        play,
        stop,
        volume,
        setVolume: setVolumeCallback,
    };
}
