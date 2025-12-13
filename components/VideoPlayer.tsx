'use client';
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
} from 'react';
import { DrmLicenseData } from '../services/drmService';

interface VideoPlayerProps {
  onPlayerEvent: (eventType: string, data?: any) => void;
  addLog: (
    message: string,
    type?: 'info' | 'error' | 'success' | 'event'
  ) => void;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export interface VideoPlayerHandle {
  loadContent: (url: string) => void;
  loadDrmContent: (
    url: string,
    licenseData: DrmLicenseData,
    drmType: string
  ) => void;
  stop: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ onPlayerEvent, addLog, isFocused = false, onFocusChange }, ref) => {
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

        // Reuse existing player if it exists, otherwise create new one
        if (!playerRef.current) {
          // Create new player instance
          playerRef.current = videojs(videoRef.current, {
            controls: true,
            autoplay: false,
            preload: 'auto',
          });
        }

        playerRef.current.src({
          type: 'application/dash+xml',
          src: url,
        });

        playerRef.current.ready(() => {
          addLog('Player ready');
          playerRef.current.play();
        });

        playerRef.current.off('error');
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

        if (!playerRef.current) {
          playerRef.current = videojs(videoRef.current, {
            html5: {
              nativeCaptions: false,
            },
          });

          // Initialize EME only when creating the player
          if (playerRef.current.eme) {
            playerRef.current.eme();
            console.log('EME plugin initialized');
          }
        }

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
      stop: () => {
        try {
          console.log('stop called');

          if (playerRef.current) {
            playerRef.current.reset();
          }

          addLog('Player stopped and reset', 'info');
        } catch (error) {
          console.error('Error stopping player:', error);
          addLog('Error stopping player', 'error');
        }
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
      <div data-vjs-player style={{ width: '100%', height: '100%' }}>
        <video
          ref={videoRef}
          className='video-js vjs-big-play-centered'
          controls
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
