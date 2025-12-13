'use client';
import React, { useEffect, useRef } from 'react';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'event';
}

interface LogsPanelProps {
  logs: LogEntry[];
  currentUrl: string;
  currentDrmTech: string;
  isFocused?: boolean;
}

const LogsPanel: React.FC<LogsPanelProps> = ({ logs, currentUrl, currentDrmTech, isFocused = false }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'event':
        return '🔔';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="logs-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {isFocused && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#3b82f6',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          pointerEvents: 'none',
          zIndex: 1000
        }}>
          Logs Panel Focused | ↑: Back to Player
        </div>
      )}
      {/* Status Bar */}
      <div className="logs-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h3 className="logs-title">Player Logs</h3>
          <span className="logs-meta">
            Total: {logs.length} entries
          </span>
        </div>
        
        <div className="logs-meta" style={{ display: 'flex', gap: '20px' }}>
          {currentUrl && (
            <div>
              <span>URL: </span>
              <span style={{ color: 'var(--primary)' }}>
                {currentUrl.length > 50 ? `...${currentUrl.slice(-50)}` : currentUrl}
              </span>
            </div>
          )}
          {currentDrmTech && (
            <div>
              <span>DRM: </span>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                {currentDrmTech}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Logs Container */}
      <div className="logs-content">
        {logs.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: 'var(--text-muted)',
            fontSize: '1rem'
          }}>
            No logs yet. Start playing content to see events...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`log-entry ${log.type}`}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ marginRight: '8px', fontSize: '1rem' }}>{getLogIcon(log.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                    <span className="log-timestamp">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <span className="log-type" style={{ 
                      color: log.type === 'error' ? 'var(--error)' : 
                             log.type === 'success' ? 'var(--success)' : 
                             log.type === 'event' ? 'var(--warning)' : 'var(--primary)' 
                    }}>
                      {log.type}
                    </span>
                  </div>
                  <div className="log-message">
                    {log.message}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 20px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid var(--panel-border)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)'
      }}>
        Auto-scroll enabled • Real-time player events and DRM status
      </div>
    </div>
  );
};

export default LogsPanel;
