'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';

interface ControlPanelProps {
  onPlayDash: () => void;
  onPlayDrmDash: () => void;
  drmType: string;
  onDrmTypeChange: (type: string) => void;
  onShowDrmInfo: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onPlayDash, 
  onPlayDrmDash, 
  drmType, 
  onDrmTypeChange, 
  onShowDrmInfo 
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | HTMLDivElement | null)[]>([]);

  const buttons = useMemo(() => [
    { id: 'play-dash', label: 'Play DASH Content', action: onPlayDash },
    { id: 'play-drm-dash', label: 'Play DRM + DASH', action: onPlayDrmDash },
    { id: 'drm-info', label: 'DRM Info', action: onShowDrmInfo },
    { id: 'drm-toggle', label: 'DRM Toggle', action: null }
  ], [onPlayDash, onPlayDrmDash, onShowDrmInfo]);

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
          if (focusedIndex < 3 && buttons[focusedIndex].action) {
            buttons[focusedIndex].action!();
          } else if (focusedIndex === 3) {
            // Toggle DRM type
            onDrmTypeChange(drmType === 'widevine' ? 'playready' : 'widevine');
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
  }, [focusedIndex, buttons, drmType, onDrmTypeChange]);

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
    <div className="control-panel" style={{ textAlign: 'left' }}>
      <h2 style={{ marginBottom: '30px', color: '#00aaff' }}>DASH Player Controls</h2>
      
      <div className="button-group">
        <button
          ref={el => { buttonRefs.current[0] = el; }}
          className={`focusable ${focusedIndex === 0 ? 'focused' : ''}`}
          onClick={() => handleButtonClick(0, onPlayDash)}
          style={{ 
            width: '100%', 
            marginBottom: '15px',
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            backgroundColor: focusedIndex === 0 ? '#00aaff' : '#444'
          }}
        >
          🎬 Play DASH Content
        </button>

        <button
          ref={el => { buttonRefs.current[1] = el; }}
          className={`focusable ${focusedIndex === 1 ? 'focused' : ''}`}
          onClick={() => handleButtonClick(1, onPlayDrmDash)}
          style={{ 
            width: '100%', 
            marginBottom: '15px',
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            backgroundColor: focusedIndex === 1 ? '#00aaff' : '#444'
          }}
        >
          🔒 Play DRM + DASH
        </button>

        <button
          ref={el => { buttonRefs.current[2] = el; }}
          className={`focusable ${focusedIndex === 2 ? 'focused' : ''}`}
          onClick={() => handleButtonClick(2, onShowDrmInfo)}
          style={{ 
            width: '100%', 
            marginBottom: '15px',
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            backgroundColor: focusedIndex === 2 ? '#00aaff' : '#444'
          }}
        >
          🛡️ DRM Info
        </button>
      </div>

      <div className="drm-selection" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#ccc' }}>DRM Technology</h3>
        
        <div 
          className={`toggle-container focusable ${focusedIndex === 3 ? 'focused' : ''}`}
          ref={el => { buttonRefs.current[3] = el; }}
          tabIndex={0}
          onClick={() => {
            setFocusedIndex(3);
            onDrmTypeChange(drmType === 'widevine' ? 'playready' : 'widevine');
          }}
          style={{
            border: focusedIndex === 3 ? '2px solid #00aaff' : '2px solid transparent',
            borderRadius: '4px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#333'
          }}
        >
          <span style={{ color: drmType === 'widevine' ? '#00aaff' : '#666' }}>
            Widevine
          </span>
          <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
            <input
              type="checkbox"
              checked={drmType === 'playready'}
              onChange={() => onDrmTypeChange(drmType === 'widevine' ? 'playready' : 'widevine')}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span className="slider" style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#ccc',
              transition: '.4s',
              borderRadius: '20px'
            }}></span>
            <span style={{
              position: 'absolute',
              content: '""',
              height: '16px',
              width: '16px',
              left: drmType === 'playready' ? '22px' : '2px',
              bottom: '2px',
              backgroundColor: 'white',
              transition: '.4s',
              borderRadius: '50%'
            }}></span>
          </label>
          <span style={{ color: drmType === 'playready' ? '#00aaff' : '#666' }}>
            PlayReady
          </span>
        </div>
        
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#888' }}>
          Current: <span style={{ color: '#00aaff', fontWeight: 'bold' }}>
            {drmType.charAt(0).toUpperCase() + drmType.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

