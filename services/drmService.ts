import axios from 'axios';

// Proxy server configuration - DRM calls are routed through the proxy server
// In Next.js, we use the relative path to hit the API route
const proxyServerUrl = process.env.NEXT_PUBLIC_PROXY_SERVER_ENDPOINT || '';
const DRM_PROXY_ENDPOINT = `${proxyServerUrl}/api/drm`;

console.log('proxyServerUrl', proxyServerUrl);

export interface DrmLicenseData {
  widevineLicenseServer?: string;
  playReadyLicenseServer?: string;
  authXmlToken?: string;
  drmType?: string;
  [key: string]: any;
}

export const getDrmLicense = async (
  drmType: string,
  contentId: string = 'movie_405189076565'
): Promise<DrmLicenseData> => {
  if (typeof window !== 'undefined') {
    console.log('window.location.hostname', window.location.hostname);
  }

  try {
    // Determine device type based on DRM type
    const deviceType = drmType === 'widevine' ? 'Android' : 'Window';

    // Get subscriber ID from environment variables
    // Note: Next.js uses NEXT_PUBLIC_ prefix for client-side env vars
    const subscriberId = process.env.NEXT_PUBLIC_SUBSCRIBER_ID;

    if (!subscriberId) {
      throw new Error(
        'NEXT_PUBLIC_SUBSCRIBER_ID is not set. Please configure it in the .env file.'
      );
    }

    const requestData = {
      contentId: contentId,
      contentType: 'MOVIES',
      deviceType: deviceType,
      offlineDownload: false,
      subscriberId: subscriberId,
    };

    console.log(
      `🔐 Making DRM license request through proxy server for ${drmType}`
    );
    console.log('Proxy URL:', DRM_PROXY_ENDPOINT);
    console.log('Device Type:', deviceType);
    console.log('Request data:', requestData);

    // Route through proxy server - proxy handles authentication and headers
    const response = await axios.post(DRM_PROXY_ENDPOINT, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    if (response.data && response.data.status) {
      console.log('✅ DRM license response received:', response.data);
      return {
        ...response.data.data,
        drmType, // Include the DRM type for easier reference
      };
    } else {
      throw new Error(
        `DRM license request failed: ${
          response.data?.message || 'Unknown error'
        }`
      );
    }
  } catch (error: any) {
    console.error('❌ DRM license request error:', error);

    if (error.response) {
      // Server responded with error status
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        error.response.statusText;
      throw new Error(
        `DRM Proxy Error: ${error.response.status} - ${errorMessage}`
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        'DRM Proxy Error: No response received from proxy server.'
      );
    } else {
      // Something else happened
      throw new Error(`DRM Proxy Error: ${error.message}`);
    }
  }
};

// Helper function to decode the auth XML token
export const decodeAuthXmlToken = (token: string) => {
  try {
    return atob(token);
  } catch (error) {
    console.error('Failed to decode auth XML token:', error);
    return null;
  }
};

// Helper function to check if license is expired
export const isLicenseExpired = (expiresAt: string) => {
  const now = Math.floor(Date.now() / 1000);
  return now >= parseInt(expiresAt);
};
