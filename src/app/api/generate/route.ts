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
"section1_title": "## You're Not Building Cars. You're Building a Revolution.",
"section1_content": "Tesla isn't just an automotive company; it's a mission to change the world. But every revolution is won or lost in the logistics, in the supply chain. You're operating in a hyper-volatile world defined by **VUCA** — facing down component shortages, unpredictable demand, and global disruptions. Your mission is to build the future, but you cannot do it with tools from the past. Hope is not a strategy. You need a new weapon.",
"section2_title": "## A Lesson from the World of Sound",
"section2_content": "Consider Sennheiser, a global leader in audio electronics. They faced a familiar battle: a **brutal market for electronic components**, a clunky legacy planning system, and KPIs for reliability they just couldn't hit. They were stuck.\n\nThey didn't need a science project; they needed results. By implementing FuturMaster, they achieved:\n- **+10% improved promised delivery dates** to customers.\n- **-20% inventory reduction** in key regional hubs.\n- **5% less costly, undesired airfreight**.\n\nThey stopped being victims of complexity and started using it as an advantage. They chose a blueprint for victory.",
"section3_title": "## Unleash Complexity with a Digital Twin",
"section3_content": "We don't sell software. We deliver a strategic command center. The **FuturMaster BLOOM** platform is not just a tool; it's a **digital twin of your entire supply network**, from the cobalt mine to the customer's driveway. \n\nIt's built to turn complexity into your greatest strength through:\n- **Global Optimization Algorithms**: Find the single best plan, not just a feasible one.\n- **Horizontal & Vertical Integration**: Create seamless, connected plans from long-term strategy down to the minute-by-minute factory schedule.\n- **Agility & Resilience**: Simulate scenarios instantly to master disruption and achieve the lowest total cost-to-serve.",
"section4_title": "## The Obvious Choice: A Commander's Vehicle",
"section4_content": "Your competitors will offer you two paths to the past.\n\n1.  **o9 Solutions** will sell you a 'Digital Brain'—an expensive academic project that requires a team of data scientists years to 'train'. You're here to win a market, not an academic grant.\n2.  **Kinaxis** will offer you a 'Concurrent Planning' railway track—a rigid, straight path. But your world isn't a simple track; it's a complex, all-terrain battlefield with swamps and mountains.\n\n> The choice is simple: Do you want to be a **researcher** in a lab or a **conductor** on a fixed track? Or do you want to be a **fleet commander**, driving an agile, off-road vehicle designed to conquer the future? "
}
;

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