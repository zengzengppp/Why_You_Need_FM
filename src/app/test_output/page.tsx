'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

export default function TestOutputPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedSections, setParsedSections] = useState<any[]>([]);
  const [parseError, setParseError] = useState('');
  const [currentStage, setCurrentStage] = useState<'setup' | 'ceremony' | 'report'>('setup');
  const [ceremonyStep, setCeremonyStep] = useState(0);
  const [ceremonyAnimation, setCeremonyAnimation] = useState({
    titleVisible: false,
    contentVisible: [] as number[],
    backgroundTransition: false,
    fadingOut: false
  });

  // Smart content splitting function (same as main app)
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

  // Parse function (copied from main app)
  const parseGeminiResponse = (text: string) => {
    try {
      let structuredText = text.trim();
      
      // Handle JSON wrapped in markdown code blocks first
      if (structuredText.includes('```json')) {
        const jsonMatch = structuredText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          structuredText = jsonMatch[1].trim();
        }
      }
      
      // More robust JSON extraction - find proper JSON boundaries
      if (structuredText.includes('{') && structuredText.includes('}')) {
        const startIndex = structuredText.indexOf('{');
        if (startIndex !== -1) {
          let braceCount = 0;
          let endIndex = -1;
          
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
      
      // Try to parse as JSON
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
          throw new Error(`JSON Parse Error: ${e.message}`);
        }
      }
      
      throw new Error('No valid JSON found in response');
      
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw error;
    }
  };

  // Parse JSON input
  const parseJsonInput = () => {
    setParseError('');
    setParsedSections([]);
    
    if (!jsonInput.trim()) {
      setParseError('Please enter JSON content');
      return;
    }
    
    try {
      const sections = parseGeminiResponse(jsonInput);
      setParsedSections(sections);
      setParseError('');
    } catch (error) {
      setParseError(`Parse Error: ${error.message}`);
      setParsedSections([]);
    }
  };

  // Get ceremony paragraphs (using smart splitting)
  const getCeremonyParagraphs = () => {
    if (parsedSections.length >= 4) {
      return parsedSections.map(section => ({
        title: section.title,
        content: typeof section.content === 'string' 
          ? smartSplitContent(section.content)
          : Array.isArray(section.content) 
            ? section.content.filter(p => p.trim())
            : [section.content]
      }));
    }
    return [];
  };

  // Start ceremony test
  const startCeremonyTest = () => {
    setCurrentStage('ceremony');
    setCeremonyStep(0);
    setCeremonyAnimation({
      titleVisible: true,
      contentVisible: [],
      backgroundTransition: false,
      fadingOut: false
    });

    // Simple animation for testing
    setTimeout(() => {
      setCeremonyAnimation(prev => ({ ...prev, contentVisible: [0] }));
    }, 500);
    setTimeout(() => {
      setCeremonyAnimation(prev => ({ ...prev, contentVisible: [0, 1] }));
    }, 1000);
  };

  const startReportTest = () => {
    setCurrentStage('report');
  };

  const getReportSections = () => {
    if (parsedSections.length >= 4) {
      return parsedSections.map(section => ({
        title: section.title.replace(/^#{1,6}\s*/, ''),
        content: section.content
      }));
    }
    return [];
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">LLM Output Test Page</h1>
        
        {/* Setup Stage */}
        {currentStage === 'setup' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">1. Paste LLM JSON Response</h2>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your LLM JSON response here..."
                className="w-full h-40 p-4 border rounded-lg text-sm font-mono resize-vertical"
              />
              <div className="mt-4 flex gap-4">
                <button 
                  onClick={parseJsonInput}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Parse JSON
                </button>
                <button 
                  onClick={() => setJsonInput(`{"section1_title": "## Sample Title 1", "section1_content": "This is **sample** content for section 1 with *italic* text and bullet points:\\n\\n- Point 1\\n- Point 2\\n\\nMore content here.", "section2_title": "## Sample Title 2", "section2_content": "Section 2 content with > blockquotes and **bold** text.", "section3_title": "## Sample Title 3", "section3_content": "Section 3 with tables:\\n\\n| Feature | Value |\\n|---------|--------|\\n| Speed | Fast |\\n| Quality | High |", "section4_title": "## Sample Title 4", "section4_content": "Final section content with various **formatting** and lists:\\n\\n1. First item\\n2. Second item\\n\\nEnd of content."}`)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Load Sample
                </button>
                <button 
                  onClick={() => {setJsonInput(''); setParsedSections([]); setParseError('');}}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear
                </button>
              </div>
            </div>

            {parseError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="text-red-800 font-semibold mb-2">Parse Error:</h3>
                <pre className="text-red-700 text-sm">{parseError}</pre>
              </div>
            )}

            {parsedSections.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Parsed Sections ({parsedSections.length}):</h3>
                {parsedSections.map((section, index) => (
                  <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                    <h4 className="font-medium text-gray-800">{section.title}</h4>
                    <p className="text-sm text-gray-600 mt-2">{section.content.substring(0, 150)}...</p>
                  </div>
                ))}
                
                <div className="mt-6 space-x-4">
                  <button 
                    onClick={startCeremonyTest}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Test Ceremony Display
                  </button>
                  <button 
                    onClick={startReportTest}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Test Report Display
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ceremony Test */}
        {currentStage === 'ceremony' && (
          <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center -m-8">
            <div className="max-w-4xl mx-auto px-6">
              <button 
                onClick={() => setCurrentStage('setup')}
                className="absolute top-4 left-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Setup
              </button>
              
              {(() => {
                const ceremonyParagraphs = getCeremonyParagraphs();
                return ceremonyStep < ceremonyParagraphs.length && (
                  <div className="text-white max-w-3xl mx-auto">
                    <h2 
                      className={`text-4xl md:text-5xl font-bold mb-8 text-center transition-all duration-[800ms] ${
                        ceremonyAnimation.titleVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'
                      }`}
                      style={{ 
                        fontFamily: 'Artifika, serif', 
                        color: ceremonyStep % 2 === 0 ? '#f79d5c' : '#f3752b'
                      }}
                    >
                      {ceremonyParagraphs[ceremonyStep].title.replace(/^#{1,6}\s*/, '')}
                    </h2>
                    <div className="text-lg md:text-xl leading-relaxed space-y-4">
                      {ceremonyParagraphs[ceremonyStep].content.map((p, idx) => (
                        <div 
                          key={idx} 
                          className={`mb-4 transition-all duration-[800ms] ${
                            ceremonyAnimation.contentVisible.includes(idx) 
                              ? 'opacity-100 translate-y-0 scale-100' 
                              : 'opacity-0 translate-y-8 scale-98'
                          }`}
                        >
                          <ReactMarkdown
                            components={{
                              strong: ({ children }) => <strong className="font-semibold text-orange-400">{children}</strong>,
                              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-3">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-3">{children}</ol>,
                              li: ({ children }) => <li className="text-white">{children}</li>,
                              p: ({ children }) => <p className="mb-3 text-white leading-relaxed">{children}</p>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-orange-400 pl-4 italic text-white my-4">{children}</blockquote>
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

        {/* Report Test */}
        {currentStage === 'report' && (
          <div className="min-h-screen bg-gray-100 -m-8 p-8">
            <div className="max-w-4xl mx-auto">
              <button 
                onClick={() => setCurrentStage('setup')}
                className="mb-8 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Setup
              </button>
              
              <h1 className="text-3xl font-medium text-center mb-8 text-gray-800" style={{ fontFamily: 'Artifika, serif' }}>
                Now you see why FM is the answer
              </h1>
              
              <div className="space-y-8">
                {getReportSections().map((section, index) => {
                  const borderColors = ['border-orange-400', 'border-orange-500', 'border-orange-400', 'border-orange-500'];
                  return (
                    <div key={index}>
                      <section className={`pl-4 border-l-4 ${borderColors[index] || 'border-orange-400'}`}>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                          {section.title}
                        </h2>
                        <div className="prose max-w-none text-gray-800
                          prose-strong:text-orange-600 prose-strong:font-semibold
                          prose-ul:space-y-1 prose-ol:space-y-1
                          prose-li:text-gray-800 prose-p:text-gray-800 prose-p:leading-relaxed
                          prose-blockquote:border-l-orange-600 prose-blockquote:text-gray-800
                          prose-hr:border-gray-800 prose-hr:my-8">
                          <ReactMarkdown>
                            {section.content + (index < getReportSections().length - 1 ? '\n\n---' : '')}
                          </ReactMarkdown>
                        </div>
                      </section>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}