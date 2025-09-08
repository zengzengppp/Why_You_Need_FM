// Quick test to debug the API call issue
const testApiCall = async () => {
  console.log('🔍 Testing API Call Directly...');
  
  try {
    const response = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyName: 'Nike' }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📊 Response data keys:', Object.keys(data));
    
    if (data.sections) {
      console.log('✅ Sections found:', data.sections.length);
      console.log('🏆 First section title:', data.sections[0]?.title);
      console.log('📝 First section content preview:', data.sections[0]?.content.substring(0, 100) + '...');
      
      // Check if it's Nike content or fallback
      const firstContent = data.sections[0]?.content || '';
      if (firstContent.includes('Nike')) {
        console.log('✅ Contains Nike-specific content');
      } else if (firstContent.includes('volatility')) {
        console.log('❌ Using fallback mock content');
      }
    }
    
    if (data.fallback) {
      console.log('⚠️ API returned fallback flag');
    }
    
  } catch (error) {
    console.log('❌ API call failed:', error.message);
  }
};

// Run in Node.js environment
if (typeof fetch === 'undefined') {
  // Use node-fetch for Node.js
  console.log('❌ This test needs to be run in browser console');
  console.log('Copy this code and run in browser console at http://localhost:3003');
} else {
  testApiCall();
}