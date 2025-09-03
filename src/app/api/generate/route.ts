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

    // TEMPORARILY DISABLED LLM CONNECTION FOR UI TESTING
    // TODO: Re-enable after UI refinement is complete
    
    /* LLM CODE - DISABLED FOR UI TESTING
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
    const text = response.text();

    // Parse the response to extract the structured version
    const sections = parseGeminiResponse(text);
    
    return NextResponse.json({ sections });
    */

    // USE HARDCODED OUTPUT FROM Example_Output.txt FOR UI TESTING
    // This simulates realistic LLM output with imperfect markdown formatting
    const hardcodedOutput = {
      "section1_title": "## Your Shelf is a Promise",
      "section1_content": "Aesop isn't just skincare. It's an ethos of calm, intelligent design in a chaotic world. But that promise, made in your meticulously crafted stores, is broken when a product isn't on the shelf. The **volatility and uncertainty (VUCA)** that buffet the global market are a direct threat to your brand's tranquil presence. You face the same complex, global challenges as the world's beauty leaders. Your supply chain cannot be an afterthought; it must be as **intentionally designed as your formulations**.",
      "section2_title": "## The L'Oréal Precedent",
      "section2_content": "L'Oréal, the **world's #1 cosmetics group**, operates in this same volatile world. Their goal was simple and audacious: achieve **increasing performance and customer service** across a massive global footprint. For over **20 years**, they have relied on FuturMaster as their core Demand Planning solution. We didn't just sell them software; we built a partnership that now supports **80 countries and 3,250 users**. We empower them to generate the **most accurate sell-in sales forecast possible**, turning market chaos into a clear, actionable vision.",
      "section3_title": "## From Meticulous Design to Market Dominance", 
      "section3_content": "This isn't about buying a better spreadsheet. This is about installing a command center. The **FuturMaster Bloom platform** is designed for one purpose: to **unleash complexity and turn it into your competitive advantage**.\n\n* **BLOOM Demand Planning**: Thrives in a VUCA world, leveraging **advanced algorithms and Forecast at Scale technology** to create demand plans that are not just accurate, but responsive.\n* **Expertise, Not Experiments**: We are a **supply chain expert company**. Our solutions have decades of best practices from the beauty industry already built-in.\n* **Your Focus**: Your team's valuable time should be spent **winning the market, not experimenting in an academic sandbox**.",
      "section4_title": "## Researcher, Builder, or Leader?",
      "section4_content": "You have a choice. You can listen to vendors like **o9 Solutions**, who will sell you an empty 'Digital Brain' and ask you to spend years on an **'expensive academic research project'** to train it. Or you can talk to **Anaplan**, who will hand you a box of 'top-tier bricks' and call it flexibility. We call it **'buck-passing'**—leaving you to do the hard work of an architect and builder.\n\nFuturMaster offers a third option. We don't give you a research project or a box of parts. We hand you the keys to a **'sturdy castle designed and built by experts'**. The choice is simple: Do you want to be a researcher, a builder, or the leader of a global brand? We think the answer is obvious."
    };

    // Parse using existing parser function to maintain compatibility
    const sections = parseGeminiResponse(JSON.stringify(hardcodedOutput));
    
    return NextResponse.json({ sections });

  } catch (error) {
    console.error('Error generating content:', error);
    
    // Return fallback mock data
    const mockSections = [
      {
        title: "Your Forecasts Are Guessing",
        content: `In today's beauty market, volatility isn't a temporary disruption; it's the new climate. You are striving to **share a realistic and feasible vision of future turnover** in a world defined by volatility and shifting consumer behavior.

Relying on old tools for this is like navigating a storm with a paper map. For companies where customer service is paramount, guessing isn't an option. You need to stop reacting and start anticipating.`
      },
      {
        title: "From Chaos to Clarity", 
        content: `We don't sell software; we deliver a competitive advantage designed for a **VUCA world**. Our **BLOOM DEMAND PLANNING** module was built to turn your complexity into a strength.

It's not about more spreadsheets. It's about intelligence.

• Leverage **Forecast at Scale technology** to process massive amounts of internal and external data for accurate, responsive demand plans.
• Benefit from **advanced algorithms, event detection, and exception management** to see the future with unprecedented clarity.`
      },
      {
        title: "How The World Leader Leads",
        content: `This isn't theory. This is how the **#1 cosmetics group worldwide**, L'Oréal, navigates volatility. For **over 20 years**, they have trusted FuturMaster to be their core Demand Planning solution.

Their goal was simple: provide the **most accurate sell-in sales forecast** possible. Today, our platform is deployed in **80 countries**, supporting **3,250 users** who rely on it to maintain performance and customer service. The best in the world don't settle for second-best tools.`
      },
      {
        title: "Researcher or Market Leader?",
        content: `Some competitors, like **o9 Solutions**, will offer you a "Digital Brain"—a grand, theoretical platform that you must spend years "training" with a team of data scientists. It's an **expensive academic research project**, not a solution.

We think that's insane. Your time should be spent **winning the market, not experimenting in an academic sandbox**.

We give you an **out-of-the-box 'Swiss Army knife'**, sharpened by decades of expertise. The choice is simple: do you want to be a platform researcher or a market leader?`
      }
    ];
    
    return NextResponse.json({ 
      sections: mockSections,
      fallback: true 
    });
  }
}

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
    
    // Extract just the JSON object if there's extra text
    if (structuredText.includes('{') && structuredText.includes('}')) {
      const startIndex = structuredText.indexOf('{');
      const lastIndex = structuredText.lastIndexOf('}');
      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        structuredText = structuredText.substring(startIndex, lastIndex + 1);
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