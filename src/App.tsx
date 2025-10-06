import { useState } from 'react'
import { MainMenu } from './components/MainMenu'
import { EncodeMode } from './components/EncodeMode'
import { DecodeMode } from './components/DecodeMode'
import './App.css'

type AppMode = 'menu' | 'encode' | 'decode'

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('menu')

  const handleModeSelect = (mode: 'encode' | 'decode') => {
    setCurrentMode(mode)
  }

  const handleBackToMenu = () => {
    setCurrentMode('menu')
  }

  return (
    <div className="app">
      {currentMode === 'menu' && (
        <MainMenu onSelectMode={handleModeSelect} />
      )}
      {currentMode === 'encode' && (
        <EncodeMode onBack={handleBackToMenu} />
      )}
      {currentMode === 'decode' && (
        <DecodeMode onBack={handleBackToMenu} />
      )}
    </div>
  )
}

export default App
