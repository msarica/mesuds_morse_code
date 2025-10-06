import React, { useState, useCallback } from 'react';
import { decodeFromMorse, isValidMorse } from '../utils/morseCode';
import { useMorseAudio } from '../hooks/useMorseAudio';
import './DecodeMode.css';

interface DecodeModeProps {
  onBack: () => void;
}

export const DecodeMode: React.FC<DecodeModeProps> = ({ onBack }) => {
  const [inputMorse, setInputMorse] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const [error, setError] = useState('');
  
  const audioControls = useMorseAudio(inputMorse);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const morse = e.target.value;
    setInputMorse(morse);
    
    if (morse.trim() === '') {
      setDecodedText('');
      setError('');
      return;
    }
    
    if (!isValidMorse(morse)) {
      setError('Invalid morse code. Only dots (.), dashes (-), and spaces are allowed.');
      setDecodedText('');
      return;
    }
    
    setError('');
    try {
      const decoded = decodeFromMorse(morse);
      setDecodedText(decoded);
    } catch (err) {
      setError('Failed to decode morse code. Please check your input.');
      setDecodedText('');
    }
  }, []);

  const handlePlayMorse = useCallback(() => {
    if (inputMorse.trim()) {
      audioControls.play();
    }
  }, [inputMorse, audioControls]);

  const handleStopMorse = useCallback(() => {
    audioControls.stop();
  }, [audioControls]);

  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(decodedText);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy decoded text:', error);
    }
  }, [decodedText]);

  const handleClear = useCallback(() => {
    setInputMorse('');
    setDecodedText('');
    setError('');
  }, []);

  const handlePasteMorse = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputMorse(text);
      handleInputChange({ target: { value: text } } as React.ChangeEvent<HTMLTextAreaElement>);
    } catch (error) {
      console.error('Failed to paste morse code:', error);
    }
  }, [handleInputChange]);

  return (
    <div className="decode-mode">
      <div className="mode-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>Decode from Morse Code</h2>
      </div>

      <div className="mode-content">
        <div className="input-section">
          <label htmlFor="morse-input" className="input-label">
            Enter morse code to decode:
          </label>
          <textarea
            id="morse-input"
            className="morse-input"
            value={inputMorse}
            onChange={handleInputChange}
            placeholder="Enter morse code using dots (.) and dashes (-)..."
            rows={4}
          />
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>

        <div className="output-section">
          <div className="output-header">
            <label className="output-label">Decoded Text:</label>
            <div className="output-actions">
              <button 
                className="action-button play-button"
                onClick={audioControls.isPlaying ? handleStopMorse : handlePlayMorse}
                disabled={!inputMorse.trim()}
              >
                {audioControls.isPlaying ? '⏹️ Stop' : '🔊 Play'}
              </button>
              <button 
                className="action-button copy-button"
                onClick={handleCopyText}
                disabled={!decodedText.trim()}
              >
                📋 Copy
              </button>
              <button 
                className="action-button paste-button"
                onClick={handlePasteMorse}
              >
                📥 Paste
              </button>
              <button 
                className="action-button clear-button"
                onClick={handleClear}
                disabled={!inputMorse.trim()}
              >
                🗑️ Clear
              </button>
            </div>
          </div>
          <div className="text-output">
            {decodedText || 'Decoded text will appear here...'}
          </div>
        </div>

        <div className="help-section">
          <h3>Morse Code Help</h3>
          <div className="help-content">
            <div className="help-item">
              <strong>•</strong> (dot) = Short signal
            </div>
            <div className="help-item">
              <strong>-</strong> (dash) = Long signal
            </div>
            <div className="help-item">
              <strong>Space</strong> = Separates letters
            </div>
            <div className="help-item">
              <strong>Multiple spaces</strong> = Separates words
            </div>
          </div>
          <div className="example-section">
            <h4>Example:</h4>
            <div className="example">
              <code>.... . .-.. .-.. ---</code> = <strong>hello</strong>
            </div>
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
