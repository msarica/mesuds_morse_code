import React, { useState, useCallback, useEffect } from 'react';
import { decodeFromMorse } from '../utils/morseCode';
import { useMorseAudio } from '../hooks/useMorseAudio';
import './DecodeMode.css';

interface DecodeModeProps {
  onBack: () => void;
}

export const DecodeMode: React.FC<DecodeModeProps> = ({ onBack }) => {
  const [inputMorse, setInputMorse] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const [currentLetter, setCurrentLetter] = useState('');
  
  const audioControls = useMorseAudio(inputMorse);

  // Auto-decode when morse code changes
  useEffect(() => {
    if (inputMorse.trim() === '') {
      setDecodedText('');
      setCurrentLetter('');
      return;
    }
    
    try {
      // Use regular decode since we're manually adding spaces
      const decoded = decodeFromMorse(inputMorse);
      setDecodedText(decoded);
      
      // Show the last decoded letter
      if (decoded.length > 0) {
        setCurrentLetter(decoded[decoded.length - 1]);
      }
    } catch (err) {
      setDecodedText('');
      setCurrentLetter('');
    }
  }, [inputMorse]);

  const handleAddDot = useCallback(() => {
    setInputMorse(prev => prev + '.');
  }, []);

  const handleAddDash = useCallback(() => {
    setInputMorse(prev => prev + '-');
  }, []);

  const handleAddSpace = useCallback(() => {
    setInputMorse(prev => prev + ' ');
  }, []);

  const handleBackspace = useCallback(() => {
    setInputMorse(prev => prev.slice(0, -1));
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
    } catch (error) {
      console.error('Failed to copy decoded text:', error);
    }
  }, [decodedText]);

  const handleClear = useCallback(() => {
    setInputMorse('');
    setDecodedText('');
    setCurrentLetter('');
  }, []);

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
          <label className="input-label">
            Click to build morse code:
          </label>
          <div className="morse-buttons">
            <button 
              className="morse-button dot-button"
              onClick={handleAddDot}
            >
              <span className="morse-symbol">•</span>
              <span className="morse-label">DOT</span>
            </button>
            <button 
              className="morse-button dash-button"
              onClick={handleAddDash}
            >
              <span className="morse-symbol">—</span>
              <span className="morse-label">DASH</span>
            </button>
            <button 
              className="morse-button space-button"
              onClick={handleAddSpace}
            >
              <span className="morse-symbol">␣</span>
              <span className="morse-label">SPACE</span>
            </button>
            <button 
              className="morse-button backspace-button"
              onClick={handleBackspace}
            >
              <span className="morse-symbol">⌫</span>
              <span className="morse-label">DELETE</span>
            </button>
          </div>
          <div className="morse-display">
            <div className="morse-sequence">
              {inputMorse || 'Click buttons to build morse code...'}
            </div>
            {currentLetter && (
              <div className="current-letter">
                Current letter: <strong>{currentLetter.toUpperCase()}</strong>
              </div>
            )}
          </div>
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
