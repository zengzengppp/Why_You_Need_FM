const { chromium } = require('playwright');

async function captureAnimationTransition() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(500);
  
  // Enter company name and start
  await page.fill('input[placeholder*="company name"]', 'Test Company');
  await page.click('button');
  
  // Wait for thinking stage to complete
  await page.waitForTimeout(5500);
  
  // Now we're in ceremony stage, wait for last section
  await page.waitForTimeout(9000); // 3 sections * 3000ms each
  
  console.log('Starting critical animation capture...');
  
  // Capture screenshots every 300ms during the critical transition
  // Last ceremony section fade out -> black -> white transition -> report title animation
  const screenshots = [];
  for (let i = 0; i < 15; i++) { // 4.5 seconds total
    const timestamp = i * 0.3;
    await page.screenshot({ 
      path: `.playwright-mcp/critical-${timestamp.toFixed(1)}s.png`,
      fullPage: false 
    });
    console.log(`Captured at ${timestamp.toFixed(1)}s`);
    await page.waitForTimeout(300);
  }
  
  await browser.close();
  console.log('Critical animation capture complete!');
}

captureAnimationTransition().catch(console.error);