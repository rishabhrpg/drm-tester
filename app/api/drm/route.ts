import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    console.log('=== DRM License Request ===');

    const body = await req.json();

    // Validate request body
    if (!body || Object.keys(body).length === 0) {
      console.error('❌ Empty request body');
      return NextResponse.json(
        { error: 'Bad Request', message: 'Request body is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['contentId', 'contentType', 'subscriberId'];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    console.log('Request body:', JSON.stringify(body, null, 2));

    const drmApiUrl = process.env.DRM_API_URL;

    // Get auth token from environment variables
    const authToken = process.env.AUTH_TOKEN;

    if (!authToken) {
      console.error('❌ AUTH_TOKEN is not set in environment variables');
      return NextResponse.json(
        {
          error: 'Server Configuration Error',
          message: 'AUTH_TOKEN is not configured.',
        },
        { status: 500 }
      );
    }

    // Get user-agent from request, with fallback
    const userAgent =
      req.headers.get('user-agent') ||
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

    const config = {
      method: 'POST',
      url: drmApiUrl,
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,it;q=0.7',
        authorization: `Bearer ${authToken}`,
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        languagecode: 'en',
        origin: 'https://watch.evod.co.za',
        platform: 'WEB',
        pragma: 'no-cache',
        referer: 'https://watch.evod.co.za/',
        tenant_identifier: 'master',
        'user-agent': userAgent,
      },
      data: body,
      timeout: 30000, // 30 second timeout
      validateStatus: (status: number) => status < 600, // Don't throw on any status code
    };

    console.log('Making request to DRM API...');
    const response = await axios(config);

    console.log('DRM API Response Status:', response.status);

    // Check if response is successful
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ DRM API Response Success');
      // console.log('Response Data:', JSON.stringify(response.data, null, 2));
      return NextResponse.json(response.data);
    } else {
      // Non-2xx response
      console.error('❌ DRM API returned error status:', response.status);
      console.error('Response data:', response.data);
      return NextResponse.json(
        {
          error: 'DRM API Error',
          message:
            response.data?.message || `API returned status ${response.status}`,
          status: response.status,
          data: response.data,
        },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('=== DRM Proxy Error ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);

    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout');
      return NextResponse.json(
        {
          error: 'Gateway Timeout',
          message: 'DRM API request timed out after 30 seconds',
        },
        { status: 504 }
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to DRM API');
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          message: 'Cannot connect to DRM API server',
        },
        { status: 503 }
      );
    }

    if (error.response) {
      console.error('Response status:', error.response.status);
      return NextResponse.json(
        {
          error: 'DRM API Error',
          message: error.response.data?.message || error.response.statusText,
          status: error.response.status,
        },
        { status: error.response.status }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Server Error',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
