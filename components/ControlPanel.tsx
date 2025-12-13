'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';

interface ControlPanelProps {
  onPlayDash: () => void;
  onPlayDrmDash: () => void;
  onShowDrmInfo: () => void;
  onStop: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onPlayDash, 
  onPlayDrmDash, 
  onShowDrmInfo,
  onStop
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | HTMLDivElement | null)[]>([]);

  const buttons = useMemo(() => [
    { id: 'play-dash', label: 'Play DASH Content', action: onPlayDash },
    { id: 'play-drm-dash', label: 'Play DRM + DASH', action: onPlayDrmDash },
    { id: 'stop', label: 'Stop Playback', action: onStop },
    { id: 'drm-info', label: 'DRM Info', action: onShowDrmInfo }
  ], [onPlayDash, onPlayDrmDash, onStop, onShowDrmInfo]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => (prev + 1) % buttons.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => (prev - 1 + buttons.length) % buttons.length);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          const action = buttons[focusedIndex]?.action;
          if (action) {
            action();
          }
          break;
        case 'ArrowRight':
        case 'ArrowLeft':
          // Allow navigation to video player or logs
          if (event.key === 'ArrowRight') {
            // Focus could move to video player area
            // event.preventDefault();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, buttons]);

  useEffect(() => {
    // Focus the current button
    if (buttonRefs.current[focusedIndex]) {
      buttonRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleButtonClick = (index: number, action?: (() => void) | null) => {
    setFocusedIndex(index);
    if (action) {
      action();
    }
  };

  return (
    <div className="control-panel">
      <h1 className="panel-title">Player Controls</h1>
      
      <div className="button-group">
        <button
          ref={el => { buttonRefs.current[0] = el; }}
          className={`btn-primary ${focusedIndex === 0 ? 'focused' : ''}`}
          onClick={() => handleButtonClick(0, onPlayDash)}
        >
          <span>🎬</span> Play DASH Content
        </button>

        <button
          ref={el => { buttonRefs.current[1] = el; }}
          className={`btn-primary ${focusedIndex === 1 ? 'focused' : ''}`}
          onClick={() => handleButtonClick(1, onPlayDrmDash)}
        >
          <span>🔒</span> Play DRM + DASH
        </button>

        <button
          ref={el => { buttonRefs.current[2] = el; }}
          className={`btn-primary ${focusedIndex === 2 ? 'focused' : ''}`}
          onClick={() => handleButtonClick(2, onStop)}
        >
          <span>⏹️</span> Stop Playback
        </button>

        <button
          ref={el => { buttonRefs.current[3] = el; }}
          className={`btn-primary ${focusedIndex === 3 ? 'focused' : ''}`}
          onClick={() => handleButtonClick(3, onShowDrmInfo)}
        >
          <span>🛡️</span> DRM Info
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;

