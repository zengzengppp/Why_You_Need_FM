'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

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
  const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock';
  const skipTransitions = process.env.NEXT_PUBLIC_SKIP_TRANSITIONS === 'true';
  const testCompany = process.env.NEXT_PUBLIC_TEST_COMPANY || '';


  // Animation speed multipliers
  const getSpeedMultiplier = () => {
    switch(debugState.animationSpeed) {
      case 'fast': return 0.1; // 调快5倍：从0.5改为0.1
      case 'slow': return 2;
      case 'skip': return 0.01;
      default: return 1;
    }
  };

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
  const [reportTitlePosition, setReportTitlePosition] = useState('hidden');
  const [finalTitlePosition, setFinalTitlePosition] = useState(0);
  const titleRef = useRef(null);
  const hiddenTitleRef = useRef(null);
  
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
    const speedMultiplier = getSpeedMultiplier();
    const adjustedDelay = delay * speedMultiplier;
    
    const timerId = setTimeout(() => {
      callback();
      const index = activeTimersRef.current.indexOf(timerId);
      if (index > -1) {
        activeTimersRef.current.splice(index, 1);
      }
    }, adjustedDelay);
    activeTimersRef.current.push(timerId);
    return timerId;
  }, [debugState.animationSpeed]); // 添加依赖项，确保速度变化时函数会重新创建

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
      { text: `I need to think how can FM help: '${companyName}'. Time to do some digging.`, duration: 6000 },
      { text: `Searching the web for '${companyName}' supply chain challenges and goal...`, duration: 6000 },
      { text: `Found it! Now I am going to match related FM modules, capacities`, duration: 6000 },
      { text: `Now, let's see who in our success stories matches this client.`, duration: 6000 },
      { text: `Nice! I found that FM is perfect for this client, let me write down the reports`, duration: 6000 }
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
    
    // Start cities phase (0-15s)
    addTimer(() => {
      if (!llmResponseReceived) {
        animateCities();
      }
    }, 100); // Small delay to ensure state reset
    
    // Switch to industries phase at 15s
    addTimer(() => {
      if (!llmResponseReceived) {
        setShowWorldwide(false);
        setShowIndustries(true);
        setUpperAnimationMode('industries');
        animateIndustries();
      }
    }, 15000);
    
    // Start next cycle at 30s
    addTimer(() => {
      if (!llmResponseReceived) {
        setAnimationCycle(prev => prev + 1);
        startUpperAnimationCycle();
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
      
      // Start the thinking animation sequence
      addTimer(() => {
        animateThinkingSteps();
      }, 500);
    }
  }, [appState.currentStage, addTimer, animateThinkingSteps]);


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
    // Prevent double initialization
    if (ceremonyStarted) return;
    setCeremonyStarted(true);
    
    // Clear any existing timers to prevent conflicts
    clearAllTimers();
    showStage('ceremony');
    
    // Start with 2-second black screen
    addTimer(() => {
      const ceremonyParagraphs = getCeremonyParagraphs();
      const ceremonySequence = [
        ...ceremonyParagraphs.map((paragraph, index) => ({
          duration: 15000, // Changed from 3000ms to 15000ms (15 seconds)
          background: index % 2 === 0 ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
          content: paragraph,
          step: index
        }))
        // 移除额外的黑屏step，直接在最后一个paragraph完成后触发过渡
      ];
      
      let currentStep = 0;
      
      const executeStep = () => {
        if (currentStep >= ceremonySequence.length) {
          // 所有paragraphs完成，直接触发background过渡到白色并显示report
          setCeremonyAnimation(prev => ({ ...prev, backgroundTransition: true }));
          
          // Show report after transition (blackToWhite动画2秒)
          addTimer(() => {
            showMockReport();
          }, 2000);
          return;
        }
        
        // Reset animation state for new step - keep fadingOut true during transition gap
        setCeremonyAnimation({
          titleVisible: false,
          contentVisible: [],
          backgroundTransition: false,
          fadingOut: true
        });
        
        // Update step and start title fade in (reduced for smoother flow: 500ms → 300ms)
        addTimer(() => {
          setCeremonyStep(currentStep);
          setCeremonyAnimation(prev => ({ ...prev, titleVisible: true, fadingOut: false }));
        }, 300);
        
        // Content paragraphs fade in sequentially (调整: 增加0.8s让标题有足够阅读时间)
        if (currentStep < ceremonyParagraphs.length) {
          ceremonyParagraphs[currentStep].content.forEach((_, idx) => {
            // 递减间隔: 第一段300ms，第二段250ms，第三段200ms，后续180ms
            const intervals = [300, 250, 200, 180, 180, 180];
            const baseDelay = 1000; // Reduced from 1700ms to 1000ms for smoother flow
            const accumulatedDelay = intervals.slice(0, idx).reduce((sum, interval) => sum + interval, 0);
            
            addTimer(() => {
              setCeremonyAnimation(prev => ({
                ...prev,
                contentVisible: [...prev.contentVisible, idx]
              }));
            }, baseDelay + accumulatedDelay);
          });
        }
        
        // Start fade out before next step begins (reduced fade out time: 1500ms → 800ms)
        addTimer(() => {
          setCeremonyAnimation(prev => ({ ...prev, fadingOut: true }));
        }, ceremonySequence[currentStep].duration - 800);
        
        addTimer(() => {
          currentStep++;
          executeStep();
        }, ceremonySequence[currentStep].duration);
      };
      
      executeStep();
    }, 2000); // 2-second initial delay
  }, [getCeremonyParagraphs, addTimer, showStage]);

  // Initialize ceremony when jumping to ceremony stage
  useEffect(() => {
    if (appState.currentStage === 'ceremony') {
      // Reset ceremony state
      setCeremonyStep(0);
      setReportTitlePosition('hidden');
      setCeremonyAnimation({
        titleVisible: false,
        contentVisible: [],
        backgroundTransition: false,
        fadingOut: false
      });
      
      // Only start ceremony if not already started (for debug toolbar jumps)
      if (!ceremonyStarted) {
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

  // Enhanced markdown processor for robust LLM output handling

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
    setLlmResponseReceived(false);
    setAnimationCycle(0);
    showStage('thinking');
    
    // Start the thinking animation
    addTimer(() => {
      animateThinkingSteps();
    }, 500);

    // Simulate 40-second delay for testing
    const simulateDelay = () => {
      return new Promise(resolve => {
        setTimeout(resolve, 40000); // 40 seconds
      });
    };

    // Call the API during the thinking phase (only if using LLM data source)
    if (debugState.dataSource === 'llm') {
      try {
        // For testing: wait for simulated delay AND actual API call
        const [_, response] = await Promise.all([
          simulateDelay(),
          fetch('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyName }),
          })
        ]);

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
    } else {
      // Use mock data with 40-second delay for testing
      await simulateDelay();
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
    if (stage === 'report') {
      setReportTitlePosition('hidden');
      addTimer(() => showMockReport(), 100);
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
      // Reset and restart thinking stage
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
  }, [debugState.animationSpeed, clearAllTimers, appState.currentStage, addTimer, startCeremony, showMockReport, animateThinkingSteps]);

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

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#F2F2F2' }}>
      {/* Debug Toolbar - Only show in debug mode */}
      {debugMode && (
        <div className="fixed top-0 left-0 right-0 bg-black/95 text-white p-2 text-xs font-mono shadow-lg border-b border-gray-600" style={{ zIndex: 999999 }}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <span className="text-yellow-400">🐛 DEBUG MODE</span>
              <span>Stage: <strong>{appState.currentStage}</strong></span>
              <span>Animation: <strong>{debugState.animationSpeed}</strong></span>
              <span>Data: <strong>{debugState.dataSource}</strong></span>
              <span>Company: <strong>{appState.companyName || 'None'}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={appState.currentStage} 
                onChange={(e) => jumpToStage(e.target.value)}
                className="bg-gray-800 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              >
                <option value="input">Input</option>
                <option value="thinking">Thinking</option>
                <option value="ceremony">Ceremony</option>
                <option value="report">Report</option>
              </select>
              <button 
                onClick={toggleAnimationSpeed}
                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-blue-300"
              >
                Speed: {debugState.animationSpeed}
              </button>
              <button 
                onClick={toggleDataSource}
                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-green-300"
              >
                {debugState.dataSource.toUpperCase()}
              </button>
              <button 
                onClick={resetApp}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-red-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div id="app" className={`min-h-screen flex items-center justify-center ${debugMode ? 'pt-12' : ''}`}>
          
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
                        <div className="flex flex-wrap justify-center gap-6 items-center">
                          {visibleCities.map((cityIndex) => (
                            <div 
                              key={cityIndex}
                              className="flex flex-col items-center transition-all duration-500"
                              style={{
                                opacity: 1,
                                transform: 'scale(1)',
                                animation: 'cityFadeIn 0.8s ease-out'
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
                // 当backgroundTransition活跃时，不设置background，让CSS动画类完全控制
                background: ceremonyAnimation.backgroundTransition 
                  ? undefined 
                  : ceremonyStep < getCeremonyParagraphs().length 
                    ? '#1a1a1a'
                    : 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
              }}>
              <div className="text-center max-w-4xl mx-auto px-6">
                {(() => {
                  const ceremonyParagraphs = getCeremonyParagraphs();
                  return ceremonyStep < ceremonyParagraphs.length && (
                    <div className="text-white max-w-3xl mx-auto">
                      <h2 
                        className={`text-4xl md:text-5xl font-bold mb-8 text-center transition-all duration-[800ms] ${
                          ceremonyAnimation.fadingOut ? 'opacity-0 translate-y-[-20px]' :
                          ceremonyAnimation.titleVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'
                        }`}
                        style={{ 
                          fontFamily: 'Artifika, serif', 
                          color: ceremonyStep % 2 === 0 ? '#f79d5c' : '#f3752b',
                          transitionTimingFunction: 'cubic-bezier(0.23, 0, 0.32, 1)'
                        }}>
                        {ceremonyParagraphs[ceremonyStep].title.replace(/^#{1,6}\s*/, '')}
                      </h2>
                      <div className="text-lg md:text-xl leading-relaxed space-y-4">
                        {ceremonyParagraphs[ceremonyStep].content.map((p, idx) => (
                        <div 
                          key={idx} 
                          className={`mb-4 transition-all duration-[800ms] ${
                            ceremonyAnimation.fadingOut ? 'opacity-0 translate-y-[-20px] scale-95' :
                            ceremonyAnimation.contentVisible.includes(idx) 
                              ? 'opacity-100 translate-y-0 scale-100' 
                              : 'opacity-0 translate-y-8 scale-98'
                          }`}
                          style={{
                            transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // 更柔和的缓动函数
                            willChange: 'transform, opacity', // 优化性能，防止微位移
                            backfaceVisibility: 'hidden', // 防止渲染闪烁
                            perspective: 1000 // 启用3D加速，减少位移问题
                          }}
                        >
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
                    const reportSections = [
                      { title: "Your Forecasts Are Guessing", content: mockReport.hook },
                      { title: "Success Stories From The Real World", content: mockReport.parable },
                      { title: "The FuturMaster Solution", content: mockReport.solution },
                      { title: "Why Choose FuturMaster Over Others?", content: mockReport.decision }
                    ];
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
                  <button className="px-8 py-3 bg-gradient-to-r from-brand-sandy to-brand-pumpkin text-white rounded-lg text-lg font-medium hover:shadow-xl hover:scale-[1.02] focus:ring-2 focus:ring-brand-sandy focus:ring-offset-2 transition-all duration-300">
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
    </div>
  );
}