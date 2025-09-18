import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Embedded system prompt (instead of reading from file)
const SYSTEM_PROMPT = `You are a bold, visionary marketing strategist — channeling the disruptive clarity of Steve Jobs.  

1. Search and match stage.
I will give you a company name normally a FMCG, you need first search its the supply chain pain point/challendge, and according to the following knowledge detail in jsons of my company (Advanced planning system vendor), then you need to choose one case most match (in terms of domain of target company, or pain point/challendge/goal) from Sales_Cases_Json.

2. Output pitch stage
Your output task is TWO-STAGE:  
1. **Creative Draft**: First, write a free-form persuasive pitch for a supply chain manager of the target company.  
   - Be imaginative, emotional, and daring.  
   - Use stage-like reveals, sharp contrasts, and punchy language.  State pain point, similar cases, FM methodology, competitor (real name) comparaision
   - IMPORTANT. Use as much as possible related company internal details. So it's based on futurmaster's speciaty, you convince the client.
   - No structure limits. Just make it feel like a Jobs keynote moment.  

2. **Structured Report**: After finishing the draft, **distill it into a Markdown report** in json with strict rules:  
   - Exactly 4 sections: The Hook (Bold and catch attention by pinpoint to painpoint), The Parable (Matched cases study), The Solution (How FM help them and you), The Decision (Compared to our competitors vendors).  Use your own title, dont include Hook/Parable in the title. Use story telling structure, so connects the preceding and the following.
   - Title need to be short and impressive.
   - Each section should not be too long, around 100 words for reference, not strict.
   - Use **short punchy paragraphs**, **bullet points**, and **bold emphasis**.  
   - Output only valid GitHub-flavored Markdown CODE in json (ONLY 4 section titles, and their content, NO pitch_title or others) for the 4 sections, no extra words. Format strictly in : {
"section1_title": "XXX",
"section1_content": "XXX",
"section2_title": "XXX",
"section2_content": "XXX",
"section3_title": "XXX",
"section3_content": "XXX",
"section4_title": "XXX",
"section4_content": "XXX",
}
For markdown: 1. Use ## for section title.   
2. Use bullet (-) and numbered (1.) lists.  
3. Highlight key terms in **bold** or *italic*.  
4. Add > blockquote for key insights or key quote.   

   - Preserve the Jobs-style boldness from Stage 1.  

⚠️ Important: DON'T OUTPUT DRAFT, its just for your own reference to distill the structured version. ONLY OUTPUT STRUCTURED VERSION and NO CITE OF SOURCES like [cite_start][cite: 1]`;

// Embedded sales cases (instead of reading from file)
const SALES_CASES_JSON = `[
  {
    "Profile": {
      "Name": "L'Oréal",
      "Industry": "Beauty & Cosmetics",
      "Highlight": "The world leader in beauty, 1st cosmetics group worldwide",
      "Identifiers": ["Luxury Division", "global brands portfolio"],
      "Scale": ["€32.28B sales (2021)", "85.4k employees", "19.1% operating margin"]
    },
    "Context": {
      "Objective": "Achieve increasing performance & customer service in a volatile world",
      "Challenges": ["VUCA environment", "Shifting consumer behavior (Covid, inflation)", "Understanding turnover segmentation", "Setting accurate statistical trend"]
    },
    "Solution_Impacts": [
      {
        "Challenge": "Inaccurate forecasting in volatile market",
        "Applied_Modules": ["Demand Planning (FuturMaster Bloom)", "Statistical Segmentation", "Automatic Cleansing", "Best Fit Models"],
        "Outcome": { "metric": "Forecast Accuracy", "value": "Significant improvement by better addressing seasonality & trend" }
      },
      {
        "Challenge": "Managing global scale & complexity",
        "Applied_Modules": ["Centralized & Country-level forecasting models"],
        "Outcome": { "metric": "Deployment Scope", "value": ">99% worldwide, 80 countries, 3250 users" }
      }
    ],
    "Key_Tags": {
      "Challenges": ["VUCA", "Forecast_Accuracy", "Consumer_Behavior", "Global_Scale"],
      "Solutions": ["Demand_Planning", "FuturMaster_Bloom", "Statistical_Forecasting"],
      "Outcomes": ["Forecast_Accuracy_Improvement", "Global_Deployment", "Enhanced_Planner_Capabilities"]
    },
    "Partnership": {
      "duration": "20+ years",
      "type": "Strategic"
    },
    "Key_Quote": "Increasing Performance & Customer Service Level in a Volatile World using FuturMaster Bloom. Enhance Demand Planners' Mission...to better serve our end consumers in a volatile world."
  },
  {
    "Profile": {
      "Name": "Heineken",
      "Industry": "Beverage (Beer, Cider)",
      "Highlight": "A diversified global footprint with a winning portfolio of over 300 brands",
      "Identifiers": ["Premium products focus (>40% revenue)"],
      "Scale": []
    },
    "Context": {
      "Objective": "Scale S&OP globally and enhance technology to address localized challenges",
      "Challenges": ["Disparate, non-scalable local solutions", "New IT & business support constraints", "VUCA environment", "Cross-border & cultural complexity"]
    },
    "Solution_Impacts": [
      {
        "Challenge": "Global S&OP Scalability",
        "Applied_Modules": ["S&OP FIT Program (SaaS)", "FuturMaster Bloom (AI/ML)", "Regional Planning Excellence Hubs"],
        "Outcome": { "metric": "Deployment Scope", "value": "27 operating companies in <5 years" }
      },
      {
        "Challenge": "Cross-border Network Optimization",
        "Applied_Modules": ["Global Optimization Algorithms", "Digital Twin Modeling", "Cross-Border Network Optimization Hub"],
        "Outcome": { "metric": "Cost Savings", "value": "Delivered cost savings on logistics and production" }
      }
    ],
    "Key_Tags": {
      "Challenges": ["Global_S&OP", "Scalability", "Legacy_Systems", "VUCA", "Network_Optimization"],
      "Solutions": ["S&OP", "FuturMaster_Bloom", "SaaS", "AI_ML", "Digital_Twin", "Optimization_Hubs"],
      "Outcomes": ["Global_Deployment", "Cost_Savings", "Agility_Resilience_Improvement"]
    },
    "Partnership": {
      "duration": "28 years",
      "type": "Strategic"
    },
    "Key_Quote": "Heineken's S&OP FIT Program, powered by FuturMaster, has successfully delivered planning capabilities into 27 operating companies in less than 5 years. FuturMaster Bloom technology enables to leverage complexity. Our Bloom platform enables to thrive in a challenging era."
  },
  {
    "Profile": {
      "Name": "Sennheiser",
      "Industry": "Audio (Professional, Consumer, Business)",
      "Highlight": "Shaping the future of audio and creating unique sound experiences",
      "Identifiers": ["Global audio company"],
      "Scale": ["€636.3M turnover (2021)"]
    },
    "Context": {
      "Objective": "Transform Supply Chain Planning for high visibility of customer demand",
      "Challenges": ["Difficult market for electronic components", "Unsupported legacy SC planning system", "Off-target KPIs (reliability, availability)"]
    },
    "Solution_Impacts": [
      {
        "Challenge": "Inventory Imbalance & High Costs",
        "Applied_Modules": ["Distribution Planning Plus", "Demand propagation with priorities", "Freight mode optimization"],
        "Outcome": { "metric": "Inventory Reduction", "value": "-5% overall, -20% in Sydney/HK" }
      },
      {
        "Challenge": "Unreliable Delivery Promises",
        "Applied_Modules": ["Available-to-Promise (ATP) across all warehouses", "Production/Purchase Planning (constraint-based)"],
        "Outcome": { "metric": "Promised Delivery Date Improvement", "value": "+10%" }
      }
    ],
    "Key_Tags": {
      "Challenges": ["Legacy_Systems", "Inventory_Management", "Component_Shortage", "Service_Level", "Cost_Reduction"],
      "Solutions": ["Demand_Planning", "Distribution_Planning", "ATP", "Constraint-based_Planning"],
      "Outcomes": ["Inventory_Reduction", "Cost_Reduction", "Service_Level_Improvement"]
    },
    "Partnership": {
      "duration": "Distribution Planning go-live Feb 2021",
      "type": "Project-based"
    },
    "Key_Quote": "'IT projects need to be: process change + organizational change, supported by software'. 'Supply Chain Planning is not a linear process. It runs in integrated circles, and it is very hard to fully grasp the whole process'. Ultimately, 'At one point in time, you will have to have the courage to make a big jump!'"
  }
]`;

export async function POST(request: NextRequest) {
  const requestStart = Date.now();
  console.log(`[${new Date().toISOString()}] API Generate - Request started`);
  
  try {
    const { companyName } = await request.json();
    console.log(`[${new Date().toISOString()}] Company name: ${companyName}`);
    
    if (!companyName) {
      console.log(`[${new Date().toISOString()}] Error: No company name provided`);
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Environment check with detailed logging
    const apiKey = process.env.GOOGLE_API_KEY;
    const hasApiKey = !!apiKey;
    const isDefaultKey = apiKey === 'your-api-key-here';
    
    console.log(`[${new Date().toISOString()}] Environment check:`, {
      hasApiKey,
      isDefaultKey,
      keyLength: apiKey ? apiKey.length : 0,
      nodeEnv: process.env.NODE_ENV,
      platform: process.env.VERCEL ? 'vercel' : 'local'
    });

    // Check if Google API key is available
    if (!apiKey || isDefaultKey) {
      console.log(`[${new Date().toISOString()}] Google API key not configured, using fallback content`);
      // Fall through to fallback content below
    } else {
      // LLM CODE - NOW ENABLED FOR PRODUCTION USE
      console.log(`[${new Date().toISOString()}] Attempting LLM API call...`);
      try {
        // Initialize SDK inside try-catch to catch initialization errors
        console.log(`[${new Date().toISOString()}] Initializing GoogleGenerativeAI SDK...`);
        let genAI;
        try {
          genAI = new GoogleGenerativeAI(apiKey);
          console.log(`[${new Date().toISOString()}] SDK initialized successfully`);
        } catch (initError) {
          console.error(`[${new Date().toISOString()}] SDK initialization failed:`, {
            error: initError instanceof Error ? initError.message : 'Unknown init error',
            stack: initError instanceof Error ? initError.stack : undefined,
            apiKeyLength: apiKey ? apiKey.length : 0,
            apiKeyFormat: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'None'
          });
          throw new Error(`GoogleGenerativeAI initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`);
        }

        // Construct full prompt using embedded content
        const fullPrompt = `${SYSTEM_PROMPT}

=== KNOWLEDGE BASE ===

SALES_CASES_JSON:
${SALES_CASES_JSON}

=== TARGET COMPANY ===
Company Name: ${companyName}

Please analyze this company and provide your two-stage output as specified in the system prompt.`;

        console.log(`[${new Date().toISOString()}] Prompt length: ${fullPrompt.length} characters`);

        // Call Gemini API
        const apiCallStart = Date.now();
        let model;
        try {
          model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
          console.log(`[${new Date().toISOString()}] Model instance created successfully`);
        } catch (modelError) {
          console.error(`[${new Date().toISOString()}] Model creation failed:`, {
            error: modelError instanceof Error ? modelError.message : 'Unknown model error',
            stack: modelError instanceof Error ? modelError.stack : undefined
          });
          throw new Error(`Model creation failed: ${modelError instanceof Error ? modelError.message : 'Unknown error'}`);
        }
        
        console.log(`[${new Date().toISOString()}] Calling Gemini API...`);
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        const apiCallDuration = Date.now() - apiCallStart;
        console.log(`[${new Date().toISOString()}] LLM Response received: ${text.length} characters in ${apiCallDuration}ms`);

        // Parse the response to extract the structured version using improved parser
        const parseStart = Date.now();
        const sections = parseGeminiResponse(text);
        const parseDuration = Date.now() - parseStart;
        
        console.log(`[${new Date().toISOString()}] Response parsed in ${parseDuration}ms, ${sections.length} sections found`);
        
        const totalDuration = Date.now() - requestStart;
        console.log(`[${new Date().toISOString()}] LLM request completed successfully in ${totalDuration}ms`);
        
        return NextResponse.json({ 
          sections,
          source: 'llm',
          timing: {
            total: totalDuration,
            api: apiCallDuration,
            parsing: parseDuration
          }
        });
      } catch (llmError) {
        const errorDuration = Date.now() - requestStart;
        console.error(`[${new Date().toISOString()}] LLM API failed after ${errorDuration}ms:`, {
          error: llmError instanceof Error ? llmError.message : 'Unknown error',
          stack: llmError instanceof Error ? llmError.stack : undefined,
          name: llmError instanceof Error ? llmError.name : undefined
        });
        // Fall through to hardcoded output below
      }
    }

    // USE HARDCODED OUTPUT FOR FALLBACK
    console.log(`[${new Date().toISOString()}] Using hardcoded fallback content`);
    
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
};

    // Parse using existing parser function to maintain compatibility
    const sections = parseGeminiResponse(JSON.stringify(hardcodedOutput));
    
    const fallbackDuration = Date.now() - requestStart;
    console.log(`[${new Date().toISOString()}] Fallback content processed in ${fallbackDuration}ms, returning ${sections.length} sections`);
    
    return NextResponse.json({ 
      sections,
      source: 'fallback',
      timing: {
        total: fallbackDuration
      }
    });

  } catch (error) {
    const errorDuration = Date.now() - requestStart;
    console.error(`[${new Date().toISOString()}] Critical error after ${errorDuration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    // Return fallback mock data
    console.log(`[${new Date().toISOString()}] Using emergency mock data fallback`);
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
      source: 'error_fallback'
    });
  }
}

function parseGeminiResponse(text: string) {
  try {
    let structuredText = text.trim();
    
    // The LLM should output ONLY the JSON directly based on System Prompt instructions
    // But handle potential variations in LLM output
    
    // Handle JSON wrapped in markdown code blocks first
    if (structuredText.includes('```json')) {
      const jsonMatch = structuredText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        structuredText = jsonMatch[1].trim();
      }
    }
    
    // More robust JSON extraction - find proper JSON boundaries
    if (structuredText.includes('{') && structuredText.includes('}')) {
      // Find the first opening brace
      const startIndex = structuredText.indexOf('{');
      if (startIndex !== -1) {
        let braceCount = 0;
        let endIndex = -1;
        
        // Count braces to find the matching closing brace
        for (let i = startIndex; i < structuredText.length; i++) {
          if (structuredText[i] === '{') braceCount++;
          if (structuredText[i] === '}') braceCount--;
          
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
        
        if (endIndex !== -1) {
          structuredText = structuredText.substring(startIndex, endIndex + 1);
        }
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
