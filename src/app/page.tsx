'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

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
  // State management
  const [appState, setAppState] = useState({
    currentStage: 'input',
    companyName: '',
    report: null,
    activeTimers: [] as NodeJS.Timeout[]
  });

  // LLM API state
  const [generatedSections, setGeneratedSections] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(false);

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
  const [expandedThinking, setExpandedThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<any[]>([]);
  const [progressWidth, setProgressWidth] = useState(0);

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
  const [reportTitlePosition, setReportTitlePosition] = useState('center');
  
  // Animation state for ceremony
  const [ceremonyAnimation, setCeremonyAnimation] = useState({
    titleVisible: false,
    contentVisible: [] as number[],
    backgroundTransition: false,
    fadingOut: false
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
    const timerId = setTimeout(() => {
      callback();
      const index = activeTimersRef.current.indexOf(timerId);
      if (index > -1) {
        activeTimersRef.current.splice(index, 1);
      }
    }, delay);
    activeTimersRef.current.push(timerId);
    return timerId;
  }, []);

  const showStage = useCallback((stageName: string) => {
    setAppState(prev => ({ ...prev, currentStage: stageName }));
  }, []);

  // City animation - exact replica of original timing
  const animateCities = useCallback(() => {
    let index = 0;
    const showNextCity = () => {
      if (index >= Math.min(cities.length, 3)) return;
      
      setCurrentCityIndex(index);
      
      // Exact timing: 300ms fade-in delay + 500ms transition duration + 800ms between cities
      addTimer(() => {
        index++;
        showNextCity();
      }, 800);
    };
    
    showNextCity();
  }, [cities.length, addTimer]);

  // Industry animation
  const animateIndustries = useCallback(() => {
    industries.forEach((_, index) => {
      addTimer(() => {
        setVisibleIndustries(prev => [...prev, index]);
      }, index * 300);
    });
  }, [addTimer]);

  // Thinking steps creation
  const createThinkingSteps = useCallback((companyName: string) => {
    return [
      { text: `I need to think how can FM help: '${companyName}'. Time to do some digging.`, duration: 1000 },
      { text: `Searching the web for '${companyName}' supply chain challenges and goal...`, duration: 1200 },
      { text: `Found it! Now I am going to match related FM modules, capacities`, duration: 1000 },
      { text: `Now, let's see who in our success stories matches this client.`, duration: 800 },
      { text: `Nice! I found that FM is perfect for this client, let me write down the reports`, duration: 1000 }
    ];
  }, []);

  // Thinking animation
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

  // Main thinking animation controller
  const animateThinkingSteps = useCallback(() => {
    // Start city animation
    animateCities();
    
    // Switch to industries after cities
    addTimer(() => {
      setShowWorldwide(false);
      setShowIndustries(true);
      animateIndustries();
    }, 2400);
    
    // Start thinking steps immediately
    animateCodeThinking();
  }, [animateCities, animateIndustries, animateCodeThinking, addTimer]);

  // Get ceremony paragraphs - dynamic based on generated content or fallback
  const getCeremonyParagraphs = useCallback(() => {
    if (generatedSections.length >= 4) {
      // Use generated content, split content into paragraphs
      return generatedSections.map(section => ({
        title: section.title,
        content: typeof section.content === 'string' 
          ? section.content.split('\n\n').filter(p => p.trim())
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

  // Ceremony sequence
  const startCeremony = useCallback(() => {
    showStage('ceremony');
    
    const ceremonyParagraphs = getCeremonyParagraphs();
    const ceremonySequence = [
      ...ceremonyParagraphs.map((paragraph, index) => ({
        duration: 3000, // Restored to original 3000ms timing
        background: index % 2 === 0 ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
        content: paragraph,
        step: index
      })),
      {
        duration: 2000, // Restored to original 2000ms timing
        background: '#000000',
        content: null,
        animate: true,
        step: ceremonyParagraphs.length
      }
    ];
    
    let currentStep = 0;
    
    const executeStep = () => {
      if (currentStep >= ceremonySequence.length) {
        // Start background transition animation
        setCeremonyAnimation(prev => ({ ...prev, backgroundTransition: true }));
        
        // Remove conflicting inline styles for CSS animation to work
        if (ceremonyRef.current) {
          ceremonyRef.current.style.background = '';
          ceremonyRef.current.classList.add('animate-black-to-white');
        }
        
        // Show report after transition
        addTimer(() => {
          showMockReport();
        }, 500);
        return;
      }
      
      setCeremonyStep(currentStep);
      
      // Reset animation state for new step - properly clear previous content
      setCeremonyAnimation({
        titleVisible: false,
        contentVisible: [],
        backgroundTransition: false,
        fadingOut: false
      });
      
      // Title fade in first (restored to original timing)
      addTimer(() => {
        setCeremonyAnimation(prev => ({ ...prev, titleVisible: true }));
      }, 300); // Restored to original 300ms
      
      // Content paragraphs fade in sequentially (restored timing)
      if (currentStep < ceremonyParagraphs.length) {
        ceremonyParagraphs[currentStep].content.forEach((_, idx) => {
          addTimer(() => {
            setCeremonyAnimation(prev => ({
              ...prev,
              contentVisible: [...prev.contentVisible, idx]
            }));
          }, 800 + idx * 300); // Restored: start after 800ms, then 300ms between paragraphs
        });
      }
      
      // Start fade out 500ms before next step begins (restored)
      addTimer(() => {
        setCeremonyAnimation(prev => ({ ...prev, fadingOut: true }));
      }, ceremonySequence[currentStep].duration - 500); // Restored to original 500ms
      
      addTimer(() => {
        currentStep++;
        executeStep();
      }, ceremonySequence[currentStep].duration);
    };
    
    executeStep();
  }, [getCeremonyParagraphs, addTimer, showStage]);

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

  // Enhanced markdown processor for robust LLM output handling
  const processMarkdown = (text: string) => {
    if (!text) return '';
    
    // Step 1: Normalize whitespace and line endings
    let processed = text
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\r/g, '\n')    // Handle old Mac line endings
      .trim();
    
    // Step 2: Handle titles - strip markdown but preserve text
    processed = processed
      .replace(/^#{1,6}\s*(.+)$/gm, '$1')  // Remove ## ### etc. but keep title text (space optional)
      .replace(/^(.+)\n={3,}$/gm, '$1')    // Handle underline-style titles
      .replace(/^(.+)\n-{3,}$/gm, '$1');   // Handle dash underline titles
    
    // Step 3: Process bullet points - handle multiple formats
    // First, normalize all bullet types to a consistent format
    processed = processed
      .replace(/^\s*[*•\-]\s*(.+)$/gm, '|||BULLET|||$1')  // Mark all bullets (space optional)
      .replace(/^\s*\d+\.\s*(.+)$/gm, '|||NUMBULLET|||$1'); // Mark numbered lists (space optional)
    
    // Step 4: Convert **text** to <strong>text</strong>
    processed = processed
      .replace(/\*\*(.*?)\*\*/g, '<strong className="font-semibold text-brand-pumpkin">$1</strong>');
    
    // Step 5: Handle line breaks before list processing
    processed = processed
      .replace(/\n\n+/g, '|||PARAGRAPH|||')  // Mark paragraph breaks
      .replace(/\n/g, ' ');  // Convert single line breaks to spaces
    
    // Step 6: Process bullet lists
    // Replace bullet markers with list items
    processed = processed
      .replace(/\|\|\|BULLET\|\|\|([^|]+?)(?=\|\|\|BULLET\|\|\||$)/g, '<li>$1</li>')
      .replace(/\|\|\|NUMBULLET\|\|\|([^|]+?)(?=\|\|\|NUMBULLET\|\|\||$)/g, '<li>$1</li>');
    
    // Step 7: Group consecutive list items into <ul> tags
    processed = processed
      .replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/gs, (match) => {
        return `<ul className="list-disc list-inside space-y-1 my-2">${match}</ul>`;
      });
    
    // Step 8: Restore paragraph breaks
    processed = processed
      .replace(/\|\|\|PARAGRAPH\|\|\|/g, '<br><br>');
    
    // Step 9: Clean up any remaining markers and extra spaces
    processed = processed
      .replace(/\|\|\|[A-Z]+\|\|\|/g, '')  // Remove any remaining markers
      .replace(/\s+/g, ' ')  // Normalize spaces
      .trim();
    
    return processed;
  };

  // Show mock report
  const showMockReport = useCallback(() => {
    showStage('report');
    
    // Title animation sequence (restored to original timing)
    addTimer(() => {
      setReportTitlePosition('visible');
    }, 200); // Restored to original
    
    addTimer(() => {
      setReportTitlePosition('top');
    }, 1200); // Restored to original
    
    addTimer(() => {
      setReportTitlePosition('final');
    }, 2200); // Restored to original
  }, [showStage, addTimer]);

  // Generate report with LLM API call
  const generateReport = useCallback(async () => {
    const companyName = companyNameInputRef.current?.value.trim();
    
    if (!companyName) {
      alert('Please enter a company name');
      return;
    }
    
    setAppState(prev => ({ ...prev, companyName }));
    setIsGenerating(true);
    setApiError(false);
    showStage('thinking');
    
    // Start the thinking animation
    addTimer(() => {
      animateThinkingSteps();
    }, 500);

    // Call the API during the thinking phase
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }),
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      setGeneratedSections(data.sections);
      
      if (data.fallback) {
        setApiError(true);
      }
    } catch (error) {
      console.error('Error calling API:', error);
      setApiError(true);
      // Set fallback data - will use mockReport
      setGeneratedSections([]);
    }

    setIsGenerating(false);
    
    // Start ceremony after thinking completes
    addTimer(() => {
      startCeremony();
    }, 5500); // Keep ceremony start timing the same
  }, [showStage, addTimer, animateThinkingSteps, startCeremony]);

  // Reset app
  const resetApp = useCallback(() => {
    if (companyNameInputRef.current) {
      companyNameInputRef.current.value = '';
    }
    clearAllTimers();
    
    // Reset all state
    setAppState({
      currentStage: 'input',
      companyName: '',
      report: null,
      activeTimers: []
    });
    setShowWorldwide(true);
    setCurrentCityIndex(0);
    setShowIndustries(false);
    setVisibleIndustries([]);
    setExpandedThinking(false);
    setThinkingSteps([]);
    setProgressWidth(0);
    setCeremonyStep(0);
    setReportTitlePosition('center');
    setCeremonyAnimation({
      titleVisible: false,
      contentVisible: [],
      backgroundTransition: false,
      fadingOut: false
    });
    setGeneratedSections([]);
    setIsGenerating(false);
    setApiError(false);
  }, [clearAllTimers]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      generateReport();
    }
  };

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
        
        // Remove elements with high z-index that are likely overlays
        if ((style.position === 'fixed' && 
             (parseInt(style.zIndex) > 1000 || inlineStyle.includes('z-index'))) ||
            el.textContent?.includes('React DevTools') ||
            el.textContent?.includes('Next.js Dev Tools') ||
            el.getAttribute('aria-label')?.includes('dev') ||
            el.getAttribute('aria-label')?.includes('Next.js')) {
          try {
            if (el.parentNode && !el.closest('#app')) {
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
                  <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex-1 flex items-center px-6 py-4">
                      <input 
                        type="text" 
                        ref={companyNameInputRef}
                        placeholder="Let's start with your company name..."
                        className="flex-1 outline-none text-gray-700 text-base bg-transparent"
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                    <button 
                      onClick={generateReport}
                      className="mr-2 p-3 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                    </button>
                  </div>
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
            <div className="w-full h-screen opacity-100 transition-opacity duration-2000">
              {/* Top Half - Global Presence */}
              <div className="h-2/3 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #F2F2F2 0%, #ffffff 100%)' }}>
                <div className="text-center max-w-4xl mx-auto px-6">
                  
                  {/* Cities Section */}
                  {showWorldwide && (
                    <div className="mb-6">
                      <h2 className="text-xl md:text-2xl font-medium text-brand-text mb-6" style={{ fontFamily: 'Artifika, serif' }}>
                        FM is supporting you worldwide, in
                      </h2>
                      <div className="flex justify-center items-center min-h-[160px]">
                        {currentCityIndex < Math.min(cities.length, 3) && (
                          <div 
                            className="flex flex-col items-center transition-all duration-500"
                            style={{
                              opacity: 1,
                              transform: 'scale(1)',
                              animation: 'cityFadeIn 0.8s ease-out'
                            }}
                          >
                            <div className="mb-3">
                              <img src={cities[currentCityIndex].svgFile} alt={cities[currentCityIndex].name} className="w-16 h-16 md:w-20 md:h-20" />
                            </div>
                            <span className="text-base md:text-lg font-medium text-brand-text" style={{ fontFamily: 'Artifika, serif' }}>
                              {cities[currentCityIndex].name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Industries Section */}
                  {showIndustries && (
                    <div>
                      <h2 className="text-xl md:text-2xl font-medium text-brand-text mb-6" style={{ fontFamily: 'Artifika, serif' }}>
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
                          FM Sales Assistant is on it — check progress
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

          {/* Stage 3: Ceremonial Display */}
          {appState.currentStage === 'ceremony' && (
            <div 
              ref={ceremonyRef}
              className={`w-full h-screen flex items-center justify-center transition-all duration-1000 ${
                ceremonyAnimation.backgroundTransition ? 'animate-black-to-white' : ''
              }`}
              style={{ 
                background: ceremonyAnimation.backgroundTransition ? '#000000' :
                  ceremonyStep < getCeremonyParagraphs().length 
                    ? (ceremonyStep % 2 === 0 ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)')
                    : '#000000'
              }}>
              <div className="text-center max-w-4xl mx-auto px-6">
                {(() => {
                  const ceremonyParagraphs = getCeremonyParagraphs();
                  return ceremonyStep < ceremonyParagraphs.length && (
                    <div className="text-white max-w-3xl mx-auto">
                      <h2 
                        className={`text-4xl md:text-5xl font-bold mb-8 text-center transition-all duration-500 ${
                          ceremonyAnimation.fadingOut ? 'opacity-0 translate-y-[-20px]' :
                          ceremonyAnimation.titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                        style={{ 
                          fontFamily: 'Artifika, serif', 
                          color: ceremonyStep % 2 === 0 ? '#f79d5c' : '#f3752b' 
                        }}>
                        {ceremonyParagraphs[ceremonyStep].title.replace(/^#{1,6}\s*/, '')}
                      </h2>
                      <div className="text-lg md:text-xl leading-relaxed space-y-4">
                        {ceremonyParagraphs[ceremonyStep].content.map((p, idx) => (
                        <p 
                          key={idx} 
                          className={`mb-4 transition-all duration-500 ${
                            ceremonyAnimation.fadingOut ? 'opacity-0 translate-y-[-20px]' :
                            ceremonyAnimation.contentVisible.includes(idx) 
                              ? 'opacity-100 translate-y-0' 
                              : 'opacity-0 translate-y-4'
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-brand-sandy">$1</strong>')
                          }} 
                        />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Stage 4: Static Report Interface */}
          {appState.currentStage === 'report' && (
            <div className="min-h-screen py-12 opacity-100 transition-opacity duration-1000" style={{ backgroundColor: '#F2F2F2' }}>
              <div className="max-w-4xl mx-auto p-12 relative">
                {/* Title with animation states */}
                <div 
                  className={`flex justify-center transition-all duration-1000 ${
                    reportTitlePosition === 'center' ? 'fixed inset-x-0 opacity-0' :
                    reportTitlePosition === 'visible' ? 'fixed inset-x-0 opacity-100' :
                    reportTitlePosition === 'top' ? 'fixed inset-x-0 opacity-100' :
                    'relative opacity-100 pb-6 mb-8 text-center'
                  }`}
                  style={{
                    top: reportTitlePosition === 'center' || reportTitlePosition === 'visible' ? '50%' :
                         reportTitlePosition === 'top' ? '120px' : 'auto',
                    transform: reportTitlePosition === 'center' || reportTitlePosition === 'visible' ? 'translateY(-50%)' :
                               reportTitlePosition === 'top' ? 'translateY(0)' : 'none'
                  }}
                >
                  <h1 className="text-3xl font-medium text-brand-text" style={{ fontFamily: 'Artifika, serif' }}>
                    Now you see why FM is the answer
                  </h1>
                </div>
                
                {/* Report Content */}
                <div className={`space-y-8 transition-opacity duration-1000 ${
                  reportTitlePosition === 'final' ? 'opacity-100' : 'opacity-0'
                }`}>
                  {(() => {
                    const reportSections = getCeremonyParagraphs();
                    const borderColors = ['border-brand-sandy', 'border-brand-pumpkin', 'border-brand-sandy', 'border-brand-pumpkin'];
                    
                    return reportSections.map((section, index) => (
                      <section key={index} className={`pl-4 border-l-4 ${borderColors[index] || 'border-brand-sandy'}`}>
                        <h2 className="text-xl font-semibold text-brand-text mb-3">{section.title.replace(/^#{1,6}\s*/, '')}</h2>
                        <div className="text-brand-text leading-relaxed" 
                             dangerouslySetInnerHTML={{ __html: processMarkdown(Array.isArray(section.content) ? section.content.join('\n\n') : section.content) }} />
                      </section>
                    ));
                  })()}
                </div>
                
                {/* CTA Buttons */}
                <div className={`mt-12 flex justify-center space-x-4 transition-opacity duration-1000 ${
                  reportTitlePosition === 'final' ? 'opacity-100' : 'opacity-0'
                }`}>
                  <button className="px-8 py-3 bg-gradient-to-r from-brand-sandy to-brand-pumpkin text-white rounded-lg text-lg font-medium hover:shadow-xl hover:scale-[1.02] focus:ring-2 focus:ring-brand-sandy focus:ring-offset-2 transition-all duration-300">
                    Start Your Journey
                  </button>
                  <button onClick={resetApp} className="px-8 py-3 border-2 border-brand-text text-brand-text rounded-lg text-lg font-medium hover:bg-brand-text hover:text-white transition-all duration-300">
                    Try Another Company
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
    </div>
  );
}