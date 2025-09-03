import { test, expect } from '@playwright/test';

test.describe('Stage 3 Animation Detailed Analysis', () => {
  test('Compare 3rd stage ceremony animations', async ({ page }) => {
    console.log('=== ITERATION 1: DETAILED 3RD STAGE ANIMATION COMPARISON ===');

    // Test original HTML file first
    console.log('\n--- Testing Original HTML ---');
    await page.goto('file:///C:/Users/zengch00/FM_TEST/Why_You_Need_FM/futurmaster-poc/index.html');
    await page.waitForLoadState('networkidle');
    
    // Fill and submit form
    await page.fill('input[placeholder*="company name"]', 'TestCompany');
    await page.click('button[type="submit"]');
    
    // Wait to reach ceremony stage (5.5s delay)
    await page.waitForTimeout(6000);
    console.log('Original: Reached ceremony stage');
    
    // Take screenshots at multiple ceremony animation points
    await page.screenshot({ path: 'iter1-original-ceremony-start.png', fullPage: true });
    
    // Wait for title animation (original timing ~3s per slide)
    await page.waitForTimeout(1500); // Mid-first slide
    await page.screenshot({ path: 'iter1-original-ceremony-slide1-mid.png', fullPage: true });
    
    await page.waitForTimeout(1500); // End of first slide  
    await page.screenshot({ path: 'iter1-original-ceremony-slide1-end.png', fullPage: true });
    
    await page.waitForTimeout(1500); // Mid-second slide
    await page.screenshot({ path: 'iter1-original-ceremony-slide2-mid.png', fullPage: true });
    
    await page.waitForTimeout(1500); // End of second slide
    await page.screenshot({ path: 'iter1-original-ceremony-slide2-end.png', fullPage: true });
    
    await page.waitForTimeout(1500); // Mid-third slide
    await page.screenshot({ path: 'iter1-original-ceremony-slide3-mid.png', fullPage: true });
    
    await page.waitForTimeout(1500); // End of third slide
    await page.screenshot({ path: 'iter1-original-ceremony-slide3-end.png', fullPage: true });
    
    await page.waitForTimeout(1500); // Background transition
    await page.screenshot({ path: 'iter1-original-ceremony-transition.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Report title animation
    await page.screenshot({ path: 'iter1-original-report-start.png', fullPage: true });
    
    await page.waitForTimeout(1000); // Mid report animation
    await page.screenshot({ path: 'iter1-original-report-mid.png', fullPage: true });
    
    await page.waitForTimeout(1200); // Final report
    await page.screenshot({ path: 'iter1-original-report-final.png', fullPage: true });

    // Test Next.js version
    console.log('\n--- Testing Next.js Version ---');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    // Fill and submit form
    await page.fill('input[placeholder*="company name"]', 'TestCompany');
    await page.click('button svg');
    
    // Wait to reach ceremony stage
    await page.waitForTimeout(6000);
    console.log('Next.js: Reached ceremony stage');
    
    // Take corresponding screenshots with extended timing
    await page.screenshot({ path: 'iter1-nextjs-ceremony-start.png', fullPage: true });
    
    // Extended timing: 8s per slide instead of 3s
    await page.waitForTimeout(2000); // Early in first slide
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide1-early.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Mid-first slide
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide1-mid.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Late in first slide
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide1-late.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Start of second slide
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide2-start.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Mid-second slide
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide2-mid.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Late second slide
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide2-late.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Start third slide
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide3-start.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Mid-third slide
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide3-mid.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Late third slide
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide3-late.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Fourth slide start
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide4-start.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Fourth slide mid
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide4-mid.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Fourth slide late/transition
    await page.screenshot({ path: 'iter1-nextjs-ceremony-slide4-late.png', fullPage: true });
    
    await page.waitForTimeout(3000); // Background transition (extended 5s)
    await page.screenshot({ path: 'iter1-nextjs-ceremony-transition.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Report title start (extended timing)
    await page.screenshot({ path: 'iter1-nextjs-report-start.png', fullPage: true });
    
    await page.waitForTimeout(1500); // Report title mid
    await page.screenshot({ path: 'iter1-nextjs-report-mid.png', fullPage: true });
    
    await page.waitForTimeout(2000); // Report final
    await page.screenshot({ path: 'iter1-nextjs-report-final.png', fullPage: true });
    
    console.log('=== ITERATION 1 COMPLETE - Screenshots captured for detailed analysis ===');
  });
});