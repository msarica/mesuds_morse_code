import React from 'react';
import './MainMenu.css';

interface MainMenuProps {
  onSelectMode: (mode: 'encode' | 'decode') => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectMode }) => {
  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="app-title">Morse Code Translator</h1>
        <p className="app-subtitle">Translate text to morse code and back</p>
        
        <div className="menu-buttons">
          <button 
            className="menu-button encode-button"
            onClick={() => onSelectMode('encode')}
          >
            <div className="button-icon">📝</div>
            <div className="button-content">
              <h3>Encode</h3>
              <p>Text to Morse Code</p>
            </div>
          </button>
          
          <button 
            className="menu-button decode-button"
            onClick={() => onSelectMode('decode')}
          >
            <div className="button-icon">🔤</div>
            <div className="button-content">
              <h3>Decode</h3>
              <p>Morse Code to Text</p>
            </div>
          </button>
        </div>
        
        <div className="menu-footer">
          <p>Tap any option to get started</p>
        </div>
      </div>
    </div>
  );
};
