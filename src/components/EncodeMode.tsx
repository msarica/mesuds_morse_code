import React, { useState, useCallback } from 'react';
import { encodeToMorse } from '../utils/morseCode';
import { useMorseAudio } from '../hooks/useMorseAudio';
import './EncodeMode.css';

interface EncodeModeProps {
  onBack: () => void;
}

export const EncodeMode: React.FC<EncodeModeProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [morseCode, setMorseCode] = useState('');
  
  const audioControls = useMorseAudio(morseCode);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setMorseCode(encodeToMorse(text));
  }, []);

  const handlePlayMorse = useCallback(() => {
    if (morseCode.trim()) {
      audioControls.play();
    }
  }, [morseCode, audioControls]);

  const handleStopMorse = useCallback(() => {
    audioControls.stop();
  }, [audioControls]);

  const handleCopyMorse = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(morseCode);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy morse code:', error);
    }
  }, [morseCode]);

  const handleClear = useCallback(() => {
    setInputText('');
    setMorseCode('');
  }, []);

  return (
    <div className="encode-mode">
      <div className="mode-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>Encode to Morse Code</h2>
      </div>

      <div className="mode-content">
        <div className="input-section">
          <label htmlFor="text-input" className="input-label">
            Enter text to encode:
          </label>
          <textarea
            id="text-input"
            className="text-input"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            rows={4}
          />
        </div>

        <div className="output-section">
          <div className="output-header">
            <label className="output-label">Morse Code:</label>
            <div className="output-actions">
              <button 
                className="action-button play-button"
                onClick={audioControls.isPlaying ? handleStopMorse : handlePlayMorse}
                disabled={!morseCode.trim()}
              >
                {audioControls.isPlaying ? '⏹️ Stop' : '🔊 Play'}
              </button>
              <button 
                className="action-button copy-button"
                onClick={handleCopyMorse}
                disabled={!morseCode.trim()}
              >
                📋 Copy
              </button>
              <button 
                className="action-button clear-button"
                onClick={handleClear}
                disabled={!inputText.trim()}
              >
                🗑️ Clear
              </button>
            </div>
          </div>
          <div className="morse-output">
            {morseCode || 'Morse code will appear here...'}
          </div>
        </div>

        <div className="volume-control">
          <label htmlFor="volume-slider">Volume:</label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={audioControls.volume}
            onChange={(e) => audioControls.setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
          <span className="volume-value">{Math.round(audioControls.volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
