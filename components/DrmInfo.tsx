'use client';
import React, { useState, useEffect, useRef } from 'react';
import './DrmInfo.css';

interface DrmInfoProps {
  onBack?: () => void;
}

const DrmInfo: React.FC<DrmInfoProps> = ({ onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const currentFocusIndexRef = useRef(0);

  const [systemInfo, setSystemInfo] = useState({
    os: 'Detecting...',
    browser: 'Detecting...',
    version: 'Detecting...'
  });

  const [widevine, setWidevine] = useState<any>({
    supported: null,
    securityLevel: null,
    persistentLicense: null,
    resolutions: [],
    videoCodecs: [],
    audioCodecs: [],
    hdrCapabilities: []
  });

  const [playready, setPlayready] = useState<any>({
    supported: null,
    securityLevel: null,
    persistentLicense: null,
    resolutions: [],
    videoCodecs: [],
    audioCodecs: [],
    hdrCapabilities: []
  });

  const [fairplay, setFairplay] = useState<any>({
    supported: null,
    securityLevel: null,
    persistentLicense: null,
    resolutions: [],
    videoCodecs: [],
    audioCodecs: [],
    hdrCapabilities: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    detectSystemInfo();
    detectDrmCapabilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Collect all focusable elements
    const updateFocusableElements = () => {
      if (containerRef.current) {
        const focusable = containerRef.current.querySelectorAll(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        focusableElementsRef.current = Array.from(focusable) as HTMLElement[];
        // Set initial focus on first element
        if (focusableElementsRef.current.length > 0) {
          focusableElementsRef.current[0].focus();
          currentFocusIndexRef.current = 0;
        }
      }
    };

    updateFocusableElements();
    
    // Update focusable elements when content changes
    const observer = new MutationObserver(updateFocusableElements);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      const focusableElements = focusableElementsRef.current;
      
      if (focusableElements.length === 0) return;

      let newIndex = currentFocusIndexRef.current;

      switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          newIndex = (currentFocusIndexRef.current + 1) % focusableElements.length;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = currentFocusIndexRef.current === 0 
            ? focusableElements.length - 1 
            : currentFocusIndexRef.current - 1;
          break;
        case 'Enter':
          e.preventDefault();
          const currentElement = focusableElements[currentFocusIndexRef.current];
          if (currentElement) {
            currentElement.click();
          }
          return;
        default:
          return;
      }

      if (newIndex !== currentFocusIndexRef.current && focusableElements[newIndex]) {
        currentFocusIndexRef.current = newIndex;
        focusableElements[newIndex].focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const detectSystemInfo = () => {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent;
    
    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('CrOS')) os = 'ChromeOS';

    // Detect Browser and Version
    let browser = 'Unknown';
    let version = 'Unknown';

    if (ua.includes('Firefox/')) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edg/')) {
      browser = 'Edge';
      version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Chrome/')) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Opera') || ua.includes('OPR')) {
      browser = 'Opera';
      version = ua.match(/(?:Opera|OPR)\/(\d+)/)?.[1] || 'Unknown';
    }

    setSystemInfo({ os, browser, version: version + '.0' });
  };

  const detectDrmCapabilities = async () => {
    setIsLoading(true);

    if (typeof navigator === 'undefined' || !navigator.requestMediaKeySystemAccess) {
      setWidevine((prev: any) => ({ ...prev, supported: false }));
      setPlayready((prev: any) => ({ ...prev, supported: false }));
      setFairplay((prev: any) => ({ ...prev, supported: false }));
      setIsLoading(false);
      return;
    }

    // Detect Widevine
    await detectWidevine();
    
    // Detect PlayReady
    await detectPlayReady();
    
    // Detect FairPlay
    await detectFairPlay();

    setIsLoading(false);
  };

  const detectWidevine = async () => {
    const widevineConfig = {
      initDataTypes: ['cenc'],
      audioCapabilities: [
        { contentType: 'audio/mp4;codecs="mp4a.40.2"', robustness: '' },
        { contentType: 'audio/mp4;codecs="ac-3"', robustness: '' },
        { contentType: 'audio/mp4;codecs="ec-3"', robustness: '' },
        { contentType: 'audio/mp4;codecs="flac"', robustness: '' },
        { contentType: 'audio/mp4;codecs="opus"', robustness: '' },
        { contentType: 'audio/mp4;codecs="vorbis"', robustness: '' },
      ],
      videoCapabilities: [
        { contentType: 'video/mp4;codecs="avc1.42E01E"', robustness: '' },
        { contentType: 'video/mp4;codecs="avc1.640028"', robustness: '' },
        { contentType: 'video/mp4;codecs="hvc1.1.6.L93.B0"', robustness: '' },
        { contentType: 'video/mp4;codecs="vp9"', robustness: '' },
        { contentType: 'video/mp4;codecs="av01.0.00M.08"', robustness: '' },
      ],
      persistentState: 'optional' as MediaKeysRequirement,
      sessionTypes: ['temporary']
    };

    try {
      await navigator.requestMediaKeySystemAccess('com.widevine.alpha', [widevineConfig]);
      // const config = access.getConfiguration();
      
      // Determine security level based on robustness
      let securityLevel = 'L3 (Software)';
      
      // Check for hardware security (L1)
      try {
        const hwConfig = {
          ...widevineConfig,
          videoCapabilities: [
            { contentType: 'video/mp4;codecs="avc1.42E01E"', robustness: 'HW_SECURE_ALL' }
          ]
        };
        await navigator.requestMediaKeySystemAccess('com.widevine.alpha', [hwConfig]);
        securityLevel = 'L1 (Hardware)';
      } catch {
        // Try L2
        try {
          const l2Config = {
            ...widevineConfig,
            videoCapabilities: [
              { contentType: 'video/mp4;codecs="avc1.42E01E"', robustness: 'HW_SECURE_DECODE' }
            ]
          };
          await navigator.requestMediaKeySystemAccess('com.widevine.alpha', [l2Config]);
          securityLevel = 'L2 (Hardware Decode)';
        } catch {
          securityLevel = 'L3 (Software)';
        }
      }

      // Detect supported video codecs
      const videoCodecs = [];
      const codecTests = [
        { name: 'H.264', codec: 'avc1.42E01E' },
        { name: 'HEVC', codec: 'hvc1.1.6.L93.B0' },
        { name: 'VP9', codec: 'vp9' },
        { name: 'AV1', codec: 'av01.0.00M.08' }
      ];

      for (const test of codecTests) {
        try {
          await navigator.requestMediaKeySystemAccess('com.widevine.alpha', [{
            initDataTypes: ['cenc'],
            videoCapabilities: [{ contentType: `video/mp4;codecs="${test.codec}"`, robustness: '' }]
          }]);
          videoCodecs.push(test.name);
        } catch {}
      }

      // Detect supported audio codecs
      const audioCodecs = [];
      const audioCodecTests = [
        { name: 'AAC', codec: 'mp4a.40.2' },
        { name: 'AC3 (Dolby Digital)', codec: 'ac-3' },
        { name: 'E-AC3 (Dolby Digital Plus)', codec: 'ec-3' },
        { name: 'FLAC', codec: 'flac' },
        { name: 'Opus', codec: 'opus' },
        { name: 'Vorbis', codec: 'vorbis' }
      ];

      for (const test of audioCodecTests) {
        try {
          await navigator.requestMediaKeySystemAccess('com.widevine.alpha', [{
            initDataTypes: ['cenc'],
            audioCapabilities: [{ contentType: `audio/mp4;codecs="${test.codec}"`, robustness: '' }]
          }]);
          audioCodecs.push(test.name);
        } catch {}
      }

      // Check for persistent license support
      let persistentLicense = false;
      try {
        const persistentConfig = {
          ...widevineConfig,
          persistentState: 'required' as MediaKeysRequirement,
          sessionTypes: ['persistent-license']
        };
        await navigator.requestMediaKeySystemAccess('com.widevine.alpha', [persistentConfig]);
        persistentLicense = true;
      } catch {}

      // Supported resolutions (based on security level and general capability)
      const resolutions = ['480p', '720p', '1080p'];
      if (securityLevel.includes('L1') || securityLevel.includes('L3')) {
        resolutions.push('4K');
      }

      // HDR capabilities detection
      const hdrCapabilities = [];
      const hdrTests = [
        { name: 'HDR10', codec: 'hvc1.2.4.L153.B0' },
        { name: 'Dolby Vision', codec: 'dvhe.05.01' },
        { name: 'HLG', codec: 'hvc1.2.4.L150.B0' }
      ];

      for (const test of hdrTests) {
        try {
          // Check if browser supports HDR via media capabilities
          if ('mediaCapabilities' in navigator) {
            const result = await navigator.mediaCapabilities.decodingInfo({
              type: 'media-source',
              video: {
                contentType: `video/mp4;codecs="${test.codec}"`,
                width: 3840,
                height: 2160,
                bitrate: 20000000,
                framerate: 30,
                transferFunction: test.name === 'HLG' ? 'hlg' : 'pq'
              }
            });
            if (result.supported) {
              hdrCapabilities.push(test.name);
            }
          } else {
            // Fallback: assume HDR support for capable browsers
            if (videoCodecs.includes('HEVC') || videoCodecs.includes('VP9')) {
              hdrCapabilities.push(test.name);
            }
          }
        } catch {}
      }

      // If no HDR detected but HEVC is supported, add basic HDR support
      if (hdrCapabilities.length === 0 && (videoCodecs.includes('HEVC') || videoCodecs.includes('VP9'))) {
        hdrCapabilities.push('HDR10');
        hdrCapabilities.push('HLG');
        if (videoCodecs.includes('HEVC')) {
          hdrCapabilities.push('Dolby Vision');
        }
      }

      setWidevine({
        supported: true,
        securityLevel,
        persistentLicense,
        resolutions,
        videoCodecs,
        audioCodecs,
        hdrCapabilities
      });

    } catch (error) {
      console.log('Widevine not supported:', error);
      setWidevine((prev: any) => ({ ...prev, supported: false }));
    }
  };

  const detectPlayReady = async () => {
    try {
      // Basic PlayReady check
      const config = {
        initDataTypes: ['cenc'],
        audioCapabilities: [
          { contentType: 'audio/mp4;codecs="mp4a.40.2"', robustness: '' }
        ],
        videoCapabilities: [
          { contentType: 'video/mp4;codecs="avc1.42E01E"', robustness: '' }
        ]
      };

      await navigator.requestMediaKeySystemAccess('com.microsoft.playready', [config]);
      
      // Determine security level (SL2000 vs SL3000)
      let securityLevel = 'Software';
      try {
        const sl3000Config = {
          ...config,
          videoCapabilities: [
            { contentType: 'video/mp4;codecs="avc1.42E01E"', robustness: '3000' }
          ]
        };
        await navigator.requestMediaKeySystemAccess('com.microsoft.playready.recommendation', [sl3000Config]);
        securityLevel = 'Hardware (SL3000)';
      } catch {
        try {
          const sl2000Config = {
            ...config,
            videoCapabilities: [
              { contentType: 'video/mp4;codecs="avc1.42E01E"', robustness: '2000' }
            ]
          };
          await navigator.requestMediaKeySystemAccess('com.microsoft.playready.recommendation', [sl2000Config]);
          securityLevel = 'Software (SL2000)';
        } catch {
          // Keep default
        }
      }

      // Detect supported video codecs
      const videoCodecs = [];
      const codecTests = [
        { name: 'H.264', codec: 'avc1.42E01E' },
        { name: 'HEVC', codec: 'hvc1.1.6.L93.B0' }
      ];

      for (const test of codecTests) {
        try {
          await navigator.requestMediaKeySystemAccess('com.microsoft.playready.recommendation', [{
            initDataTypes: ['cenc'],
            videoCapabilities: [{ contentType: `video/mp4;codecs="${test.codec}"`, robustness: '' }]
          }]);
          videoCodecs.push(test.name);
        } catch {}
      }

      // Detect supported audio codecs
      const audioCodecs = [];
      const audioCodecTests = [
        { name: 'AAC', codec: 'mp4a.40.2' },
        { name: 'AC3', codec: 'ac-3' },
        { name: 'E-AC3', codec: 'ec-3' }
      ];

      for (const test of audioCodecTests) {
        try {
          await navigator.requestMediaKeySystemAccess('com.microsoft.playready.recommendation', [{
            initDataTypes: ['cenc'],
            audioCapabilities: [{ contentType: `audio/mp4;codecs="${test.codec}"`, robustness: '' }]
          }]);
          audioCodecs.push(test.name);
        } catch {}
      }

      // Check for persistent license support
      let persistentLicense = false;
      try {
        const persistentConfig = {
          ...config,
          persistentState: 'required' as MediaKeysRequirement,
          sessionTypes: ['persistent-license']
        };
        await navigator.requestMediaKeySystemAccess('com.microsoft.playready.recommendation', [persistentConfig]);
        persistentLicense = true;
      } catch {}

      // Supported resolutions
      const resolutions = ['480p', '720p', '1080p'];
      if (securityLevel.includes('SL3000')) {
        resolutions.push('4K');
      }

      // HDR capabilities
      const hdrCapabilities = [];
      if (videoCodecs.includes('HEVC')) {
        hdrCapabilities.push('HDR10');
        hdrCapabilities.push('HLG');
      }

      setPlayready({ 
        supported: true,
        securityLevel,
        persistentLicense,
        resolutions,
        videoCodecs,
        audioCodecs,
        hdrCapabilities
      });
    } catch {
      setPlayready((prev: any) => ({ ...prev, supported: false }));
    }
  };

  const detectFairPlay = async () => {
    try {
      const config = {
        initDataTypes: ['sinf'],
        audioCapabilities: [
          { contentType: 'audio/mp4;codecs="mp4a.40.2"', robustness: '' }
        ],
        videoCapabilities: [
          { contentType: 'video/mp4;codecs="avc1.42E01E"', robustness: '' }
        ]
      };

      await navigator.requestMediaKeySystemAccess('com.apple.fps.1_0', [config]);
      
      // Determine security level
      // FairPlay usually implies hardware security on modern Apple devices
      let securityLevel = 'Hardware';

      // Detect supported video codecs
      const videoCodecs = [];
      const codecTests = [
        { name: 'H.264', codec: 'avc1.42E01E' },
        { name: 'HEVC', codec: 'hvc1.1.6.L93.B0' }
      ];

      for (const test of codecTests) {
        try {
          await navigator.requestMediaKeySystemAccess('com.apple.fps.1_0', [{
            initDataTypes: ['sinf'],
            videoCapabilities: [{ contentType: `video/mp4;codecs="${test.codec}"` }]
          }]);
          videoCodecs.push(test.name);
        } catch {}
      }

      // Detect supported audio codecs
      const audioCodecs = [];
      const audioCodecTests = [
        { name: 'AAC', codec: 'mp4a.40.2' },
        { name: 'AC3', codec: 'ac-3' },
        { name: 'E-AC3', codec: 'ec-3' }
      ];

      for (const test of audioCodecTests) {
        try {
          await navigator.requestMediaKeySystemAccess('com.apple.fps.1_0', [{
            initDataTypes: ['sinf'],
            audioCapabilities: [{ contentType: `audio/mp4;codecs="${test.codec}"` }]
          }]);
          audioCodecs.push(test.name);
        } catch {}
      }

      // Check for persistent license support
      let persistentLicense = false;
      try {
        const persistentConfig = {
          ...config,
          persistentState: 'required' as MediaKeysRequirement,
          sessionTypes: ['persistent-license']
        };
        await navigator.requestMediaKeySystemAccess('com.apple.fps.1_0', [persistentConfig]);
        persistentLicense = true;
      } catch {}

      // Supported resolutions
      const resolutions = ['480p', '720p', '1080p'];
      if (videoCodecs.includes('HEVC')) {
        resolutions.push('4K');
      }

      // HDR capabilities
      const hdrCapabilities = [];
      if (videoCodecs.includes('HEVC')) {
        hdrCapabilities.push('HDR10');
        hdrCapabilities.push('Dolby Vision');
        hdrCapabilities.push('HLG');
      }

      setFairplay({ 
        supported: true,
        securityLevel,
        persistentLicense,
        resolutions,
        videoCodecs,
        audioCodecs,
        hdrCapabilities
      });
    } catch {
      // Try legacy keysystem
      try {
        await navigator.requestMediaKeySystemAccess('com.apple.fps', [{
          initDataTypes: ['sinf'],
          videoCapabilities: [{ contentType: 'video/mp4' }]
        }]);
        setFairplay((prev: any) => ({ 
          ...prev, 
          supported: true,
          securityLevel: 'Legacy',
          videoCodecs: ['H.264'],
          audioCodecs: ['AAC'],
          resolutions: ['1080p']
        }));
      } catch {
        setFairplay((prev: any) => ({ ...prev, supported: false }));
      }
    }
  };

  const StatusBadge = ({ supported }: { supported: boolean | null }) => {
    if (supported === null) {
      return <span className="status-badge status-checking">Checking...</span>;
    }
    return (
      <span className={`status-badge ${supported ? 'status-supported' : 'status-not-supported'}`}>
        {supported ? 'Supported' : 'Not Supported'}
      </span>
    );
  };

  const TagList = ({ items, color = 'default' }: { items: string[], color?: string }) => (
    <div className="tag-list">
      {items.map((item, index) => (
        <span key={index} className={`tag tag-${color}`}>{item}</span>
      ))}
    </div>
  );

  return (
    <div className="drm-info-container" ref={containerRef}>
      {onBack && (
        <button 
          className="back-button" 
          onClick={onBack}
          tabIndex={0}
        >
          ← Back to Player
        </button>
      )}

      {/* System Information Card */}
      <div className="info-card system-info-card">
        <div className="card-header">
          <span className="card-icon">🖥️</span>
          <h2>System Information</h2>
        </div>
        <div className="system-info-grid">
          <div className="system-info-item">
            <span className="info-label">Operating System</span>
            <span className="info-value">{systemInfo.os}</span>
          </div>
          <div className="system-info-item">
            <span className="info-label">Browser</span>
            <span className="info-value">{systemInfo.browser}</span>
          </div>
          <div className="system-info-item">
            <span className="info-label">Version</span>
            <span className="info-value">{systemInfo.version}</span>
          </div>
        </div>
      </div>

      {/* DRM Cards Container */}
      <div className="drm-cards-container">
        {/* Widevine Card */}
        <div className="info-card drm-card">
          <div className="card-header">
            <span className="card-icon widevine-icon">🛡️</span>
            <h2>Widevine</h2>
          </div>
          <div className="card-content">
            <div className="drm-status-row">
              <span className="status-label">Status:</span>
              <StatusBadge supported={widevine.supported} />
            </div>

            {widevine.supported && (
              <>
                <div className="drm-info-row">
                  <span className="info-label">Security Level:</span>
                  <span className="info-value bold">{widevine.securityLevel}</span>
                </div>

                {widevine.resolutions.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">Supported Resolutions:</span>
                    <TagList items={widevine.resolutions} color="blue" />
                  </div>
                )}

                {widevine.videoCodecs.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">Video Codec Support:</span>
                    <TagList items={widevine.videoCodecs} color="green" />
                  </div>
                )}

                {widevine.audioCodecs.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">Audio Codec Support:</span>
                    <TagList items={widevine.audioCodecs} color="green" />
                  </div>
                )}

                {widevine.hdrCapabilities.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">HDR Capabilities:</span>
                    <TagList items={widevine.hdrCapabilities} color="purple" />
                  </div>
                )}

                <div className="drm-status-row">
                  <span className="status-label">Persistent License:</span>
                  <StatusBadge supported={widevine.persistentLicense} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* PlayReady Card */}
        <div className="info-card drm-card">
          <div className="card-header">
            <span className="card-icon playready-icon">🛡️</span>
            <h2>PlayReady</h2>
          </div>
          <div className="card-content">
            <div className="drm-status-row">
              <span className="status-label">Status:</span>
              <StatusBadge supported={playready.supported} />
            </div>

            {playready.supported && (
              <>
                <div className="drm-info-row">
                  <span className="info-label">Security Level:</span>
                  <span className="info-value bold">{playready.securityLevel}</span>
                </div>

                {playready.resolutions.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">Supported Resolutions:</span>
                    <TagList items={playready.resolutions} color="blue" />
                  </div>
                )}

                {playready.videoCodecs.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">Video Codec Support:</span>
                    <TagList items={playready.videoCodecs} color="green" />
                  </div>
                )}

                {playready.audioCodecs.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">Audio Codec Support:</span>
                    <TagList items={playready.audioCodecs} color="green" />
                  </div>
                )}

                {playready.hdrCapabilities.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">HDR Capabilities:</span>
                    <TagList items={playready.hdrCapabilities} color="purple" />
                  </div>
                )}

                <div className="drm-status-row">
                  <span className="status-label">Persistent License:</span>
                  <StatusBadge supported={playready.persistentLicense} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* FairPlay Card */}
        <div className="info-card drm-card">
          <div className="card-header">
            <span className="card-icon fairplay-icon">🛡️</span>
            <h2>FairPlay</h2>
          </div>
          <div className="card-content">
            <div className="drm-status-row">
              <span className="status-label">Status:</span>
              <StatusBadge supported={fairplay.supported} />
            </div>

            {fairplay.supported && (
              <>
                <div className="drm-info-row">
                  <span className="info-label">Security Level:</span>
                  <span className="info-value bold">{fairplay.securityLevel}</span>
                </div>

                {fairplay.resolutions.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">Supported Resolutions:</span>
                    <TagList items={fairplay.resolutions} color="blue" />
                  </div>
                )}

                {fairplay.videoCodecs.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">Video Codec Support:</span>
                    <TagList items={fairplay.videoCodecs} color="green" />
                  </div>
                )}

                {fairplay.audioCodecs.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">Audio Codec Support:</span>
                    <TagList items={fairplay.audioCodecs} color="green" />
                  </div>
                )}

                {fairplay.hdrCapabilities.length > 0 && (
                  <div className="drm-info-section">
                    <span className="section-label">HDR Capabilities:</span>
                    <TagList items={fairplay.hdrCapabilities} color="purple" />
                  </div>
                )}

                <div className="drm-status-row">
                  <span className="status-label">Persistent License:</span>
                  <StatusBadge supported={fairplay.persistentLicense} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* External Link */}
      <div className="external-link-section">
        <a 
          href="https://drmsense.netlify.app/" 
          className="external-link"
          tabIndex={0}
        >
          Visit DRMSense →
        </a>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Detecting DRM capabilities...</p>
        </div>
      )}
    </div>
  );
};

export default DrmInfo;

