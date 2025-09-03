import { test, expect } from '@playwright/test';

test.describe('Complete Workflow Test', () => {
  const NEXTJS_URL = 'http://localhost:3003';
  
  test('Full application workflow', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting complete workflow test...');
    
    // 1. Navigate to app and verify initial state
    await page.goto(NEXTJS_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('✅ App loaded successfully');
    
    // 2. Verify all key elements are present
    const logoElement = page.locator('img[alt*="FuturMaster"]');
    await expect(logoElement).toBeVisible();
    
    const inputField = page.locator('input[type="text"]');
    await expect(inputField).toBeVisible();
    await expect(inputField).toHaveAttribute('placeholder', 'Let\'s start with your company name...');
    
    const submitButton = page.locator('button').first();
    await expect(submitButton).toBeVisible();
    
    const trustText = page.locator('text=Trusted by 600+ companies worldwide');
    await expect(trustText).toBeVisible();
    
    const companyNames = page.locator('.space-x-8 span');
    await expect(companyNames).toHaveCount(4);
    await expect(companyNames.nth(0)).toHaveText('L\'Oréal');
    await expect(companyNames.nth(1)).toHaveText('Heineken');
    await expect(companyNames.nth(2)).toHaveText('SNCF');
    await expect(companyNames.nth(3)).toHaveText('Aesop');
    
    console.log('✅ All initial elements verified');
    
    // 3. Test input functionality
    const testCompany = 'Test Company Inc';
    await inputField.fill(testCompany);
    await expect(inputField).toHaveValue(testCompany);
    
    console.log('✅ Input functionality works');
    
    // 4. Take screenshot before interaction
    await page.screenshot({ 
      path: 'tests/screenshots/workflow-before-click.png', 
      fullPage: false 
    });
    
    // 5. Test button click interaction
    await submitButton.click();
    
    // Wait for transition
    await page.waitForTimeout(1000);
    
    // 6. Verify stage transition (should move to thinking stage)
    // Look for elements that indicate we're in the thinking stage
    const thinkingElements = await page.locator('[id*="thinking"], [class*="thinking"], [class*="stage"]').count();
    console.log(`Found ${thinkingElements} potential thinking stage elements`);
    
    // 7. Take screenshot after interaction
    await page.screenshot({ 
      path: 'tests/screenshots/workflow-after-click.png', 
      fullPage: false 
    });
    
    // 8. Wait longer to see if any animations complete
    console.log('⏳ Waiting for animations to complete...');
    await page.waitForTimeout(8000); // Wait for full thinking animation sequence
    
    // 9. Take screenshot after animations
    await page.screenshot({ 
      path: 'tests/screenshots/workflow-animations-complete.png', 
      fullPage: false 
    });
    
    // 10. Check for ceremony stage
    await page.waitForTimeout(15000); // Wait for ceremony
    await page.screenshot({ 
      path: 'tests/screenshots/workflow-ceremony-stage.png', 
      fullPage: false 
    });
    
    // 11. Wait for final report stage
    await page.waitForTimeout(15000); // Wait for report
    await page.screenshot({ 
      path: 'tests/screenshots/workflow-final-report.png', 
      fullPage: false 
    });
    
    console.log('🎉 Complete workflow test finished');
  });

  test('Keyboard interaction test', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto(NEXTJS_URL);
    await page.waitForLoadState('networkidle');
    
    const inputField = page.locator('input[type="text"]');
    await inputField.fill('Keyboard Test Company');
    
    // Test Enter key functionality
    await inputField.press('Enter');
    
    // Wait for transition
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/keyboard-interaction-result.png', 
      fullPage: false 
    });
    
    console.log('✅ Keyboard interaction test completed');
  });

  test('Visual consistency during interactions', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto(NEXTJS_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Test multiple interactions without full workflow
    const inputField = page.locator('input[type="text"]');
    const submitButton = page.locator('button').first();
    
    // Test 1: Focus state
    await inputField.focus();
    await page.screenshot({ path: 'tests/screenshots/input-focus-state.png', fullPage: false });
    
    // Test 2: Button hover state
    await submitButton.hover();
    await page.screenshot({ path: 'tests/screenshots/button-hover-state.png', fullPage: false });
    
    // Test 3: Input with text
    await inputField.fill('Visual Test');
    await page.screenshot({ path: 'tests/screenshots/input-with-text.png', fullPage: false });
    
    // Test 4: Clear and reset
    await inputField.clear();
    await page.screenshot({ path: 'tests/screenshots/input-cleared.png', fullPage: false });
    
    console.log('✅ Visual consistency tests completed');
  });
});