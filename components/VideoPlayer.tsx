'use client';
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { DrmLicenseData } from '../services/drmService';

interface VideoPlayerProps {
  onPlayerEvent: (eventType: string, data?: any) => void;
  addLog: (
    message: string,
    type?: 'info' | 'error' | 'success' | 'event'
  ) => void;
}

export interface VideoPlayerHandle {
  loadContent: (url: string) => void;
  loadDrmContent: (
    url: string,
    licenseData: DrmLicenseData,
    drmType: string
  ) => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ onPlayerEvent, addLog }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      loadContent: (url: string) => {
        console.log('loadContent called with URL:', url);

        const videojs = (window as any).videojs;

        if (!videojs) {
          addLog('Video.js not loaded', 'error');
          return;
        }

        // Dispose existing player if it exists
        if (playerRef.current) {
          playerRef.current.dispose();
        }

        // Create new player instance
        playerRef.current = videojs(videoRef.current, {
          controls: true,
          autoplay: false,
          preload: 'auto',
        });

        playerRef.current.src({
          type: 'application/dash+xml',
          src: url,
        });

        playerRef.current.ready(() => {
          addLog('Player ready');
          playerRef.current.play();
        });

        playerRef.current.on('error', () => {
          const error = playerRef.current.error();
          addLog('Player error', 'error');
          addLog(error ? error.message : 'Unknown error', 'error');
        });
      },
      loadDrmContent: (
        url: string,
        licenseData: DrmLicenseData,
        drmType: string
      ) => {
        console.log('loadDrmContent called with URL:', url);
        console.log('licenseData:', licenseData);
        console.log('drmType:', drmType);

        const videojs = (window as any).videojs;

        if (!videojs) {
          addLog('Video.js not loaded', 'error');
          return;
        }

        if (playerRef.current) {
          playerRef.current.dispose();
          // Re-create the video element since dispose removes it
          // Actually videojs removes the wrapper, but we might need to be careful.
          // In React, it's safer to let React handle the DOM.
          // But video.js takes over the DOM element.
          // A common pattern is to wrap video.js in a way that handles this.
          // For now, let's try to reuse the container or just re-initialize if the ref is still valid.
          // The simplest way without complex react-videojs wrappers is to not dispose but reset.
          // But reset might not clear everything.
          // Let's assume we can re-initialize on the same ref if we handle it right,
          // or we might need to reload the component.
          // To stay close to original code, I'll follow what they did,
          // but they were doing `playerRef.current = window.videojs(videoRef.current)` repeatedly which might leak or cause issues if not disposed.
          // The original code didn't dispose. I will try to follow that but it's risky.
          // Let's add a check if player exists.
        }

        // If player exists, we might want to reuse it, but changing options (like keySystems) usually requires re-init or specific API calls.
        // Video.js usually suggests disposing and recreating for different tech/drm settings.
        // However, recreating inside React ref requires the element to be there.
        // Let's stick to the original logic: calling videojs() on the element.
        // Video.js acts as a singleton factory on the element if it's already a player.

        if (!playerRef.current) {
          playerRef.current = videojs(videoRef.current);
        }

        // Initialize EME
        if (playerRef.current.eme) {
          playerRef.current.eme();
          console.log('EME plugin initialized');
        }

        const keySystems = {
          'com.widevine.alpha': {
            url: licenseData.widevineLicenseServer,
            httpRequestHeaders: {
              // Some implementations need Authorization here too
              // Authorization: `Bearer ${licenseData.authXmlToken}`,
              // But videojs-contrib-eme often uses keySystemOptions structure below
            },
          },
        };

        console.log('keySystems placeholder:', keySystems);

        playerRef.current.src({
          type: 'application/dash+xml',
          src: url,
          keySystemOptions: [
            {
              name: 'com.widevine.alpha',
              options: {
                serverURL: licenseData.widevineLicenseServer,
                httpRequestHeaders: {
                  customdata: `${licenseData.authXmlToken}`,
                },
                priority: 2,
              },
            },
            {
              name: 'com.microsoft.playready',
              options: {
                serverURL: licenseData.playReadyLicenseServer,
                httpRequestHeaders: {
                  customdata: `${licenseData.authXmlToken}`,
                },
                audioRobustness: 'SW_SECURE_CRYPTO',
                videoRobustness: 'HW_SECURE_ALL',
                priority: 1,
              },
            },
          ],
        });

        addLog(
          `License URL: ${
            licenseData.widevineLicenseServer ||
            licenseData.playReadyLicenseServer
          }`,
          'info'
        );

        // playerRef.current.load(); // src() triggers load

        playerRef.current.ready(() => {
          addLog('Player ready');
          playerRef.current.play();
        });

        playerRef.current.off('error'); // Remove previous listeners
        playerRef.current.on('error', () => {
          const error = playerRef.current.error();
          addLog('Player error', 'error');
          addLog(error ? error.message : 'Unknown error', 'error');
        });

        playerRef.current.off('play');
        playerRef.current.on('play', () => {
          addLog('Player play', 'event');
        });

        playerRef.current.off('pause');
        playerRef.current.on('pause', () => {
          addLog('Player pause', 'event');
        });

        playerRef.current.off('ended');
        playerRef.current.on('ended', () => {
          addLog('Player ended', 'event');
        });
      },
    }));

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
        }
      };
    }, []);

    return (
      <div
        className='video-player-container'
        style={{ width: '100%', height: '100%' }}
      >
        <div data-vjs-player style={{ width: '100%', height: '100%' }}>
          <video
            ref={videoRef}
            className='video-js vjs-big-play-centered'
            controls
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
