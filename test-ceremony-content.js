const { chromium } = require('playwright');

async function testCeremonyContent() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to test page
  await page.goto('http://localhost:3003/test_output');
  
  console.log('🧪 Testing Ceremony Content Display Issue');
  
  // Paste the Nike JSON (properly formatted)
  const nikeJson = `{"section1_title": "## The Sprinter in Concrete Shoes", "section1_content": "Nike is not a company. It's a statement. Speed. Performance. Victory. Your brand is built on athletes who break the limits of possibility.\\n\\nBut your supply chain wears concrete shoes.\\n\\nYour brilliant Direct-to-Consumer strategy demands a sprinter's agility, yet your planning is stuck at a marathoner's pace. You face a battlefield of thousands of SKUs, vicious seasonality, and trends that die before your containers cross the ocean. You are trying to win the future while being chained to the past's processes. The world sees the 'swoosh' as a mark of effortless speed; we see the friction holding you back.", "section2_title": "## When Giants Fall Behind", "section2_content": "Consider Adidas content...", "section3_title": "## Just Do It... With Intelligence", "section3_content": "We don't sell software content...", "section4_title": "## The Choice of Champions", "section4_content": "Your competitors will offer you content..."}`;
  
  // Fill the textarea
  await page.fill('textarea', nikeJson);
  
  // Click Parse JSON
  await page.click('button:has-text("Parse JSON")');
  
  // Wait for parsing to complete
  await page.waitForTimeout(1000);
  
  // Check if parsing was successful
  const parseError = await page.locator('.bg-red-50').count();
  if (parseError > 0) {
    console.log('❌ Parse error detected');
    const errorText = await page.locator('.bg-red-50 pre').textContent();
    console.log('Error:', errorText);
    await browser.close();
    return;
  }
  
  console.log('✅ JSON parsed successfully');
  
  // Check parsed sections
  const sectionsCount = await page.locator('.bg-white .bg-gray-50').count();
  console.log(`📊 Found ${sectionsCount} parsed sections`);
  
  // Get the first section content for analysis
  const firstSectionContent = await page.locator('.bg-gray-50').first().locator('p').textContent();
  console.log('🔍 First section preview:', firstSectionContent.substring(0, 100) + '...');
  
  // Test ceremony display
  console.log('\\n🎭 Testing Ceremony Display...');
  await page.click('button:has-text("Test Ceremony Display")');
  
  // Wait for ceremony to load
  await page.waitForTimeout(2000);
  
  // Check ceremony content
  const ceremonyTitle = await page.locator('h2').textContent();
  console.log('🏆 Ceremony title:', ceremonyTitle);
  
  // Check all visible content paragraphs in ceremony
  const ceremonyParagraphs = await page.locator('.text-lg .mb-4').count();
  console.log(`📝 Visible ceremony paragraphs: ${ceremonyParagraphs}`);
  
  // Get text content of each visible paragraph
  for (let i = 0; i < ceremonyParagraphs; i++) {
    const paragraphText = await page.locator('.text-lg .mb-4').nth(i).textContent();
    console.log(`   Paragraph ${i + 1}: "${paragraphText.substring(0, 50)}..."`);
    
    // Check if this paragraph contains "Your brilliant Direct-to-Consumer"
    if (paragraphText.includes('Your brilliant Direct-to-Consumer')) {
      console.log('✅ Found "Your brilliant Direct-to-Consumer" in ceremony');
    }
  }
  
  // Check if the missing content is there
  const ceremonyFullText = await page.locator('.text-lg').textContent();
  if (ceremonyFullText.includes('Your brilliant Direct-to-Consumer')) {
    console.log('✅ "Your brilliant Direct-to-Consumer" found in ceremony DOM');
  } else {
    console.log('❌ "Your brilliant Direct-to-Consumer" MISSING from ceremony DOM');
    console.log('🔍 Ceremony content length:', ceremonyFullText.length);
  }
  
  // Now test report display
  console.log('\\n📋 Testing Report Display...');
  await page.goBack(); // Go back to setup
  await page.waitForTimeout(500);
  await page.click('button:has-text("Test Report Display")');
  await page.waitForTimeout(1000);
  
  // Check report content
  const reportSections = await page.locator('section').count();
  console.log(`📊 Report sections: ${reportSections}`);
  
  // Check if report has the missing content
  const reportFullText = await page.textContent('body');
  if (reportFullText.includes('Your brilliant Direct-to-Consumer')) {
    console.log('✅ "Your brilliant Direct-to-Consumer" found in report');
  } else {
    console.log('❌ "Your brilliant Direct-to-Consumer" MISSING from report');
  }
  
  console.log('\\n🔬 Analysis Complete');
  
  // Keep browser open for manual inspection
  console.log('Browser kept open for manual inspection...');
  // await browser.close();
}

testCeremonyContent().catch(console.error);