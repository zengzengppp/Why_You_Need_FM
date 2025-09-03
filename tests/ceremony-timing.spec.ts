import { test, expect } from '@playwright/test';

test.describe('Ceremony Timing Test', () => {
  test('Test restored ceremony timing', async ({ page }) => {
    console.log('=== TESTING RESTORED CEREMONY TIMING ===');

    // Test Next.js version with restored timing
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="company name"]', 'TestCompany');
    await page.click('button svg');
    
    console.log('Starting ceremony timing test...');
    
    // Wait for ceremony to start (5.5s)
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'ceremony-timing-slide1.png', fullPage: true });
    console.log('Slide 1 captured');
    
    // Each slide should be 3s, so capture at regular intervals
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'ceremony-timing-slide2.png', fullPage: true });
    console.log('Slide 2 captured');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'ceremony-timing-slide3.png', fullPage: true });
    console.log('Slide 3 captured');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'ceremony-timing-slide4.png', fullPage: true });
    console.log('Slide 4 captured');
    
    // Final black screen with animation (2s)
    await page.waitForTimeout(1000); // Mid-transition
    await page.screenshot({ path: 'ceremony-timing-transition-mid.png', fullPage: true });
    console.log('Transition mid captured');
    
    await page.waitForTimeout(1000); // End of transition
    await page.screenshot({ path: 'ceremony-timing-transition-end.png', fullPage: true });
    console.log('Transition end captured');
    
    // Report should appear
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ceremony-timing-report-start.png', fullPage: true });
    console.log('Report start captured');
    
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'ceremony-timing-report-final.png', fullPage: true });
    console.log('Report final captured');
    
    console.log('=== CEREMONY TIMING TEST COMPLETE ===');
  });
});