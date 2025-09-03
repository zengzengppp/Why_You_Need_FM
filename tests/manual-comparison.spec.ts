import { test, expect } from '@playwright/test';

test.describe('Manual Ceremony Comparison', () => {
  test('Take screenshots for manual analysis', async ({ page }) => {
    console.log('=== MANUAL COMPARISON SETUP ===');

    // Test original HTML
    console.log('Testing original HTML...');
    await page.goto('file:///C:/Users/zengch00/FM_TEST/Why_You_Need_FM/futurmaster-poc/index.html');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="company name"]', 'TestCompany');
    await page.click('#generateBtn');
    
    // Wait for ceremony stage
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'manual-orig-ceremony-1.png', fullPage: true });
    
    await page.waitForTimeout(3000);  
    await page.screenshot({ path: 'manual-orig-ceremony-2.png', fullPage: true });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'manual-orig-ceremony-3.png', fullPage: true });
    
    await page.waitForTimeout(5000); // Wait for transition
    await page.screenshot({ path: 'manual-orig-report.png', fullPage: true });

    // Test Next.js version
    console.log('Testing Next.js version...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="company name"]', 'TestCompany');
    await page.click('button svg');
    
    // Wait for ceremony stage
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'manual-next-ceremony-1.png', fullPage: true });
    
    await page.waitForTimeout(8000); // Extended timing
    await page.screenshot({ path: 'manual-next-ceremony-2.png', fullPage: true });
    
    await page.waitForTimeout(8000); // Extended timing
    await page.screenshot({ path: 'manual-next-ceremony-3.png', fullPage: true });
    
    await page.waitForTimeout(8000); // Extended timing
    await page.screenshot({ path: 'manual-next-ceremony-4.png', fullPage: true });
    
    await page.waitForTimeout(10000); // Wait for transition
    await page.screenshot({ path: 'manual-next-report.png', fullPage: true });
    
    console.log('=== MANUAL COMPARISON COMPLETE ===');
  });
});