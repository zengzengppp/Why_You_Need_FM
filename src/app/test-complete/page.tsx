'use client';

import { useState } from 'react';

export default function TestCompletePage() {
  const [companyName, setCompanyName] = useState('Apple');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testComplete = async () => {
    if (!companyName) {
      alert('Please enter a company name');
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-gemini-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }),
      });
      
      const data = await response.json();
      setResult(data);
      
    } catch (error: any) {
      setResult({
        success: false,
        error: `Network Error: ${error.message}`
      });
    }
    
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto' }}>
      <h1>Test Complete Gemini Pipeline</h1>
      
      <div style={{ margin: '20px 0' }}>
        <input 
          type="text" 
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company name"
          style={{ padding: '10px', marginRight: '10px', width: '200px' }}
        />
        <button 
          onClick={testComplete}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            background: '#007cba', 
            color: 'white', 
            border: 'none', 
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Testing...' : 'Test Complete Pipeline'}
        </button>
      </div>
      
      {loading && (
        <div style={{ color: '#666', margin: '20px 0' }}>
          Testing... This may take up to 60 seconds...
        </div>
      )}
      
      {result && (
        <div style={{ 
          margin: '20px 0', 
          padding: '20px', 
          border: '1px solid #ccc', 
          background: result.success ? '#e6ffe6' : '#ffe6e6',
          color: result.success ? '#006600' : '#cc0000'
        }}>
          {result.success ? (
            <>
              <h2>✅ Success!</h2>
              <p><strong>Company:</strong> {result.companyName}</p>
              <p><strong>Response Length:</strong> {result.rawResponseLength} characters</p>
              <p><strong>Prompt Length:</strong> {result.promptLength} characters</p>
              {result.parseError ? (
                <p><strong>Parse Error:</strong> <span style={{color: 'red'}}>{result.parseError}</span></p>
              ) : (
                <p><strong>Parse Status:</strong> ✅ Success</p>
              )}
              {result.parsedSections && (
                <p><strong>Sections Found:</strong> {result.parsedSections.length}</p>
              )}
              
              <h3>Raw LLM Response (first 2000 chars):</h3>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                background: '#f0f0f0', 
                padding: '10px', 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap',
                fontSize: '12px'
              }}>
                {result.rawResponse.substring(0, 2000)}
                {result.rawResponse.length > 2000 && `...\n\n[Response truncated - full length: ${result.rawResponseLength} chars]`}
              </div>
              
              {result.parsedSections && (
                <div style={{ marginTop: '20px' }}>
                  <h3>Parsed Sections:</h3>
                  {result.parsedSections.map((section: any, index: number) => (
                    <div key={index} style={{ 
                      margin: '15px 0', 
                      padding: '15px', 
                      borderLeft: '4px solid #007cba', 
                      background: 'white' 
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        Section {index + 1}: {section.title}
                      </h4>
                      <p style={{ margin: 0, lineHeight: 1.5 }}>
                        {section.content.substring(0, 200)}
                        {section.content.length > 200 && '...'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2>❌ Error</h2>
              <p><strong>Error:</strong> {result.error}</p>
              {result.stack && <pre style={{fontSize: '12px', overflow: 'auto'}}>{result.stack}</pre>}
            </>
          )}
        </div>
      )}
    </div>
  );
}