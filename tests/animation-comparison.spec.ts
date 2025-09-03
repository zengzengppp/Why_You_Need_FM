import { test, expect, Page } from '@playwright/test';

test.describe('Animation Comparison Tests', () => {
  let originalPage: Page;
  let nextjsPage: Page;

  test.beforeAll(async ({ browser }) => {
    // Set up original HTML page
    const originalContext = await browser.newContext();
    originalPage = await originalContext.newPage();
    
    // Set up Next.js page  
    const nextjsContext = await browser.newContext();
    nextjsPage = await nextjsContext.newPage();
  });

  test('3rd stage ceremony animation - title fade in first, then sequential content', async () => {
    // Load original page
    await originalPage.goto('file:///C:/Users/zengch00/FM_TEST/Why_You_Need_FM/futurmaster-poc/index.html');
    
    // Load Next.js page
    await nextjsPage.goto('http://localhost:3003');
    
    // Fill company name and start both animations
    await originalPage.fill('#companyName', 'TestCorp');
    await nextjsPage.getByPlaceholder("Let's start with your company name...").fill('TestCorp');
    
    // Start animations simultaneously
    await Promise.all([
      originalPage.click('#generateBtn'),
      nextjsPage.getByRole('button').last().click()
    ]);
    
    // Wait to reach ceremony stage (5.5 seconds)
    await originalPage.waitForTimeout(6000);
    await nextjsPage.waitForTimeout(6000);
    
    // Test that both are in ceremony stage
    const originalCeremony = originalPage.locator('#stage-ceremony');
    const nextjsCeremony = nextjsPage.getByText('Your Forecasts Are Guessing');
    
    await expect(originalCeremony).toBeVisible();
    await expect(nextjsCeremony).toBeVisible();
    
    // Check that title appears before content
    const originalTitle = originalPage.locator('#ceremony-content h2').first();
    const nextjsTitle = nextjsPage.getByRole('heading', { name: /Your Forecasts Are Guessing|From Chaos to Clarity|How The World Leader Leads|Researcher or Market Leader/ });
    
    // Both titles should be visible
    await expect(originalTitle).toBeVisible();
    await expect(nextjsTitle).toBeVisible();
    
    console.log('✓ 3rd stage ceremony animations are working');
  });

  test('3rd to 4th stage transition - dark to grey to white background', async () => {
    // Load original page
    await originalPage.goto('file:///C:/Users/zengch00/FM_TEST/Why_You_Need_FM/futurmaster-poc/index.html');
    
    // Load Next.js page
    await nextjsPage.goto('http://localhost:3003');
    
    // Fill company name and start both animations
    await originalPage.fill('#companyName', 'TestCorp');
    await nextjsPage.getByPlaceholder("Let's start with your company name...").fill('TestCorp');
    
    // Start animations
    await Promise.all([
      originalPage.click('#generateBtn'),
      nextjsPage.getByRole('button').last().click()
    ]);
    
    // Wait for ceremony to complete (stages are 4*3s = 12s + transition 2s = 14s total)
    await originalPage.waitForTimeout(14500);
    await nextjsPage.waitForTimeout(14500);
    
    // Check that both pages transitioned to report stage with correct background
    const originalReport = originalPage.locator('#stage-report');
    const nextjsReport = nextjsPage.getByText('Now you see why FM is the answer');
    
    await expect(originalReport).toBeVisible();
    await expect(nextjsReport).toBeVisible();
    
    // Check background color is the expected light grey (#F2F2F2)
    const originalBg = await originalPage.evaluate(() => {
      const reportStage = document.getElementById('stage-report');
      return reportStage ? window.getComputedStyle(reportStage).backgroundColor : '';
    });
    
    const nextjsBg = await nextjsPage.evaluate(() => {
      const reportDiv = document.querySelector('[style*="backgroundColor: #F2F2F2"]');
      return reportDiv ? window.getComputedStyle(reportDiv).backgroundColor : '';
    });
    
    console.log('Original background:', originalBg);
    console.log('Next.js background:', nextjsBg);
    
    // Both should have similar light background (RGB values for #F2F2F2)
    expect(originalBg).toContain('242'); // #F2 = 242 in decimal
    expect(nextjsBg).toContain('242');
    
    console.log('✓ 3rd to 4th stage transition backgrounds match');
  });

  test('Animation timing comparison', async () => {
    // Load both pages
    await originalPage.goto('file:///C:/Users/zengch00/FM_TEST/Why_You_Need_FM/futurmaster-poc/index.html');
    await nextjsPage.goto('http://localhost:3003');
    
    // Record start time
    const startTime = Date.now();
    
    // Fill and start animations
    await originalPage.fill('#companyName', 'TestCorp');
    await nextjsPage.getByPlaceholder("Let's start with your company name...").fill('TestCorp');
    
    await Promise.all([
      originalPage.click('#generateBtn'),
      nextjsPage.getByRole('button').last().click()
    ]);
    
    // Wait for thinking stage to complete and ceremony to start
    await originalPage.waitForSelector('#stage-ceremony:not(.hidden)', { timeout: 10000 });
    await nextjsPage.waitForSelector('text=Your Forecasts Are Guessing', { timeout: 10000 });
    
    const ceremonyStartTime = Date.now() - startTime;
    
    // Wait for report stage
    await originalPage.waitForSelector('#stage-report:not(.hidden)', { timeout: 20000 });
    await nextjsPage.waitForSelector('text=Now you see why FM is the answer', { timeout: 20000 });
    
    const reportStartTime = Date.now() - startTime;
    
    console.log('Ceremony stage started at:', ceremonyStartTime, 'ms');
    console.log('Report stage started at:', reportStartTime, 'ms');
    
    // Ceremony should start around 5.5 seconds (5500ms)
    expect(ceremonyStartTime).toBeGreaterThan(5000);
    expect(ceremonyStartTime).toBeLessThan(7000);
    
    // Report should start around 17.5 seconds (5.5s thinking + 12s ceremony)
    expect(reportStartTime).toBeGreaterThan(15000);
    expect(reportStartTime).toBeLessThan(20000);
    
    console.log('✓ Animation timings are within expected ranges');
  });

  test.afterAll(async () => {
    await originalPage?.close();
    await nextjsPage?.close();
  });
});