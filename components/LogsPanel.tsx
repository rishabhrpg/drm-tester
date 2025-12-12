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
}

const LogsPanel: React.FC<LogsPanelProps> = ({ logs, currentUrl, currentDrmTech }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return '#ff4444';
      case 'success':
        return '#44ff44';
      case 'event':
        return '#ffaa00';
      case 'info':
      default:
        return '#00aaff';
    }
  };

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
    <div className="logs-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      {/* Status Bar */}
      <div className="status-bar" style={{
        padding: '10px 20px',
        backgroundColor: '#2a2a2a',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h3 style={{ margin: 0, color: '#00aaff' }}>Player Logs</h3>
          <span style={{ fontSize: '12px', color: '#888' }}>
            Total: {logs.length} entries
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
          {currentUrl && (
            <div>
              <span style={{ color: '#888' }}>URL: </span>
              <span style={{ color: '#00aaff', fontFamily: 'monospace' }}>
                {currentUrl.length > 50 ? `...${currentUrl.slice(-50)}` : currentUrl}
              </span>
            </div>
          )}
          {currentDrmTech && (
            <div>
              <span style={{ color: '#888' }}>DRM: </span>
              <span style={{ color: '#44ff44', fontWeight: 'bold' }}>
                {currentDrmTech}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Logs Container */}
      <div 
        className="logs-container" 
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: '#1a1a1a',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.4'
        }}
      >
        {logs.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: '#666',
            fontSize: '16px'
          }}>
            No logs yet. Start playing content to see events...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="log-entry"
              style={{
                padding: '6px 10px',
                marginBottom: '2px',
                borderRadius: '3px',
                backgroundColor: index % 2 === 0 ? '#222' : '#1a1a1a',
                borderLeft: `3px solid ${getLogColor(log.type)}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '14px' }}>{getLogIcon(log.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                  <span style={{ color: '#888', fontSize: '11px' }}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span style={{ 
                    color: getLogColor(log.type), 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {log.type}
                  </span>
                </div>
                <div style={{ color: '#fff', wordBreak: 'break-all' }}>
                  {log.message}
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
        backgroundColor: '#2a2a2a',
        borderTop: '1px solid #444',
        fontSize: '12px',
        color: '#888',
        textAlign: 'center'
      }}>
        Auto-scroll enabled • Real-time player events and DRM status
      </div>
    </div>
  );
};

export default LogsPanel;

