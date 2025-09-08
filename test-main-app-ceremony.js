const { chromium } = require('playwright');

async function testMainAppCeremony() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🧪 Testing Main App Ceremony Content Issue');
  
  // Navigate to main app in LLM mode
  await page.goto('http://localhost:3003/?llm=llm&company=Nike');
  
  // Wait for page load
  await page.waitForTimeout(2000);
  
  // Check if we're in debug mode
  const debugMode = await page.locator('text=DEBUG MODE').count();
  if (debugMode > 0) {
    console.log('✅ Debug mode active');
    
    // Jump directly to ceremony stage
    await page.selectOption('select', 'ceremony');
    await page.waitForTimeout(3000); // Wait for ceremony to load
    
    console.log('🎭 Jumped to ceremony stage');
  } else {
    console.log('❌ Debug mode not active - will test full flow');
    return;
  }
  
  // Check ceremony content
  console.log('\\n🔍 Analyzing Ceremony Content...');
  
  // Get the ceremony title
  const ceremonyTitle = await page.locator('h2').first().textContent();
  console.log('🏆 Ceremony title:', ceremonyTitle);
  
  // Count visible paragraphs in ceremony
  const ceremonyParagraphs = await page.locator('.text-lg .mb-4').count();
  console.log(`📝 Visible ceremony paragraphs: ${ceremonyParagraphs}`);
  
  // Check each paragraph
  for (let i = 0; i < ceremonyParagraphs; i++) {
    const paragraphText = await page.locator('.text-lg .mb-4').nth(i).textContent();
    console.log(`   Paragraph ${i + 1}: "${paragraphText.substring(0, 60)}..."`);
    
    if (paragraphText.includes('Your brilliant Direct-to-Consumer')) {
      console.log('   ✅ Contains "Your brilliant Direct-to-Consumer"');
    }
  }
  
  // Get all ceremony text content
  const allCeremonyText = await page.locator('.text-lg').textContent();
  console.log('\\n📏 Total ceremony content length:', allCeremonyText.length);
  
  if (allCeremonyText.includes('Your brilliant Direct-to-Consumer')) {
    console.log('✅ "Your brilliant Direct-to-Consumer" found in ceremony DOM');
  } else {
    console.log('❌ "Your brilliant Direct-to-Consumer" MISSING from ceremony DOM');
  }
  
  // Check specific missing text
  const missingText = "You are trying to win the future while being chained to the past's processes";
  if (allCeremonyText.includes(missingText)) {
    console.log('✅ Full ending text found');
  } else {
    console.log('❌ Ending text MISSING:', missingText.substring(0, 50) + '...');
  }
  
  // Now check report stage
  console.log('\\n📋 Testing Report Stage...');
  await page.selectOption('select', 'report');
  await page.waitForTimeout(2000);
  
  // Get report content
  const reportText = await page.textContent('body');
  
  if (reportText.includes('Your brilliant Direct-to-Consumer')) {
    console.log('✅ "Your brilliant Direct-to-Consumer" found in report');
  } else {
    console.log('❌ "Your brilliant Direct-to-Consumer" MISSING from report');
  }
  
  if (reportText.includes(missingText)) {
    console.log('✅ Full ending text found in report');
  } else {
    console.log('❌ Ending text MISSING from report');
  }
  
  // Check what data the app actually has
  console.log('\\n🔬 Checking App State...');
  
  const generatedSectionsData = await page.evaluate(() => {
    // Try to access the React component state (this is tricky)
    return window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.getCurrentFiber?.()?.memoizedState?.generatedSections || 'Not accessible';
  });
  
  if (generatedSectionsData !== 'Not accessible') {
    console.log('📊 Generated sections data:', JSON.stringify(generatedSectionsData).substring(0, 200) + '...');
  } else {
    console.log('❌ Cannot access React state directly');
  }
  
  console.log('\\n✅ Test complete - browser kept open for manual inspection');
}

testMainAppCeremony().catch(console.error);