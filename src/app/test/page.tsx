'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TestPage() {
  const [generatedSections, setGeneratedSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Use static LLM content for testing - no API calls
  useEffect(() => {
    // Simulate loading time for testing
    const loadStaticData = () => {
      setTimeout(() => {
        // Static LLM response data for Tesla
        const staticSections = [
          {
            title: "Your Forecasts Are Guessing",
            content: `In today's electric vehicle market, volatility isn't a temporary disruption; it's the new climate. **Tesla** is striving to **share a realistic and feasible vision of future turnover** in a world defined by supply chain disruptions, semiconductor shortages, and shifting regulatory landscapes.

Relying on traditional forecasting tools for this is like navigating a storm with a paper map. For a company like **Tesla**, where innovation and customer delivery are paramount, guessing isn't an option. You need to stop reacting and start anticipating.`
          },
          {
            title: "From Chaos to Clarity",
            content: `We don't sell software; we deliver a competitive advantage designed for a **VUCA world**. Our **BLOOM DEMAND PLANNING** module was built to turn Tesla's complexity into a strength.

It's not about more spreadsheets. It's about intelligence.

• Leverage **Forecast at Scale technology** to process massive amounts of internal and external data for accurate, responsive demand plans across all vehicle models
• Benefit from **advanced algorithms, event detection, and exception management** to navigate supply chain volatility with unprecedented clarity
• Handle multi-tier manufacturing complexity across Gigafactories globally

| Feature | Traditional Tools | FuturMaster BLOOM |
|---------|------------------|-------------------|
| Data Processing | Limited, manual | Massive scale, automated |
| Volatility Response | Reactive | Predictive |
| Global Coordination | Siloed | Integrated |
| Exception Management | Manual alerts | AI-driven insights |`
          },
          {
            title: "How The World Leader Leads",
            content: `This isn't theory. This is how the **#1 cosmetics group worldwide**, L'Oréal, navigates volatility. For **over 20 years**, they have trusted FuturMaster to be their core Demand Planning solution.

**Tesla** faces similar challenges but in the automotive space:
- Complex multi-tier supply chains
- Global manufacturing coordination
- Volatile demand patterns
- Regulatory compliance across markets

L'Oréal's platform is deployed in **80 countries**, supporting **3,250 users** who rely on it to maintain performance and customer service. The best in the world don't settle for second-best tools.`
          },
          {
            title: "Researcher or Market Leader?",
            content: `Some competitors, like **o9 Solutions**, will offer you a "Digital Brain"—a grand, theoretical platform that you must spend years "training" with a team of data scientists. It's an **expensive academic research project**, not a solution.

We think that's insane. **Tesla's** time should be spent **revolutionizing transportation, not experimenting in an academic sandbox**.

We give you an **out-of-the-box 'Swiss Army knife'**, sharpened by decades of expertise. The choice is simple: do you want to be a platform researcher or a market leader?

> **For Tesla specifically**: Your mission is to accelerate the world's transition to sustainable energy. Every day spent configuring forecasting tools is a day not spent on innovation. Choose the solution that works from day one.`
          }
        ];
        
        setGeneratedSections(staticSections);
        setError(false); // Using static data, not fallback
        setLoading(false);
      }, 1000); // 1 second simulated loading
    };

    loadStaticData();
  }, []);

  // Get ceremony paragraphs - dynamic based on generated content or fallback
  const getCeremonyParagraphs = () => {
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
    
    // Fallback paragraphs
    return [
      {
        title: "Your Forecasts Are Guessing",
        content: [
          `In today's market, volatility isn't a temporary disruption; it's the new climate. Tesla is striving to **share a realistic and feasible vision of future turnover** in a world defined by volatility and shifting consumer behavior.`,
          `Relying on old tools for this is like navigating a storm with a paper map. For a company like Tesla, where customer service is paramount, guessing isn't an option. You need to stop reacting and start anticipating.`
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading LLM content...</p>
        </div>
      </div>
    );
  }

  const reportSections = getCeremonyParagraphs();
  const borderColors = ['border-orange-400', 'border-orange-500', 'border-orange-400', 'border-orange-500'];

  return (
    <div className="min-h-screen py-12 bg-gray-100">
      <div className="max-w-4xl mx-auto p-12 relative">
        {/* Test Page Header */}
        <div className="mb-8 text-center border-b pb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Test Page - Report Display
          </h1>
          <p className="text-gray-600">
            Testing LLM-generated content rendering | Static Tesla data for testing
          </p>
          <p className="text-sm text-gray-500 mt-2">
            URL: <code>http://localhost:3001/test</code>
          </p>
        </div>

        {/* Main Title */}
        <h1 
          className="text-3xl font-medium text-gray-800 text-center pb-6 mb-8"
          style={{ fontFamily: 'Artifika, serif' }}
        >
          Now you see why FM is the answer
        </h1>
        
        {/* Report Content */}
        <div className="space-y-8">
          {reportSections.map((section, index) => (
            <div key={index}>
              <section className={`pl-4 border-l-4 ${borderColors[index] || 'border-orange-400'}`}>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {section.title.replace(/^#{1,6}\s*/, '')}
                </h2>
                <div className="prose max-w-none text-gray-800
                  prose-strong:text-orange-600 prose-strong:font-semibold
                  prose-ul:space-y-1 prose-ol:space-y-1
                  prose-li:text-gray-800 prose-p:text-gray-800 prose-p:leading-relaxed
                  prose-blockquote:border-l-orange-600 prose-blockquote:text-gray-800
                  prose-hr:border-gray-800 prose-hr:my-8">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      strong: ({ children }) => <strong className="font-semibold text-orange-600">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-3">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-3">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-800">{children}</li>,
                      p: ({ children }) => <p className="mb-3 text-gray-800 leading-relaxed">{children}</p>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-orange-600 pl-4 italic text-gray-800 my-4">{children}</blockquote>,
                      table: ({ children }) => (
                        <table className="my-6 w-full [&_th:first-child]:text-center [&_th:first-child]:bg-gray-50 [&_th:first-child]:border-r [&_th:first-child]:border-gray-200 [&_td:first-child]:text-center [&_td:first-child]:font-semibold [&_td:first-child]:bg-gray-50 [&_td:first-child]:border-r [&_td:first-child]:border-gray-200">
                          {children}
                        </table>
                      ),
                      thead: ({ children }) => <thead className="border-b border-gray-200">{children}</thead>,
                      tbody: ({ children }) => <tbody>{children}</tbody>,
                      tr: ({ children }) => <tr className="hover:bg-orange-50 transition-colors duration-200">{children}</tr>,
                      th: ({ children }) => <th className="px-6 py-4 text-center font-semibold text-orange-600">{children}</th>,
                      td: ({ children }) => <td className="px-6 py-3 text-center text-gray-700">{children}</td>,
                      hr: ({ }) => <hr className="border-gray-300 my-8" />
                    }}
                  >
                    {(Array.isArray(section.content) ? section.content.join('\n\n') : section.content) + (index < reportSections.length - 1 ? '\n\n---' : '')}
                  </ReactMarkdown>
                </div>
              </section>
            </div>
          ))}
        </div>
        
        {/* Test Controls */}
        <div className="mt-12 p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Controls</h3>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Reload LLM Content
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Back to Main App
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Data Source:</strong> Static Tesla content for testing</p>
            <p><strong>Sections Found:</strong> {reportSections.length}</p>
            <p><strong>Test Features:</strong> Markdown tables, strong text, lists, blockquotes, horizontal rules</p>
          </div>
        </div>
      </div>
    </div>
  );
}