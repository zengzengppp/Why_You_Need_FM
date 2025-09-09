'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

// Smart content splitting that preserves markdown structure
const smartSplitContent = (content: string) => {
  if (!content || typeof content !== 'string') return [content];
  
  const lines = content.split('\n');
  const chunks = [];
  let currentChunk = [];
  let inList = false;
  let inTable = false;
  let inCodeBlock = false;
  let inBlockquote = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
    
    // Detect code blocks
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      currentChunk.push(lines[i]);
      continue;
    }
    
    // If in code block, add everything
    if (inCodeBlock) {
      currentChunk.push(lines[i]);
      continue;
    }
    
    // Detect tables
    if (line.includes('|') && (line.split('|').length > 2 || nextLine.includes('|'))) {
      inTable = true;
      currentChunk.push(lines[i]);
      continue;
    }
    
    // Exit table when no more | characters
    if (inTable && !line.includes('|') && line !== '') {
      inTable = false;
      // End current chunk and start new one
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n').trim());
        currentChunk = [];
      }
      currentChunk.push(lines[i]);
      continue;
    }
    
    if (inTable) {
      currentChunk.push(lines[i]);
      continue;
    }
    
    // Detect blockquotes
    if (line.startsWith('>')) {
      inBlockquote = true;
      currentChunk.push(lines[i]);
      continue;
    }
    
    if (inBlockquote && !line.startsWith('>') && line !== '') {
      inBlockquote = false;
      // End current chunk
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n').trim());
        currentChunk = [];
      }
      currentChunk.push(lines[i]);
      continue;
    }
    
    if (inBlockquote) {
      currentChunk.push(lines[i]);
      continue;
    }
    
    // Detect lists (numbered or bulleted)
    const isListItem = /^(\d+\.|\-|\*|\+)\s/.test(line);
    
    if (isListItem) {
      inList = true;
      currentChunk.push(lines[i]);
      continue;
    }
    
    // If we were in a list and hit non-list content
    if (inList && !isListItem && line !== '') {
      inList = false;
      // End current chunk and start new one
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n').trim());
        currentChunk = [];
      }
      currentChunk.push(lines[i]);
      continue;
    }
    
    if (inList) {
      currentChunk.push(lines[i]);
      continue;
    }
    
    // Empty line - potential paragraph break
    if (line === '') {
      // Single empty line can be a paragraph separator if not in special structures
      if (!inList && !inTable && !inBlockquote && !inCodeBlock) {
        // This is a paragraph break, end current chunk
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join('\n').trim());
          currentChunk = [];
        }
        continue;
      } else {
        // Keep empty line in current chunk when in special structures
        currentChunk.push(lines[i]);
        continue;
      }
    }
    
    // Regular content line
    currentChunk.push(lines[i]);
  }
  
  // Add any remaining content
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n').trim());
  }
  
  return chunks.filter(chunk => chunk && chunk.trim());
};

// Comprehensive console message suppression
if (typeof window !== 'undefined') {
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  const suppressedPatterns = [
    'React DevTools',
    'Download the React DevTools',
    'better development experience',
    'tailwindcss.com should not be used in production',
    'Fast Refresh',
    'rebuilding',
    'Next.js',
    'nextjs',
    'dev tools',
    'development experience',
    'webpack',
    'turbopack'
  ];
  
  const shouldSuppress = (message: string): boolean => {
    return suppressedPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  };
  
  console.info = (...args) => {
    const message = args.join(' ');
    if (shouldSuppress(message)) return;
    originalConsoleInfo.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args.join(' ');
    if (shouldSuppress(message)) return;
    originalConsoleWarn.apply(console, args);
  };
  
  console.log = (...args) => {
    const message = args.join(' ');
    if (shouldSuppress(message)) return;
    originalConsoleLog.apply(console, args);
  };
  
  console.error = (...args) => {
    const message = args.join(' ');
    if (shouldSuppress(message)) return;
    originalConsoleError.apply(console, args);
  };
}

export default function Home() {
  // Debug configuration from environment variables
  const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
  const startStage = process.env.NEXT_PUBLIC_START_STAGE || 'input';
  const animationSpeed = process.env.NEXT_PUBLIC_ANIMATION_SPEED || 'normal';
  const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || 'llm'; // Default to llm instead of mock
  const skipTransitions = process.env.NEXT_PUBLIC_SKIP_TRANSITIONS === 'true';
  const testCompany = process.env.NEXT_PUBLIC_TEST_COMPANY || '';


  // Animation speed multiplier ref to avoid dependency issues
  const speedMultiplierRef = useRef(1);

  // State management
  const [appState, setAppState] = useState({
    currentStage: startStage as 'input' | 'thinking' | 'ceremony' | 'report',
    companyName: testCompany,
    report: null,
    activeTimers: [] as NodeJS.Timeout[]
  });

  // LLM API state
  const [generatedSections, setGeneratedSections] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(false);

  // Debug state
  const [debugState, setDebugState] = useState({
    currentStage: startStage,
    animationSpeed: animationSpeed,
    dataSource: dataSource,
    skipTransitions: skipTransitions
  });

  // Update speed multiplier when debug state changes
  useEffect(() => {
    switch(debugState.animationSpeed) {
      case 'fast': 
        speedMultiplierRef.current = 0.1;
        break;
      case 'slow': 
        speedMultiplierRef.current = 2;
        break;
      case 'skip': 
        speedMultiplierRef.current = 0.01;
        break;
      default: 
        speedMultiplierRef.current = 1;
    }
  }, [debugState.animationSpeed]);

  // Refs
  const companyNameInputRef = useRef<HTMLInputElement>(null);
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressBarExpandedRef = useRef<HTMLDivElement>(null);
  const ceremonyRef = useRef<HTMLDivElement>(null);

  // Animation state
  const [showWorldwide, setShowWorldwide] = useState(true);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [showIndustries, setShowIndustries] = useState(false);
  const [visibleIndustries, setVisibleIndustries] = useState<number[]>([]);
  const [visibleCities, setVisibleCities] = useState<number[]>([]);
  const [expandedThinking, setExpandedThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<any[]>([]);
  const [progressWidth, setProgressWidth] = useState(0);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [llmResponseReceived, setLlmResponseReceived] = useState(false);
  const [upperAnimationMode, setUpperAnimationMode] = useState<'cities' | 'industries'>('cities');
  const [ceremonyStarted, setCeremonyStarted] = useState(false);
  const [thinkingVisible, setThinkingVisible] = useState(false);
  const [sectionTitleVisible, setSectionTitleVisible] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);

  // Direct progress bar update function
  const updateProgressBar = useCallback((percentage: number) => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${percentage}%`;
    }
    if (progressBarExpandedRef.current) {
      progressBarExpandedRef.current.style.width = `${percentage}%`;
    }
    setProgressWidth(percentage);
  }, []);
  const [ceremonyStep, setCeremonyStep] = useState(0);
  const [ceremonyManualMode, setCeremonyManualMode] = useState(false);
  const [reportTitlePosition, setReportTitlePosition] = useState('hidden');
  const [finalTitlePosition, setFinalTitlePosition] = useState(0);
  const titleRef = useRef(null);
  const hiddenTitleRef = useRef(null);
  
  // Fade animation state for ceremony
  const [ceremonyFade, setCeremonyFade] = useState({
    isTransitioning: false,
    isFadingOut: false,
    backgroundTransition: false
  });

  // Cities and industries data
  const cities = [
    { name: 'Paris', svgFile: 'Paris.svg' },
    { name: 'Beijing', svgFile: 'Beijing.svg' },
    { name: 'Shanghai', svgFile: 'Shanghai.svg' },
    { name: 'Singapore', svgFile: 'Singapore.svg' },
    { name: 'Birmingham', svgFile: 'Birminham.svg' },
    { name: 'Rio', svgFile: 'Rio.svg' }
  ];

  const industries = [
    { name: 'Packaged Food', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg> },
    { name: 'Fresh Food', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path></svg> },
    { name: 'Beverages', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> },
    { name: 'Beauty', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m10 20a4 4 0 004-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4zM17 3V1"></path></svg> },
    { name: 'Pharmaceuticals', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg> },
    { name: 'Chemicals', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg> },
    { name: 'Energy', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> },
    { name: 'Electronics', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg> }
  ];

  // Helper functions
  const clearAllTimers = useCallback(() => {
    activeTimersRef.current.forEach(timerId => clearTimeout(timerId));
    activeTimersRef.current = [];
  }, []);

  const addTimer = useCallback((callback: () => void, delay: number) => {
    const adjustedDelay = delay * speedMultiplierRef.current;
    
    const timerId = setTimeout(() => {
      callback();
      const index = activeTimersRef.current.indexOf(timerId);
      if (index > -1) {
        activeTimersRef.current.splice(index, 1);
      }
    }, adjustedDelay);
    activeTimersRef.current.push(timerId);
    return timerId;
  }, []); // No dependencies to prevent recreation during animations

  // URL parameter support and initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stage = urlParams.get('stage');
      const animation = urlParams.get('animation'); 
      const llm = urlParams.get('llm');
      const company = urlParams.get('company');
      
      // Update debug state from URL parameters
      if (stage && ['input', 'thinking', 'ceremony', 'report'].includes(stage)) {
        setDebugState(prev => ({ ...prev, currentStage: stage }));
        setAppState(prev => ({ ...prev, currentStage: stage as any }));
      }
      
      if (animation && ['normal', 'fast', 'slow', 'skip'].includes(animation)) {
        setDebugState(prev => ({ ...prev, animationSpeed: animation }));
      }
      
      if (llm && ['mock', 'llm'].includes(llm)) {
        setDebugState(prev => ({ ...prev, dataSource: llm }));
      }
      
      if (company) {
        setAppState(prev => ({ ...prev, companyName: company }));
        if (companyNameInputRef.current) {
          companyNameInputRef.current.value = company;
        }
      }
    }
  }, []);


  const showStage = useCallback((stageName: string) => {
    setAppState(prev => ({ ...prev, currentStage: stageName }));
  }, []);

  // City animation - show all 6 cities cumulatively over 15 seconds
  const animateCities = useCallback(() => {
    setVisibleCities([]);
    cities.forEach((_, index) => {
      addTimer(() => {
        setVisibleCities(prev => {
          // Prevent duplicates
          if (prev.includes(index)) return prev;
          return [...prev, index];
        });
      }, index * 2500); // 2.5 seconds between each city
    });
  }, [cities.length, addTimer]);

  // Industry animation - show cumulatively over 15 seconds (after cities phase)
  const animateIndustries = useCallback(() => {
    setVisibleIndustries([]);
    industries.forEach((_, index) => {
      addTimer(() => {
        setVisibleIndustries(prev => {
          // Prevent duplicates
          if (prev.includes(index)) return prev;
          return [...prev, index];
        });
      }, index * 1875); // ~1.875 seconds between each industry
    });
  }, [addTimer]);

  // Thinking steps creation - adjusted for 30-second completion
  const createThinkingSteps = useCallback((companyName: string) => {
    return [
      { text: `I need to think how can FM help: '${companyName}'. Time to do some digging.`, duration: 3000 },
      { text: `Searching the web for '${companyName}' supply chain challenges and goal...`, duration: 6000 },
      { text: `Found it! Now I am going to match related FM modules, capacities`, duration: 6000 },
      { text: `Now, let's see who in our success stories matches this client.`, duration: 6000 },
      { text: `Nice! I found that FM is perfect for this client, let me write down the reports`, duration: 15000 }
    ];
  }, []);

  // Thinking animation - exactly 30 seconds total
  const animateCodeThinking = useCallback(() => {
    const steps = createThinkingSteps(appState.companyName);
    let currentStep = 0;
    let completedSteps: any[] = [];
    
    const showNextStep = () => {
      if (currentStep >= steps.length) return;
      
      const step = steps[currentStep];
      const newStep = {
        id: currentStep,
        text: step.text,
        completed: false
      };
      
      completedSteps = [...completedSteps, newStep];
      setThinkingSteps([...completedSteps]);
      
      addTimer(() => {
        // Mark step as completed
        completedSteps = completedSteps.map(s => 
          s.id === currentStep ? { ...s, completed: true } : s
        );
        setThinkingSteps([...completedSteps]);
        
        // Update progress bar - synchronize both progress bars
        const progressPercentage = ((currentStep + 1) / steps.length) * 100;
        updateProgressBar(progressPercentage);
        
        currentStep++;
        if (currentStep < steps.length) {
          addTimer(() => showNextStep(), 400);
        }
      }, step.duration - 300);
    };
    
    showNextStep();
  }, [appState.companyName, createThinkingSteps, addTimer, updateProgressBar]);

  // Upper animation cycle - 30 seconds with cities then industries
  const startUpperAnimationCycle = useCallback(() => {
    if (llmResponseReceived) return;
    
    // Reset states immediately to prevent duplicates
    setShowWorldwide(true);
    setShowIndustries(false);
    setUpperAnimationMode('cities');
    setVisibleCities([]);
    setVisibleIndustries([]);
    
    // Show title for new cycle
    addTimer(() => {
      setSectionTitleVisible(true);
    }, 100);
    
    // Start cities phase (0-15s)
    addTimer(() => {
      if (!llmResponseReceived) {
        animateCities();
      }
    }, 100); // Small delay to ensure state reset
    
    // Switch to industries phase at 15s
    addTimer(() => {
      if (!llmResponseReceived) {
        // Fade out title first
        setSectionTitleVisible(false);
        
        addTimer(() => {
          setShowWorldwide(false);
          setShowIndustries(true);
          setUpperAnimationMode('industries');
          
          // Fade title back in
          addTimer(() => {
            setSectionTitleVisible(true);
          }, 100);
          
          animateIndustries();
        }, 300); // Wait for title fade out
      }
    }, 15000);
    
    // Start next cycle at 30s
    addTimer(() => {
      if (!llmResponseReceived) {
        // Fade out title before switching back to cities
        setSectionTitleVisible(false);
        
        addTimer(() => {
          setAnimationCycle(prev => prev + 1);
          startUpperAnimationCycle();
        }, 300);
      }
    }, 30000);
  }, [llmResponseReceived, animateCities, animateIndustries, addTimer]);
  
  // Main thinking animation controller
  const animateThinkingSteps = useCallback(() => {
    // Start upper animation cycle
    startUpperAnimationCycle();
    
    // Start thinking steps independently (runs once for 30 seconds)
    animateCodeThinking();
  }, [startUpperAnimationCycle, animateCodeThinking]);

  // Initialize animations when jumping to thinking stage
  useEffect(() => {
    if (appState.currentStage === 'thinking') {
      // Reset thinking state and start animations
      setShowWorldwide(true);
      setCurrentCityIndex(0);
      setShowIndustries(false);
      setVisibleIndustries([]);
      setVisibleCities([]);
      setThinkingSteps([]);
      setProgressWidth(0);
      setAnimationCycle(0);
      setLlmResponseReceived(false);
      setUpperAnimationMode('cities');
      setCeremonyStarted(false);
      setSectionTitleVisible(true);
      
      // Start with thinking hidden, then fade in after 100ms
      setThinkingVisible(false);
      addTimer(() => {
        setThinkingVisible(true);
      }, 100);
      
      // Start the thinking animation sequence
      addTimer(() => {
        animateThinkingSteps();
      }, 500);
    }
  }, [appState.currentStage, addTimer, animateThinkingSteps]);



  // Show mock report
  const showMockReport = useCallback(() => {
    showStage('report');
    setReportTitlePosition('hidden'); // Start hidden
    
    // Fade in to center (1.5s)
    addTimer(() => {
      setReportTitlePosition('center');
    }, 100);
    
    // Hold at center for 1s, then start uplift (100ms + 1.5s + 1s = 2.6s)
    addTimer(() => {
      setReportTitlePosition('top'); // Uplift takes 1.5s
    }, 2600);
    
    // Switch to final positioning after uplift (2.6s + 1.5s = 4.1s)
    addTimer(() => {
      setReportTitlePosition('final'); // Content fade in takes 1s
    }, 4100);
  }, [showStage, addTimer]);

  // Get ceremony paragraphs - dynamic based on generated content or fallback
  const getCeremonyParagraphs = useCallback(() => {
    if (generatedSections.length >= 4) {
      // Use generated content, smart split content preserving markdown structure
      return generatedSections.map(section => ({
        title: section.title,
        content: typeof section.content === 'string' 
          ? smartSplitContent(section.content)
          : Array.isArray(section.content) 
            ? section.content.filter(p => p.trim())
            : [section.content]
      }));
    }
    
    // Fallback paragraphs with dynamic company name
    const companyName = appState.companyName || 'your company';
    return [
      {
        title: "Your Forecasts Are Guessing",
        content: [
          `In today's market, volatility isn't a temporary disruption; it's the new climate. ${companyName} is striving to **share a realistic and feasible vision of future turnover** in a world defined by volatility and shifting consumer behavior.`,
          `Relying on old tools for this is like navigating a storm with a paper map. For a company like ${companyName}, where customer service is paramount, guessing isn't an option. You need to stop reacting and start anticipating.`
        ]
      },
      {
        title: "From Chaos to Clarity",
        content: [
          `We don't sell software; we deliver a competitive advantage designed for a **VUCA world**. Our **BLOOM DEMAND PLANNING** module was built to turn your complexity into a strength.`,
          `It's not about more spreadsheets. It's about intelligence.`,
          `• Leverage **Forecast at Scale technology** to process massive amounts of internal and external data for accurate, responsive demand plans.`,
          `• Benefit from **advanced algorithms, event detection, and exception management** to see the future with unprecedented clarity.`
        ]
      },
      {
        title: "How The World Leader Leads",
        content: [
          `This isn't theory. This is how the **#1 cosmetics group worldwide**, L'Oréal, navigates volatility. For **over 20 years**, they have trusted FuturMaster to be their core Demand Planning solution.`,
          `Their goal was simple: provide the **most accurate sell-in sales forecast** possible. Today, our platform is deployed in **80 countries**, supporting **3,250 users** who rely on it to maintain performance and customer service. The best in the world don't settle for second-best tools.`
        ]
      },
      {
        title: "Researcher or Market Leader?",
        content: [
          `Some competitors, like **o9 Solutions**, will offer you a "Digital Brain"—a grand, theoretical platform that you must spend years "training" with a team of data scientists. It's an **expensive academic research project**, not a solution.`,
          `We think that's insane. Your time should be spent **winning the market, not experimenting in an academic sandbox**.`,
          `We give you an **out-of-the-box 'Swiss Army knife'**, sharpened by decades of expertise. The choice is simple: do you want to be a platform researcher or a market leader?`
        ]
      }
    ];
  }, [generatedSections, appState.companyName]);

  // Smooth fade transition function
  const transitionToSlide = useCallback((targetSlide: number) => {
    const ceremonyParagraphs = getCeremonyParagraphs();
    
    if (targetSlide < 0 || targetSlide >= ceremonyParagraphs.length) return;
    if (ceremonyFade.isTransitioning) return; // Prevent multiple transitions
    
    // Clear any existing timers to prevent conflicts
    clearAllTimers();
    
    // Start fade out
    setCeremonyFade({
      isTransitioning: true,
      isFadingOut: true,
      backgroundTransition: false
    });
    
    // After fade out completes (0.3s), change content and fade in
    addTimer(() => {
      setCeremonyStep(targetSlide);
      setCeremonyFade(prev => ({
        ...prev,
        isFadingOut: false
      }));
      
      // After fade in completes (0.5s), end transition
      addTimer(() => {
        setCeremonyFade(prev => ({ ...prev, isTransitioning: false }));
      }, 500);
    }, 300);
  }, [getCeremonyParagraphs, addTimer, ceremonyFade.isTransitioning, clearAllTimers]);
  
  const navigateToNextParagraph = useCallback(() => {
    const ceremonyParagraphs = getCeremonyParagraphs();
    const nextStep = ceremonyStep + 1;
    
    if (nextStep >= ceremonyParagraphs.length) {
      // Last paragraph, trigger background transition and go to report
      setCeremonyFade(prev => ({ ...prev, backgroundTransition: true }));
      addTimer(() => {
        showMockReport();
      }, 2000);
    } else {
      transitionToSlide(nextStep);
    }
  }, [ceremonyStep, getCeremonyParagraphs, transitionToSlide, showMockReport, addTimer]);
  
  const navigateToPreviousParagraph = useCallback(() => {
    const previousStep = ceremonyStep - 1;
    if (previousStep >= 0) {
      transitionToSlide(previousStep);
    }
  }, [ceremonyStep, transitionToSlide]);
  
  const skipToReport = useCallback(() => {
    // Clear any existing timers to prevent conflicts
    clearAllTimers();
    
    // Start immediate fade out of content
    setCeremonyFade({
      isTransitioning: true,
      isFadingOut: true,
      backgroundTransition: false
    });
    
    // After content fades out (0.3s), start background transition
    addTimer(() => {
      setCeremonyFade(prev => ({ 
        ...prev, 
        backgroundTransition: true,
        isFadingOut: false // Content should be invisible now
      }));
      
      // After background transition (2s), show report
      addTimer(() => {
        showMockReport();
      }, 2000);
    }, 300);
  }, [showMockReport, addTimer, clearAllTimers]);

  // Ceremony sequence
  const startCeremony = useCallback(() => {
    // Prevent double initialization
    if (ceremonyStarted) return;
    setCeremonyStarted(true);
    
    // Clear any existing timers to prevent conflicts
    clearAllTimers();
    showStage('ceremony');
    setCeremonyManualMode(true);
    
    // Reset ceremony states - start with content invisible
    setCeremonyStep(0);
    setCeremonyFade({
      isTransitioning: true,
      isFadingOut: false,
      backgroundTransition: false
    });
    
    // 2-second black screen, then smooth fade in for first section
    addTimer(() => {
      setCeremonyFade({
        isTransitioning: false,
        isFadingOut: false,
        backgroundTransition: false
      });
    }, 2000);
  }, [clearAllTimers, showStage, addTimer]);

  // Initialize ceremony when jumping to ceremony stage
  useEffect(() => {
    if (appState.currentStage === 'ceremony') {
      // Reset ceremony state only if not already started to avoid conflicts with jumpToStage
      if (!ceremonyStarted) {
        setCeremonyStep(0);
        setCeremonyManualMode(false);
        setReportTitlePosition('hidden');
        setCeremonyFade({
          isTransitioning: false,
          isFadingOut: false,
          backgroundTransition: false
        });
        
        addTimer(() => {
          startCeremony();
        }, 500);
      }
    }
  }, [appState.currentStage, ceremonyStarted, addTimer, startCeremony]);

  // Mock report data
  const mockReport = {
    hook: `Aesop isn't just selling products; you're crafting an experience of meticulous quality. But the modern market is a chaotic storm of shifting trends and disruptions.

Your brand promises precision and calm. Yet, your supply chain faces a **volatile (VUCA) world**. How can you deliver on that promise when your forecasts are built on yesterday's logic? Relying on old methods is like trying to capture beauty with a blunt instrument. It doesn't work.`,
    parable: `L'Oréal, the **world's #1 cosmetics group**, faced this same chaos. For over **20 years**, they didn't just cope; they chose to dominate.

In a world of shifting consumer desires, they needed to see the future with absolute clarity. They didn't build a planning department; they built a global intelligence engine, one that could provide a **realistic and feasible vision of future turnover** across **80 countries** and for **3,250 users**. They mastered volatility instead of reacting to it.`,
    solution: `This isn't magic; it's the **FuturMaster Bloom platform**. It's the core engine that gives leaders like L'Oréal that clarity. It's not just another tool; it's a new way to operate.

We provide a **core Demand Planning solution** that turns complexity into a competitive edge. It enables:

**Pinpoint Accuracy:** Moving from guesswork to a detailed SKU/Country level forecast.
**AI-Powered Insight:** Using **advanced algorithms and data cleansing** to find the true statistical trend.
**Enhanced Planners:** Transforming your team's mission to truly serve the end consumer.

This is how you achieve **>99% worldwide deployment** and command the market.`,
    decision: `Some platforms, like **Anaplan**, give you a box of "top-tier bricks" and expect you to become an architect. They call it "flexibility"; we call it **"buck-passing."** Do you want to spend your time building a house or leading the beauty industry?

FuturMaster is different. We are **supply chain experts**. We don't hand you a research project; we hand you the keys to a **sturdy castle designed and built by experts**.

The choice is simple: become a platform researcher or a market leader.`
  };

  // Get report sections - dynamic based on generated content or fallback
  const getReportSections = useCallback(() => {
    if (generatedSections.length >= 4) {
      // Use generated content from LLM
      return generatedSections.map(section => ({
        title: section.title.replace(/^#{1,6}\s*/, ''), // Remove markdown headers
        content: section.content
      }));
    }
    
    // Fallback to mock report with dynamic company name
    const companyName = appState.companyName || 'your company';
    return [
      { title: "Your Forecasts Are Guessing", content: mockReport.hook.replace(/Aesop/g, companyName) },
      { title: "Success Stories From The Real World", content: mockReport.parable },
      { title: "The FuturMaster Solution", content: mockReport.solution },
      { title: "Why Choose FuturMaster Over Others?", content: mockReport.decision }
    ];
  }, [generatedSections, appState.companyName]);

  // State for input value
  const [inputValue, setInputValue] = useState('');

  // Generate report with LLM API call
  const generateReport = useCallback(async (companyName?: string) => {
    // Get value from either parameter, inputValue state, or hidden input ref
    const company = companyName || inputValue.trim() || companyNameInputRef.current?.value?.trim() || '';
    
    if (!company) {
      alert('Please enter a company name');
      return;
    }
    
    setAppState(prev => ({ ...prev, companyName: company }));
    setIsGenerating(true);
    setApiError(false);
    setLlmResponseReceived(false);
    setAnimationCycle(0);
    showStage('thinking');
    
    // Start the thinking animation
    addTimer(() => {
      animateThinkingSteps();
    }, 500);

    // Create timeout promise for LLM API calls
    const createTimeoutPromise = (timeoutMs: number) => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API timeout')), timeoutMs);
      });
    };

    // Call the API during the thinking phase (only if using LLM data source)
    if (debugState.dataSource === 'llm') {
      try {
        // Race between API call and timeout (60 seconds max)
        const response = await Promise.race([
          fetch('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyName }),
          }),
          createTimeoutPromise(60000) // 60 second timeout
        ]) as Response;

        if (!response.ok) {
          throw new Error('API call failed');
        }

        const data = await response.json();
        setGeneratedSections(data.sections);
        
        // Log API response for debugging
        console.log('API response data:', {
          source: data.source,
          sectionsCount: data.sections?.length,
          timing: data.timing
        });
        
        if (data.source === 'fallback' || data.source === 'error_fallback') {
          setApiError(true);
          console.log('Using fallback content due to API limitations');
        }
      } catch (error) {
        console.error('Error calling API:', error);
        setApiError(true);
        // Set fallback data - will use mockReport
        setGeneratedSections([]);
      }
    } else {
      // For mock mode, wait at least 5 seconds to show thinking animation
      await new Promise(resolve => setTimeout(resolve, 5000));
      setGeneratedSections([]);
      setApiError(false);
    }

    // Mark LLM response as received and stop animations
    setLlmResponseReceived(true);
    setIsGenerating(false);
    
    // Start ceremony immediately after LLM response
    addTimer(() => {
      startCeremony();
    }, 500);
  }, [showStage, addTimer, animateThinkingSteps, startCeremony, debugState.dataSource]);


  // Handle key press - no longer needed with PlaceholdersAndVanishInput
  // const handleKeyPress function removed as it's handled by the component

  // Aggressive cleanup of development elements
  useEffect(() => {
    // Immediate cleanup
    const aggressiveCleanup = () => {
      // Get all potential dev elements
      const selectors = [
        'button[aria-label*="Next.js"]',
        'button[aria-label*="dev"]',
        'button[aria-label*="Dev"]',
        'div[data-nextjs-dialog]',
        'div[data-nextjs-toast]',
        'div[data-nextjs-overlay]',
        'div[role="alert"]',
        'div[role="status"]',
        '[data-overlay]',
        '[data-nextjs-root]',
        '.__next-build-watcher',
        '[data-nextjs-dialog-overlay]',
        'nextjs-portal',
        '.nextjs-toast',
        '.nextjs-overlay'
      ];
      
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });
        } catch (e) {
          // Ignore errors
        }
      });
      
      // Also check for elements with specific styles
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const inlineStyle = el.getAttribute('style') || '';
        
        // Remove elements with high z-index that are likely overlays, but preserve debug toolbar
        if ((style.position === 'fixed' && 
             (parseInt(style.zIndex) > 1000 || inlineStyle.includes('z-index')) &&
             !el.textContent?.includes('DEBUG MODE')) ||
            el.textContent?.includes('React DevTools') ||
            el.textContent?.includes('Next.js Dev Tools') ||
            el.getAttribute('aria-label')?.includes('dev') ||
            el.getAttribute('aria-label')?.includes('Next.js')) {
          try {
            if (el.parentNode && !el.closest('#app') && !el.textContent?.includes('DEBUG MODE')) {
              el.parentNode.removeChild(el);
            }
          } catch (e) {
            // Ignore errors
          }
        }
      });
    };

    // Run immediately
    aggressiveCleanup();
    
    // Run periodically
    const cleanupInterval = setInterval(aggressiveCleanup, 50);
    
    // Use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      let shouldClean = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const element = node as Element;
              if (element.matches && (
                element.matches('button[aria-label*="Next.js"]') ||
                element.matches('button[aria-label*="dev"]') ||
                element.matches('div[role="alert"]') ||
                element.textContent?.includes('React DevTools'))) {
                shouldClean = true;
              }
            }
          });
        }
      });
      
      if (shouldClean) {
        setTimeout(aggressiveCleanup, 10);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'aria-label']
    });
    
    return () => {
      clearInterval(cleanupInterval);
      observer.disconnect();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Calculate final title position using hidden element
  useEffect(() => {
    if (appState.currentStage === 'report' && hiddenTitleRef.current) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        if (hiddenTitleRef.current) {
          const rect = hiddenTitleRef.current.getBoundingClientRect();
          setFinalTitlePosition(rect.top);
          console.log('Calculated final position:', rect.top);
        }
      }, 100);
    }
  }, [appState.currentStage]);

  // Debug toolbar functions
  const jumpToStage = useCallback((stage: string) => {
    clearAllTimers();
    setAppState(prev => ({ ...prev, currentStage: stage as any }));
    setDebugState(prev => ({ ...prev, currentStage: stage }));
    
    // Initialize animations for direct stage jumps
    if (stage === 'ceremony') {
      setCeremonyStarted(true); // Mark as started to prevent useEffect conflicts
      setCeremonyStep(0);
      setCeremonyManualMode(true);
      setCeremonyFade({
        isTransitioning: true,
        isFadingOut: false,
        backgroundTransition: false
      });
      // 2-second black screen, then smooth fade in first section (same as normal flow)
      addTimer(() => {
        setCeremonyFade({
          isTransitioning: false,
          isFadingOut: false,
          backgroundTransition: false
        });
      }, 2000);
    } else if (stage === 'report') {
      setReportTitlePosition('hidden');
      addTimer(() => showMockReport(), 100);
    }
    
    // Reset ceremonyStarted when leaving ceremony
    if (stage !== 'ceremony') {
      setCeremonyStarted(false);
    }
  }, [clearAllTimers, addTimer, showMockReport]);

  const toggleAnimationSpeed = useCallback(() => {
    const speeds = ['normal', 'fast', 'slow', 'skip'];
    const currentIndex = speeds.indexOf(debugState.animationSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    // Clear all existing timers to prevent conflicts
    clearAllTimers();
    
    // Update speed
    setDebugState(prev => ({ ...prev, animationSpeed: nextSpeed }));
    
    // Restart current stage with new speed  
    const currentStage = appState.currentStage;
    if (currentStage === 'ceremony') {
      // Reset ceremony state and restart
      setCeremonyStep(0);
      setCeremonyAnimation({
        titleVisible: false,
        contentVisible: [],
        backgroundTransition: false,
        fadingOut: false
      });
      addTimer(() => {
        startCeremony();
      }, 100);
    } else if (currentStage === 'report') {
      // Reset and restart report stage
      setReportTitlePosition('hidden');
      addTimer(() => {
        showMockReport();
      }, 100);
    } else if (currentStage === 'thinking') {
      // Only restart thinking stage if we're actually on thinking stage
      // This prevents clearing cities when on other stages
      if (appState.currentStage === 'thinking') {
        setThinkingSteps([]);
        setProgressWidth(0);
        setVisibleCities([]);
        setVisibleIndustries([]);
        setShowWorldwide(true);
        setShowIndustries(false);
        setAnimationCycle(0);
        setLlmResponseReceived(false);
        setUpperAnimationMode('cities');
        addTimer(() => {
          animateThinkingSteps();
        }, 500);
      }
    }
  }, [clearAllTimers, appState.currentStage, addTimer, startCeremony, showMockReport, animateThinkingSteps]);

  const toggleDataSource = useCallback(() => {
    const newSource = debugState.dataSource === 'mock' ? 'llm' : 'mock';
    setDebugState(prev => ({ ...prev, dataSource: newSource }));
  }, [debugState.dataSource]);

  const resetApp = useCallback(() => {
    if (companyNameInputRef.current) {
      companyNameInputRef.current.value = testCompany;
    }
    clearAllTimers();
    
    // Reset all state
    setAppState({
      currentStage: startStage as any,
      companyName: testCompany,
      report: null,
      activeTimers: []
    });
    setShowWorldwide(true);
    setCurrentCityIndex(0);
    setShowIndustries(false);
    setVisibleIndustries([]);
    setVisibleCities([]);
    setExpandedThinking(false);
    setThinkingSteps([]);
    setProgressWidth(0);
    setCeremonyStep(0);
    setReportTitlePosition('center');
    setAnimationCycle(0);
    setLlmResponseReceived(false);
    setUpperAnimationMode('cities');
    setCeremonyStarted(false);
    setCeremonyAnimation({
      titleVisible: false,
      contentVisible: [],
      backgroundTransition: false,
      fadingOut: false
    });
    setGeneratedSections([]);
    setIsGenerating(false);
    setApiError(false);
  }, [clearAllTimers, startStage, testCompany]);

  // Contact modal handlers
  const handleContactClick = useCallback(() => {
    setShowContactModal(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setShowContactModal(false);
  }, []);

  const copyPhoneNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('+65 6224 8239');
      // Could add a toast notification here if needed
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = '+65 6224 8239';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#F2F2F2' }}>

      {/* Main Container */}
      <div id="app" className="min-h-screen flex items-center justify-center">
          
          {/* Stage 1: Input Interface */}
          {appState.currentStage === 'input' && (
            <div className="text-center max-w-2xl mx-auto px-6">
              {/* Logo Image Area */}
              <div className="mb-16">
                <div className="flex justify-center mb-8">
                  <div className="w-full max-w-2xl">
                    <img 
                      src="interface_logo.jpeg" 
                      alt="Why you need FuturMaster" 
                      className="w-full h-auto max-w-full" 
                      style={{ 
                        transform: 'scale(0.5)', 
                        transformOrigin: 'center', 
                        margin: '-60px 0', 
                        userSelect: 'none', 
                        pointerEvents: 'none', 
                        WebkitUserSelect: 'none', 
                        MozUserSelect: 'none', 
                        msUserSelect: 'none' 
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Input Box */}
              <div className="mb-16">
                <div className="relative max-w-3xl mx-auto">
                  <PlaceholdersAndVanishInput
                    placeholders={[
                      "Let's start with your company name...",
                      "Commençons par le nom de votre entreprise...",
                      "让我们从您的公司名称开始..."
                    ]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInputValue(value);
                      if (companyNameInputRef.current) {
                        companyNameInputRef.current.value = value;
                      }
                    }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      // Get the input element from the form and extract its value
                      const form = e.currentTarget;
                      const input = form.querySelector('input[type="text"]') as HTMLInputElement;
                      const companyName = input?.value?.trim() || '';
                      if (companyName) {
                        generateReport(companyName);
                      } else {
                        alert('Please enter a company name');
                      }
                    }}
                  />
                  {/* Hidden input for ref compatibility */}
                  <input 
                    ref={companyNameInputRef}
                    type="hidden"
                  />
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="text-center text-sm" style={{ color: 'rgba(57, 62, 65, 0.6)' }}>
                <p className="mb-2">Trusted by 600+ companies worldwide</p>
                <div className="flex justify-center space-x-8 opacity-60">
                  <span>L'Oréal</span>
                  <span>Heineken</span>
                  <span>SNCF</span>
                  <span>Aesop</span>
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: Thinking State Interface */}
          {appState.currentStage === 'thinking' && (
            <div className={`w-full h-screen transition-opacity duration-1000 ${thinkingVisible ? 'opacity-100' : 'opacity-0'}`}>
              {/* Top Half - Global Presence */}
              <div className="h-2/3 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #F2F2F2 0%, #ffffff 100%)' }}>
                <div className="text-center max-w-4xl mx-auto px-6">
                  
                  {/* Cities Section */}
                  {showWorldwide && (
                    <div className="mb-6">
                      <h2 className={`text-xl md:text-2xl font-medium text-brand-text mb-6 transition-opacity duration-500 ${sectionTitleVisible ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: 'Artifika, serif' }}>
                        FM is supporting you worldwide, in
                      </h2>
                      <div className="flex justify-center items-center min-h-[160px]">
                        <div className="flex flex-wrap justify-center gap-12 items-center transition-all duration-500 ease-out smooth-flex-reposition">
                          {visibleCities.map((cityIndex) => (
                            <div 
                              key={cityIndex}
                              className="flex flex-col items-center transition-all duration-700 ease-out"
                              style={{
                                opacity: 0,
                                transform: 'translateY(20px) scale(0.9)',
                                animation: 'cityFadeIn 0.7s ease-out 0.1s forwards',
                                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              <div className="mb-3">
                                <img src={cities[cityIndex].svgFile} alt={cities[cityIndex].name} className="w-16 h-16 md:w-20 md:h-20" />
                              </div>
                              <span className="text-base md:text-lg font-medium text-brand-text" style={{ fontFamily: 'Artifika, serif' }}>
                                {cities[cityIndex].name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Industries Section */}
                  {showIndustries && (
                    <div>
                      <h2 className={`text-xl md:text-2xl font-medium text-brand-text mb-6 transition-opacity duration-500 ${sectionTitleVisible ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: 'Artifika, serif' }}>
                        FM powers the world's leading companies in
                      </h2>
                      <div className="flex flex-wrap justify-center gap-3 items-center min-h-[100px]">
                        {industries.map((industry, index) => (
                          <div 
                            key={index}
                            className="flex flex-col items-center px-3 py-2 transition-all duration-500"
                            style={{
                              opacity: visibleIndustries.includes(index) ? 1 : 0,
                              transform: visibleIndustries.includes(index) ? 'translateY(0)' : 'translateY(16px)',
                              animationDelay: `${index * 300}ms`,
                              animation: visibleIndustries.includes(index) ? 'industryFadeIn 0.5s ease-out forwards' : 'none'
                            }}
                          >
                            <div className="text-brand-sandy mb-2">{industry.icon}</div>
                            <span className="text-xs font-medium text-brand-text text-center leading-tight">{industry.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Half - Progress Section */}
              <div className="h-1/3 flex items-start justify-center pt-4" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #F2F2F2 100%)' }}>
                <div className="w-full max-w-2xl mx-auto px-6">
                  
                  {/* Collapsed State */}
                  {!expandedThinking && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-3 mb-3">
                        <span className="text-lg font-medium text-brand-text" style={{ fontFamily: 'Artifika, serif' }}>
                          FM Sales Assistant is on it — expand progress
                        </span>
                        <button 
                          onClick={() => setExpandedThinking(true)}
                          className="text-brand-pumpkin hover:text-brand-sandy transition-colors duration-200"
                        >
                          <svg className="w-5 h-5 transform rotate-0 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-300/50 rounded-sm h-1">
                          <div 
                            className="bg-gradient-to-r from-brand-sandy to-brand-pumpkin h-1 rounded-sm transition-all duration-300"
                            style={{ width: `${progressWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Expanded State */}
                  {expandedThinking && (
                    <div>
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <span className="text-lg font-medium text-brand-text" style={{ fontFamily: 'Artifika, serif' }}>
                          FM Sales Assistant is on it — check progress
                        </span>
                        <button 
                          onClick={() => setExpandedThinking(false)}
                          className="text-brand-pumpkin hover:text-brand-sandy transition-colors duration-200"
                        >
                          <svg className="w-5 h-5 transform rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                      </div>
                      
                      {/* Thinking Steps */}
                      <div className="space-y-0">
                        {thinkingSteps.map((step) => (
                          <div key={step.id} className="flex items-center space-x-2 py-0.5 opacity-100 hover:bg-gray-50/50 rounded px-2 -mx-2">
                            <div className="flex-shrink-0">
                              <div className={`w-3 h-3 border rounded-sm relative flex items-center justify-center ${
                                step.completed 
                                  ? 'bg-brand-pumpkin border-brand-pumpkin' 
                                  : 'border-gray-400 bg-white'
                              }`}>
                                {step.completed && (
                                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className={`text-xs flex-1 leading-tight ${
                              step.completed ? 'line-through text-gray-500' : 'text-gray-700'
                            }`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', lineHeight: '1.3' }}>
                              {step.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3">
                        <div className="w-full bg-gray-300/50 rounded-sm h-1">
                          <div 
                            className="bg-gradient-to-r from-brand-sandy to-brand-pumpkin h-1 rounded-sm transition-all duration-300"
                            style={{ width: `${progressWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Ceremonial Display - Fade Mode */}
          {appState.currentStage === 'ceremony' && (
            <div 
              ref={ceremonyRef}
              className={`w-full h-screen relative flex items-center justify-center transition-all duration-1000 ${
                ceremonyFade.backgroundTransition ? 'animate-black-to-white' : ''
              }`}
              style={{ 
                background: ceremonyFade.backgroundTransition 
                  ? undefined 
                  : '#1a1a1a'
              }}>
              
              {/* Fade Container */}
              <div className="text-center max-w-4xl mx-auto px-6">
                {(() => {
                  const ceremonyParagraphs = getCeremonyParagraphs();
                  if (ceremonyStep >= ceremonyParagraphs.length) return null;
                  
                  // Hide content completely during background transition
                  if (ceremonyFade.backgroundTransition) return null;
                  
                  const getFadeAnimation = () => {
                    if (!ceremonyFade.isTransitioning) {
                      // Use consistent smooth fade-in for all sections
                      return 'animate-smooth-fade-in';
                    }
                    return ceremonyFade.isFadingOut ? 'animate-smooth-fade-out' : '';
                  };
                  
                  // During initial loading (isTransitioning=true, isFadingOut=false), hide content
                  const shouldShowContent = !ceremonyFade.isTransitioning || ceremonyFade.isFadingOut;
                  
                  if (!shouldShowContent) return null;
                  
                  return (
                    <div className={`text-white max-w-3xl mx-auto ${getFadeAnimation()}`}>
                      <h2 
                        className="text-4xl md:text-5xl font-bold mb-8 text-center"
                        style={{ 
                          fontFamily: 'Artifika, serif', 
                          color: ceremonyStep % 2 === 0 ? '#f79d5c' : '#f3752b'
                        }}>
                        {ceremonyParagraphs[ceremonyStep].title.replace(/^#{1,6}\s*/, '')}
                      </h2>
                      <div className="text-lg md:text-xl leading-relaxed space-y-4">
                        {ceremonyParagraphs[ceremonyStep].content.map((p, idx) => (
                          <div key={idx} className="mb-4">
                            <ReactMarkdown
                              components={{
                                strong: ({ children }) => <strong className="font-semibold text-brand-sandy">{children}</strong>,
                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-3">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-3">{children}</ol>,
                                li: ({ children }) => <li className="text-white">{children}</li>,
                                p: ({ children }) => <p className="mb-3 text-white leading-relaxed">{children}</p>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-brand-sandy pl-4 italic text-white my-4">{children}</blockquote>
                              }}
                            >
                              {p}
                            </ReactMarkdown>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Manual Control Bar - Only show in manual mode */}
              {appState.currentStage === 'ceremony' && !ceremonyFade.backgroundTransition && (!ceremonyFade.isTransitioning || ceremonyFade.isFadingOut) && (
                <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50">
                  <div className="bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-4 shadow-2xl border border-white/10">
                    {/* Previous Button */}
                    <button
                      onClick={navigateToPreviousParagraph}
                      disabled={ceremonyStep === 0 || ceremonyFade.isTransitioning}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        ceremonyStep === 0 || ceremonyFade.isTransitioning
                          ? 'text-gray-600 cursor-not-allowed' 
                          : 'text-white hover:text-brand-sandy hover:bg-white/10'
                      }`}
                      title="Previous"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    
                    {/* Page Indicator */}
                    <div className="flex space-x-2">
                      {getCeremonyParagraphs().map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === ceremonyStep ? 'bg-brand-sandy' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Next Button */}
                    <button
                      onClick={navigateToNextParagraph}
                      disabled={ceremonyFade.isTransitioning}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        ceremonyFade.isTransitioning
                          ? 'text-gray-600 cursor-not-allowed' 
                          : 'text-white hover:text-brand-sandy hover:bg-white/10'
                      }`}
                      title={ceremonyStep === getCeremonyParagraphs().length - 1 ? "Finish" : "Next"}
                    >
                      {ceremonyStep === getCeremonyParagraphs().length - 1 ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      )}
                    </button>
                    
                    {/* Skip to Report Button */}
                    <div className="w-px h-6 bg-white/20 mx-2"></div>
                    <button
                      onClick={skipToReport}
                      disabled={ceremonyFade.isTransitioning}
                      className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-md ${
                        ceremonyFade.isTransitioning
                          ? 'text-gray-600 cursor-not-allowed' 
                          : 'text-white hover:text-brand-sandy hover:bg-white/10'
                      }`}
                      title="Skip to Report"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 4: Static Report Interface */}
          {appState.currentStage === 'report' && (
            <div
              className="min-h-screen py-12 bg-[#F2F2F2] transition-opacity duration-1000"
            >
              {/* Title with animation states - independent container */}
              <div
                ref={titleRef}
                className={`
                  flex justify-center
                  ${reportTitlePosition !== 'final' ? 'transform transition-all ease-[cubic-bezier(0.4,0,0.2,1)]' : ''}
                  ${reportTitlePosition === 'hidden' || reportTitlePosition === 'center' ? 'duration-[1500ms]' : ''}
                  ${reportTitlePosition === 'top' ? 'duration-[1500ms]' : ''}
                  ${reportTitlePosition === 'hidden' ? 'opacity-0 translate-y-0 fixed inset-x-0 top-1/2 -translate-y-1/2' : ''}
                  ${reportTitlePosition === 'center' ? 'opacity-100 translate-y-0 fixed inset-x-0 top-1/2 -translate-y-1/2' : ''}
                  ${reportTitlePosition === 'top' ? 'opacity-100 fixed inset-x-0 transform-none' : ''}
                  ${reportTitlePosition === 'final' ? 'relative opacity-100 mb-8 max-w-4xl mx-auto px-12' : ''}
                `}
                style={{
                  top: reportTitlePosition === 'top' && finalTitlePosition > 0 
                    ? `${finalTitlePosition}px` 
                    : undefined
                }}
              >
                <h1
                  className="text-3xl font-medium text-brand-text"
                  style={{ fontFamily: 'Artifika, serif' }}
                >
                  Now you see why FM is the answer
                </h1>
              </div>

              {/* Report Content - separate fade-in */}
              <div className="max-w-4xl mx-auto px-12">
                {/* Hidden reference element for position calculation - positioned where final title should be */}
                <div
                  ref={hiddenTitleRef}
                  className="opacity-0 pointer-events-none relative mb-8 flex justify-center"
                >
                  <h1
                    className="text-3xl font-medium text-brand-text"
                    style={{ fontFamily: 'Artifika, serif' }}
                  >
                    Now you see why FM is the answer
                  </h1>
                </div>
                
                <div className={`space-y-8 transition-opacity duration-[1000ms] ${
                  reportTitlePosition === 'final' ? 'opacity-100' : 'opacity-0'
                }`}>
                  {(() => {
                    const reportSections = getReportSections();
                    const borderColors = ['border-brand-sandy', 'border-brand-pumpkin', 'border-brand-sandy', 'border-brand-pumpkin'];
                    
                    return reportSections.map((section, index) => (
                      <div key={index}>
                        <section className={`pl-4 border-l-4 ${borderColors[index] || 'border-brand-sandy'}`}>
                          <h2 className="text-xl font-semibold text-brand-text mb-3">{section.title.replace(/^#{1,6}\s*/, '')}</h2>
                          <div className="prose max-w-none text-brand-text
                            prose-strong:text-brand-pumpkin prose-strong:font-semibold
                            prose-ul:space-y-1 prose-ol:space-y-1
                            prose-li:text-brand-text prose-p:text-brand-text prose-p:leading-relaxed
                            prose-blockquote:border-l-brand-pumpkin prose-blockquote:text-brand-text
                            prose-hr:border-brand-text prose-hr:my-8">
                            <ReactMarkdown>
                              {section.content + (index < reportSections.length - 1 ? '\n\n---' : '')}
                            </ReactMarkdown>
                          </div>
                        </section>
                      </div>
                    ));
                  })()}
                </div>
                
                {/* CTA Buttons */}
                <div className={`mt-12 flex justify-center space-x-4 transition-opacity duration-[1000ms] ${
                  reportTitlePosition === 'final' ? 'opacity-100' : 'opacity-0'
                }`}>
                  <button onClick={handleContactClick} className="px-8 py-3 bg-gradient-to-r from-brand-sandy to-brand-pumpkin text-white rounded-lg text-lg font-medium hover:shadow-xl hover:scale-[1.02] focus:ring-2 focus:ring-brand-sandy focus:ring-offset-2 transition-all duration-300">
                    Start Your Journey
                  </button>
                  <button onClick={resetApp} className="px-8 py-3 border-2 border-brand-text text-brand-text rounded-lg text-lg font-medium hover:bg-border-text hover:text-white transition-all duration-300">
                    I Got Another Company
                  </button>
                </div>
              </div>
            </div>
          )}
        
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeContactModal}>
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button 
              onClick={closeContactModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              style={{ position: 'absolute', top: '16px', right: '16px' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            {/* Content */}
            <div className="text-center pt-4">
              <h3 className="text-2xl font-semibold text-brand-text mb-6" style={{ fontFamily: 'Artifika, serif' }}>
                Call Vincent !
              </h3>
              
              <div className="mb-6">
                <button
                  onClick={copyPhoneNumber}
                  className="text-3xl font-bold text-brand-pumpkin hover:text-brand-sandy transition-colors duration-200 cursor-pointer"
                  title="Click to copy phone number"
                >
                  +65 6224 8239
                </button>
                <p className="text-sm text-gray-500 mt-2">Click to copy</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}