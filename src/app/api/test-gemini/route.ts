import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key exists:', !!process.env.GOOGLE_API_KEY);
    console.log('API Key length:', process.env.GOOGLE_API_KEY?.length || 0);

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'GOOGLE_API_KEY is not set',
        apiKeyExists: false,
        apiKeyLength: 0
      }, { status: 500 });
    }

    // Simple test prompt
    const testPrompt = "Hello! Please respond with exactly: 'Gemini API is working correctly!'";

    // Call Gemini API with timeout
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API call timed out after 30 seconds')), 30000)
    );
    
    const apiPromise = model.generateContent(testPrompt);
    
    const result = await Promise.race([apiPromise, timeoutPromise]) as any;
    const response = await result.response;
    const text = response.text();

    console.log('Gemini response:', text);

    return NextResponse.json({ 
      success: true, 
      response: text,
      apiKeyExists: !!process.env.GOOGLE_API_KEY,
      apiKeyLength: process.env.GOOGLE_API_KEY?.length || 0
    });

  } catch (error: any) {
    console.error('Error testing Gemini API:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred',
      apiKeyExists: !!process.env.GOOGLE_API_KEY,
      apiKeyLength: process.env.GOOGLE_API_KEY?.length || 0
    }, { status: 500 });
  }
}