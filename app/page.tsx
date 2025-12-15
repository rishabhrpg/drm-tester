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

const drmDashAdsUrl = `
https://broadpeak.etv.videoready.tv/0ee8b85a85a49346c032f77405ce3676/output/watchfolder/Red_Zone/DASH/Red_Zone.mpd?vid=movie_405189076565&idtype=vaid&is_lat=0&rdid=a7a55ce8-6917-4fdf-894f-804560a29127&customerId=240607082623306&bundleId=vidaa-1.1.0&appName=eVOD&url=https://watch.evod.co.za/details/movie_405189076565`;

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentDrmTech, setCurrentDrmTech] = useState('');
  const [drmType, setDrmType] = useState('widevine'); // 'widevine' or 'playready'
  const [currentPage, setCurrentPage] = useState('player'); // 'player' or 'drm-info'
  const playerRef = useRef<VideoPlayerHandle>(null);

  const addLog = (
    message: string,
    type: 'info' | 'error' | 'success' | 'event' = 'info'
  ) => {
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

  const stopPlayback = () => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
    setCurrentUrl('');
    setCurrentDrmTech('');
    addLog('Playback stopped and player reset', 'info');
  };

  const forcePlay = () => {
    try {
      (window as any).player?.play();
      addLog('Force play triggered', 'info');
    } catch (error: any) {
      addLog(`Force play failed: ${error.message}`, 'error');
    }
  };

  const playDrmDashAdsContent = async () => {
    try {
      addLog(`Requesting DRM license for ${drmType}...`, 'info');
      addLog(`Content: Red_Zone.mpd`, 'info');

      const licenseData = await getDrmLicense(drmType);
      setCurrentUrl(drmDashAdsUrl);
      setCurrentDrmTech(drmType);

      addLog(`DRM license obtained for ${drmType}`, 'success');
      addLog(
        `License Server: ${
          licenseData.widevineLicenseServer ||
          licenseData.playReadyLicenseServer
        }`,
        'info'
      );
      addLog(`Playing DRM-protected content: ${drmDashAdsUrl}`, 'info');

      if (playerRef.current) {
        playerRef.current.loadDrmContent(drmDashAdsUrl, licenseData, drmType);
      }
    } catch (error: any) {
      addLog(`Failed to get DRM license: ${error.message}`, 'error');
    }
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
          <ControlPanel
            onPlayDash={playDashContent}
            onPlayDrmDash={playDrmDashContent}
            onPlayDrmDashAds={playDrmDashAdsContent}
            onStop={stopPlayback}
            onForcePlay={forcePlay}
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
