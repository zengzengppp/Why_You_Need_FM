import { test, expect } from '@playwright/test';

test.describe('Focused Ceremony Animation Test', () => {
  test('Compare ceremony key moments', async ({ page }) => {
    console.log('=== FOCUSED CEREMONY COMPARISON ===');

    // Test original HTML - focus on ceremony
    console.log('Testing original HTML ceremony');
    await page.goto('file:///C:/Users/zengch00/FM_TEST/Why_You_Need_FM/futurmaster-poc/index.html');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="company name"]', 'TestCompany');
    await page.click('button[type="submit"]');
    
    // Wait for ceremony start
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'ceremony-original-start.png', fullPage: true });
    
    // First slide content
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'ceremony-original-slide1.png', fullPage: true });
    
    // Transition to report
    await page.waitForTimeout(10000); // Wait through all slides
    await page.screenshot({ path: 'ceremony-original-transition.png', fullPage: true });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'ceremony-original-report.png', fullPage: true });

    // Test Next.js version
    console.log('Testing Next.js version ceremony');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="company name"]', 'TestCompany');
    await page.click('button svg');
    
    // Wait for ceremony start
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'ceremony-nextjs-start.png', fullPage: true });
    
    // First slide content (extended timing)
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ceremony-nextjs-slide1.png', fullPage: true });
    
    // Wait through ceremony with extended timing
    await page.waitForTimeout(30000); // Extended ceremony duration
    await page.screenshot({ path: 'ceremony-nextjs-transition.png', fullPage: true });
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'ceremony-nextjs-report.png', fullPage: true });
    
    console.log('=== FOCUSED COMPARISON COMPLETE ===');
  });
});