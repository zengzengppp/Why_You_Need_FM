import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();
    
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log('Testing full generate flow for company:', companyName);

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

    console.log('Prompt length:', fullPrompt.length);
    console.log('Sending request to Gemini...');

    // Call Gemini API with timeout
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API call timed out after 60 seconds')), 60000)
    );
    
    const apiPromise = model.generateContent(fullPrompt);
    
    const result = await Promise.race([apiPromise, timeoutPromise]) as any;
    const response = await result.response;
    const text = response.text();

    console.log('Raw LLM response length:', text.length);
    console.log('Raw LLM response (first 500 chars):', text.substring(0, 500));

    // Try to parse the response
    let parsedSections = null;
    let parseError = null;
    
    try {
      parsedSections = parseGeminiResponse(text);
      console.log('Parsed sections successfully:', parsedSections.length);
    } catch (error: any) {
      parseError = error.message;
      console.log('Parse error:', parseError);
    }

    return NextResponse.json({ 
      success: true,
      companyName,
      rawResponse: text,
      rawResponseLength: text.length,
      parsedSections,
      parseError,
      promptLength: fullPrompt.length
    });

  } catch (error: any) {
    console.error('Error in test-gemini-complete:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred',
      stack: error.stack
    }, { status: 500 });
  }
}

// Same parsing function as in generate route
function parseGeminiResponse(text: string) {
  try {
    let structuredText = text;
    
    // Look for the structured version separator (optional)
    const separatorIndex = text.indexOf('--- STRUCTURED VERSION BELOW ---');
    if (separatorIndex !== -1) {
      structuredText = text.substring(separatorIndex + '--- STRUCTURED VERSION BELOW ---'.length).trim();
    } else {
      // If no separator, try to find JSON in the response
      const jsonStart = text.indexOf('{');
      if (jsonStart !== -1) {
        structuredText = text.substring(jsonStart).trim();
      }
    }
    
    // Handle JSON wrapped in markdown code blocks
    if (structuredText.includes('```json')) {
      const jsonMatch = structuredText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        structuredText = jsonMatch[1].trim();
      }
    }
    
    // Try to parse as JSON first
    if (structuredText.startsWith('{') || structuredText.startsWith('[')) {
      try {
        const jsonData = JSON.parse(structuredText);
        
        // Handle the specific format: section1_title, section1_content, etc.
        if (jsonData.section1_title) {
          const sections = [];
          for (let i = 1; i <= 4; i++) {
            const titleKey = `section${i}_title`;
            const contentKey = `section${i}_content`;
            
            if (jsonData[titleKey] && jsonData[contentKey]) {
              sections.push({
                title: jsonData[titleKey],
                content: jsonData[contentKey]
              });
            }
          }
          
          if (sections.length >= 4) {
            return sections;
          }
        }
        
        // Handle standard sections array format
        if (jsonData.sections && Array.isArray(jsonData.sections)) {
          return jsonData.sections;
        }
        
        // Handle direct array format
        if (Array.isArray(jsonData)) {
          return jsonData;
        }
        
      } catch (e) {
        console.error('JSON parsing failed:', e);
        // Fall through to markdown parsing
      }
    }
    
    // Parse markdown structure
    const sections = [];
    const lines = structuredText.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for section headers (# or ##)
      if (trimmedLine.startsWith('# ') || trimmedLine.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine.replace(/^#+\s*/, ''),
          content: ''
        };
      } else if (currentSection && trimmedLine) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // Ensure we have exactly 4 sections
    if (sections.length < 4) {
      throw new Error('Not enough sections found');
    }
    
    return sections.slice(0, 4);
    
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw error;
  }
}