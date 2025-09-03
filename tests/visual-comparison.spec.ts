import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

test.describe('Visual Comparison: Next.js vs HTML', () => {
  
  // Test configuration
  const NEXTJS_URL = 'http://localhost:3003';
  const HTML_FILE_PATH = 'C:\\Users\\zengch00\\FM_TEST\\Why_You_Need_FM\\futurmaster-poc\\index.html';
  
  test.beforeAll(async () => {
    // Ensure we're testing in consistent viewport
    test.setTimeout(60000); // 1 minute timeout for thorough testing
  });

  test('Screenshot comparison - Initial state', async ({ page, browser }) => {
    // Set consistent viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('📸 Taking screenshot of original HTML file...');
    
    // Screenshot HTML file
    await page.goto(`file:///${HTML_FILE_PATH}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'tests/screenshots/original-html.png', 
      fullPage: true 
    });
    
    console.log('📸 Taking screenshot of Next.js app...');
    
    // Screenshot Next.js app
    await page.goto(NEXTJS_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'tests/screenshots/nextjs-app.png', 
      fullPage: true 
    });
    
    console.log('✅ Screenshots captured successfully');
  });

  test('Element-by-element comparison', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Test HTML version
    console.log('🔍 Analyzing HTML version...');
    await page.goto(`file:///${HTML_FILE_PATH}`);
    await page.waitForLoadState('networkidle');
    
    const htmlAnalysis = await page.evaluate(() => {
      const analysis = {
        title: '',
        logoSize: { width: 0, height: 0 },
        inputBox: { width: 0, height: 0, borderRadius: '', backgroundColor: '' },
        button: { width: 0, height: 0, backgroundColor: '', borderRadius: '' },
        trustText: { fontSize: '', color: '', fontFamily: '' },
        bodyBackgroundColor: '',
        containerAlignment: '',
        logoAlignment: ''
      };

      // Get title
      const titleElement = document.querySelector('h1') || document.querySelector('[style*="font-size"]');
      if (titleElement) {
        analysis.title = titleElement.textContent?.trim() || '';
      }

      // Get logo dimensions
      const logoElement = document.querySelector('img');
      if (logoElement) {
        const logoRect = logoElement.getBoundingClientRect();
        analysis.logoSize = { width: logoRect.width, height: logoRect.height };
        analysis.logoAlignment = getComputedStyle(logoElement.parentElement!).textAlign || 'center';
      }

      // Get input box properties
      const inputElement = document.querySelector('input[type="text"]');
      if (inputElement) {
        const inputRect = inputElement.getBoundingClientRect();
        const inputStyles = getComputedStyle(inputElement);
        analysis.inputBox = {
          width: inputRect.width,
          height: inputRect.height,
          borderRadius: inputStyles.borderRadius,
          backgroundColor: inputStyles.backgroundColor
        };
      }

      // Get button properties
      const buttonElement = document.querySelector('button');
      if (buttonElement) {
        const buttonRect = buttonElement.getBoundingClientRect();
        const buttonStyles = getComputedStyle(buttonElement);
        analysis.button = {
          width: buttonRect.width,
          height: buttonRect.height,
          backgroundColor: buttonStyles.backgroundColor,
          borderRadius: buttonStyles.borderRadius
        };
      }

      // Get trust text properties
      const trustElement = document.querySelector('[style*="color: rgba(57, 62, 65, 0.6)"]') || 
                          document.querySelector('p:contains("Trusted by")');
      if (trustElement) {
        const trustStyles = getComputedStyle(trustElement);
        analysis.trustText = {
          fontSize: trustStyles.fontSize,
          color: trustStyles.color,
          fontFamily: trustStyles.fontFamily
        };
      }

      // Get body background
      analysis.bodyBackgroundColor = getComputedStyle(document.body).backgroundColor;

      // Get container alignment
      const containerElement = document.querySelector('div') || document.body;
      analysis.containerAlignment = getComputedStyle(containerElement).textAlign || 'center';

      return analysis;
    });

    // Test Next.js version
    console.log('🔍 Analyzing Next.js version...');
    await page.goto(NEXTJS_URL);
    await page.waitForLoadState('networkidle');
    
    const nextjsAnalysis = await page.evaluate(() => {
      const analysis = {
        title: '',
        logoSize: { width: 0, height: 0 },
        inputBox: { width: 0, height: 0, borderRadius: '', backgroundColor: '' },
        button: { width: 0, height: 0, backgroundColor: '', borderRadius: '' },
        trustText: { fontSize: '', color: '', fontFamily: '' },
        bodyBackgroundColor: '',
        containerAlignment: '',
        logoAlignment: ''
      };

      // Get title
      const titleElement = document.querySelector('h1') || 
                          document.querySelector('[class*="text"]') ||
                          document.querySelector('img[alt*="FuturMaster"]');
      if (titleElement && titleElement.tagName !== 'IMG') {
        analysis.title = titleElement.textContent?.trim() || '';
      }

      // Get logo dimensions
      const logoElement = document.querySelector('img[src*="interface_logo"]') || document.querySelector('img[alt*="FuturMaster"]');
      if (logoElement) {
        const logoRect = logoElement.getBoundingClientRect();
        analysis.logoSize = { width: logoRect.width, height: logoRect.height };
        const logoParent = logoElement.closest('div');
        if (logoParent) {
          analysis.logoAlignment = getComputedStyle(logoParent).textAlign || 'center';
        }
      }

      // Get input box properties
      const inputElement = document.querySelector('input[type="text"]');
      if (inputElement) {
        const inputRect = inputElement.getBoundingClientRect();
        const inputStyles = getComputedStyle(inputElement);
        analysis.inputBox = {
          width: inputRect.width,
          height: inputRect.height,
          borderRadius: inputStyles.borderRadius,
          backgroundColor: inputStyles.backgroundColor
        };
      }

      // Get button properties
      const buttonElement = document.querySelector('button');
      if (buttonElement) {
        const buttonRect = buttonElement.getBoundingClientRect();
        const buttonStyles = getComputedStyle(buttonElement);
        analysis.button = {
          width: buttonRect.width,
          height: buttonRect.height,
          backgroundColor: buttonStyles.backgroundColor,
          borderRadius: buttonStyles.borderRadius
        };
      }

      // Get trust text properties
      const trustElement = document.querySelector('p:has-text("Trusted by")') || 
                          document.querySelector('[style*="rgba(57, 62, 65, 0.6)"]') ||
                          document.querySelector('p');
      if (trustElement) {
        const trustStyles = getComputedStyle(trustElement);
        analysis.trustText = {
          fontSize: trustStyles.fontSize,
          color: trustStyles.color,
          fontFamily: trustStyles.fontFamily
        };
      }

      // Get body background
      analysis.bodyBackgroundColor = getComputedStyle(document.body).backgroundColor;

      // Get container alignment
      const containerElement = document.querySelector('[class*="center"]') || 
                              document.querySelector('[class*="mx-auto"]') ||
                              document.querySelector('div');
      if (containerElement) {
        analysis.containerAlignment = getComputedStyle(containerElement).textAlign || 'center';
      }

      return analysis;
    });

    // Write analysis to file for debugging
    const comparison = {
      html: htmlAnalysis,
      nextjs: nextjsAnalysis,
      differences: {}
    };

    // Find differences
    const differences: any = {};
    
    if (htmlAnalysis.logoSize.width !== nextjsAnalysis.logoSize.width) {
      differences.logoWidth = `HTML: ${htmlAnalysis.logoSize.width}px, Next.js: ${nextjsAnalysis.logoSize.width}px`;
    }
    
    if (htmlAnalysis.logoSize.height !== nextjsAnalysis.logoSize.height) {
      differences.logoHeight = `HTML: ${htmlAnalysis.logoSize.height}px, Next.js: ${nextjsAnalysis.logoSize.height}px`;
    }

    if (htmlAnalysis.bodyBackgroundColor !== nextjsAnalysis.bodyBackgroundColor) {
      differences.backgroundColor = `HTML: ${htmlAnalysis.bodyBackgroundColor}, Next.js: ${nextjsAnalysis.bodyBackgroundColor}`;
    }

    comparison.differences = differences;

    writeFileSync('tests/analysis-comparison.json', JSON.stringify(comparison, null, 2));
    
    console.log('📊 Analysis complete. Differences found:', Object.keys(differences));
    
    if (Object.keys(differences).length > 0) {
      console.log('🔍 Detailed differences:', differences);
    }
  });

  test('Interactive elements test', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Test Next.js app interactivity
    await page.goto(NEXTJS_URL);
    await page.waitForLoadState('networkidle');
    
    // Test input functionality
    const input = page.locator('input[type="text"]');
    await input.fill('Test Company');
    const inputValue = await input.inputValue();
    expect(inputValue).toBe('Test Company');
    
    // Test button click
    const button = page.locator('button');
    await button.click();
    
    // Wait for any transitions
    await page.waitForTimeout(1000);
    
    // Take screenshot after interaction
    await page.screenshot({ 
      path: 'tests/screenshots/nextjs-after-click.png', 
      fullPage: true 
    });
    
    console.log('✅ Interaction test complete');
  });
});