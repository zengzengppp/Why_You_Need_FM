import { test, expect } from '@playwright/test';

test.describe('Final Verification - Iteration 2', () => {
  test('Compare final ceremony and transition animations', async ({ page }) => {
    console.log('=== ITERATION 2: FINAL VERIFICATION ===');

    // Test original HTML 
    console.log('Testing original HTML final run...');
    await page.goto('file:///C:/Users/zengch00/FM_TEST/Why_You_Need_FM/futurmaster-poc/index.html');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="company name"]', 'TestCompany');
    await page.click('#generateBtn');
    
    // Wait for ceremony (5.5s + 12s ceremony + 2s transition = ~20s total)
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'final-orig-ceremony-start.png', fullPage: true });
    
    await page.waitForTimeout(6000); // Mid ceremony
    await page.screenshot({ path: 'final-orig-ceremony-mid.png', fullPage: true });
    
    await page.waitForTimeout(6000); // End ceremony/transition
    await page.screenshot({ path: 'final-orig-transition.png', fullPage: true });
    
    await page.waitForTimeout(4000); // Final report
    await page.screenshot({ path: 'final-orig-report.png', fullPage: true });

    // Test Next.js version with restored timing
    console.log('Testing Next.js final run...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="company name"]', 'TestCompany');
    await page.click('button svg');
    
    // Same timing as original
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'final-next-ceremony-start.png', fullPage: true });
    
    await page.waitForTimeout(6000); // Mid ceremony
    await page.screenshot({ path: 'final-next-ceremony-mid.png', fullPage: true });
    
    await page.waitForTimeout(6000); // End ceremony/transition
    await page.screenshot({ path: 'final-next-transition.png', fullPage: true });
    
    await page.waitForTimeout(4000); // Final report
    await page.screenshot({ path: 'final-next-report.png', fullPage: true });
    
    console.log('=== ITERATION 2 COMPLETE - Both versions should now match! ===');
  });
});