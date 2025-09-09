'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [envResult, setEnvResult] = useState<any>(null);
  const [llmResult, setLlmResult] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const testEnvironment = async () => {
    setLoading('env');
    try {
      const response = await fetch('/api/test-env');
      const data = await response.json();
      setEnvResult(data);
      console.log('Environment test result:', data);
    } catch (error) {
      console.error('Environment test failed:', error);
      setEnvResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(null);
    }
  };

  const testLLM = async () => {
    setLoading('llm');
    try {
      console.log('Starting LLM API test...');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName: 'Tesla' })
      });
      
      console.log('LLM API response status:', response.status);
      const data = await response.json();
      console.log('LLM API response data:', data);
      setLlmResult(data);
    } catch (error) {
      console.error('LLM test failed:', error);
      setLlmResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">LLM API Debug Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Environment Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Variables Test</h2>
            <button
              onClick={testEnvironment}
              disabled={loading === 'env'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading === 'env' ? 'Testing...' : 'Test Environment'}
            </button>
            
            {envResult && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(envResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* LLM Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">LLM API Test</h2>
            <button
              onClick={testLLM}
              disabled={loading === 'llm'}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading === 'llm' ? 'Testing...' : 'Test LLM API'}
            </button>
            
            {llmResult && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
                  {JSON.stringify(llmResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700">
            <li>First, test the environment to check if GOOGLE_API_KEY is configured</li>
            <li>If the API key is missing, add it in your deployment platform (Netlify/Vercel)</li>
            <li>Then test the LLM API to see if it works with the key</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">For Netlify:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Go to your Netlify dashboard</li>
            <li>Select your site → Site configuration → Environment variables</li>
            <li>Add: Key: <code className="bg-blue-100 px-1 rounded">GOOGLE_API_KEY</code>, Value: <code className="bg-blue-100 px-1 rounded">AIzaSyA9Kr_T1sQ9De99UGwu9bKFag5CEv9xOAQ</code></li>
            <li>Redeploy your site</li>
          </ol>
        </div>
      </div>
    </div>
  );
}