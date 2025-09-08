import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'your-api-key-here');

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();
    
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Call LLM and capture RAW response
    try {
      // Read knowledge base files
      const salesCasesPath = path.join(process.cwd(), 'Sales_Cases_Json.txt');
      const marketingPath = path.join(process.cwd(), 'Marketing_Json.txt');
      const competitorPath = path.join(process.cwd(), 'competitor_Fun_Json.txt');
      const systemPromptPath = path.join(process.cwd(), 'System Prompt.txt');

      const salesCases = fs.readFileSync(salesCasesPath, 'utf-8');
      const marketing = fs.readFileSync(marketingPath, 'utf-8');
      const competitor = fs.readFileSync(competitorPath, 'utf-8');
      const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');

      // Construct full prompt
      const fullPrompt = `${systemPrompt}

=== KNOWLEDGE BASE ===

SALES_CASES_JSON:
${salesCases}

MARKETING_JSON:
${marketing}

COMPETITOR_FUN_JSON:
${competitor}

=== TARGET COMPANY ===
Company Name: ${companyName}

Please analyze this company and provide your two-stage output as specified in the system prompt.`;

      // Call Gemini API
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const rawText = response.text();

      // Return RAW response for debugging
      return NextResponse.json({ 
        rawResponse: rawText,
        responseLength: rawText.length,
        companyName: companyName
      });
    } catch (llmError) {
      return NextResponse.json({
        error: 'LLM API failed',
        errorMessage: llmError.message,
        companyName: companyName
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}