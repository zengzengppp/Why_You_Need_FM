import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY;
    
    // Environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local',
      platform: process.env.VERCEL ? 'vercel' : 'local',
      timestamp: new Date().toISOString(),
      googleApiKeyExists: !!googleApiKey,
      googleApiKeyLength: googleApiKey ? googleApiKey.length : 0,
      googleApiKeyPreview: googleApiKey ? `${googleApiKey.substring(0, 8)}...${googleApiKey.substring(googleApiKey.length - 4)}` : 'NOT_SET',
      // Check if it's the default value
      isDefaultValue: googleApiKey === 'your-api-key-here',
      allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('GOOGLE_') || key.includes('API')).sort()
    };

    console.log('Environment check:', envInfo);

    return NextResponse.json({
      success: true,
      environment: envInfo,
      message: googleApiKey 
        ? (googleApiKey === 'your-api-key-here' ? 'API key is set to default value' : 'API key is configured')
        : 'API key is missing'
    });

  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also support POST for testing
export async function POST(request: NextRequest) {
  return GET(request);
}