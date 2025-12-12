'use client';
import React, { useState, useRef } from 'react';
import VideoPlayer, { VideoPlayerHandle } from '../components/VideoPlayer';
import ControlPanel from '../components/ControlPanel';
import LogsPanel, { LogEntry } from '../components/LogsPanel';
import DrmInfo from '../components/DrmInfo';
import { getDrmLicense } from '../services/drmService';

// Non-DRM content URLs
const hslUrl =
  'https://d1jgyj8oxjxorp.cloudfront.net/output/watchfolder/Housewives_S01_Ep01/HLS/Housewives_S01_Ep01.m3u8';

const dashUrl =
  'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd';

// DRM-protected content URL
const drmDashUrl =
  'https://d1jgyj8oxjxorp.cloudfront.net/output/watchfolder/Red_Zone/DASH/Red_Zone.mpd';

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentDrmTech, setCurrentDrmTech] = useState('');
  const [drmType, setDrmType] = useState('widevine'); // 'widevine' or 'playready'
  const [currentPage, setCurrentPage] = useState('player'); // 'player' or 'drm-info'
  const playerRef = useRef<VideoPlayerHandle>(null);

  const addLog = (message: string, type: 'info' | 'error' | 'success' | 'event' = 'info') => {
    const timestamp = new Date().toISOString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const playDashContent = async () => {
    setCurrentUrl(dashUrl);
    setCurrentDrmTech('None');
    addLog(`Playing DASH content: ${dashUrl}`, 'info');

    if (playerRef.current) {
      playerRef.current.loadContent(dashUrl);
    }
  };

  const playDrmDashContent = async () => {
    try {
      addLog(`Requesting DRM license for ${drmType}...`, 'info');
      addLog(`Content: Red_Zone.mpd`, 'info');

      const licenseData = await getDrmLicense(drmType);
      setCurrentUrl(drmDashUrl);
      setCurrentDrmTech(drmType);

      addLog(`DRM license obtained for ${drmType}`, 'success');
      addLog(
        `License Server: ${
          licenseData.widevineLicenseServer ||
          licenseData.playReadyLicenseServer
        }`,
        'info'
      );
      addLog(`Playing DRM-protected content: ${drmDashUrl}`, 'info');

      if (playerRef.current) {
        playerRef.current.loadDrmContent(drmDashUrl, licenseData, drmType);
      }
    } catch (error: any) {
      addLog(`Failed to get DRM license: ${error.message}`, 'error');
    }
  };

  const handlePlayerEvent = (eventType: string, data?: any) => {
    addLog(`Player Event: ${eventType} - ${JSON.stringify(data)}`, 'event');
  };

  // Render DRM Info page
  if (currentPage === 'drm-info') {
    return <DrmInfo onBack={() => setCurrentPage('player')} />;
  }

  // Render Player page
  return (
    <div className='App'>
      <div className='app-container'>
        <div className='left-panel'>
          <h1>Test 4</h1>
          <ControlPanel
            onPlayDash={playDashContent}
            onPlayDrmDash={playDrmDashContent}
            drmType={drmType}
            onDrmTypeChange={setDrmType}
            onShowDrmInfo={() => setCurrentPage('drm-info')}
          />
        </div>
        <div className='right-panel'>
          <VideoPlayer
            ref={playerRef}
            onPlayerEvent={handlePlayerEvent}
            addLog={addLog}
          />
        </div>
      </div>
      <div className='bottom-panel'>
        <LogsPanel
          logs={logs}
          currentUrl={currentUrl}
          currentDrmTech={currentDrmTech}
        />
      </div>
    </div>
  );
}

