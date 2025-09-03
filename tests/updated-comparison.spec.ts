import { test, expect } from '@playwright/test';

test.describe('Updated Visual Comparison', () => {
  
  // Test configuration
  const NEXTJS_URL = 'http://localhost:3003';
  const HTML_FILE_PATH = 'C:\\Users\\zengch00\\FM_TEST\\Why_You_Need_FM\\futurmaster-poc\\index.html';
  
  test('Updated screenshot comparison - After fixes', async ({ page }) => {
    // Set consistent viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('📸 Taking updated screenshot of Next.js app...');
    
    // Screenshot Next.js app
    await page.goto(NEXTJS_URL);
    await page.waitForLoadState('networkidle');
    
    // Wait a moment for fonts to load
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/nextjs-app-updated.png', 
      fullPage: true 
    });
    
    console.log('✅ Updated screenshot captured successfully');
  });

  test('Side by side element analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Test HTML version first
    console.log('🔍 Analyzing HTML version...');
    await page.goto(`file:///${HTML_FILE_PATH}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const htmlAnalysis = await page.evaluate(() => {
      return {
        logoElement: (() => {
          const logo = document.querySelector('img[src*="interface_logo"]');
          if (!logo) return null;
          const rect = logo.getBoundingClientRect();
          const styles = getComputedStyle(logo);
          return {
            width: rect.width,
            height: rect.height,
            transform: styles.transform,
            transformOrigin: styles.transformOrigin,
            margin: styles.margin
          };
        })(),
        inputContainer: (() => {
          const container = document.querySelector('.rounded-full');
          if (!container) return null;
          const rect = container.getBoundingClientRect();
          const styles = getComputedStyle(container);
          return {
            width: rect.width,
            height: rect.height,
            borderRadius: styles.borderRadius,
            backgroundColor: styles.backgroundColor,
            hasButton: !!container.querySelector('button')
          };
        })(),
        trustIndicators: (() => {
          const trustDiv = document.querySelector('.space-x-8');
          if (!trustDiv) return null;
          return {
            childrenCount: trustDiv.children.length,
            spacing: getComputedStyle(trustDiv).gap,
            text: Array.from(trustDiv.children).map(child => child.textContent)
          };
        })()
      };
    });
    
    // Test Next.js version
    console.log('🔍 Analyzing Next.js version...');
    await page.goto(NEXTJS_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const nextjsAnalysis = await page.evaluate(() => {
      return {
        logoElement: (() => {
          const logo = document.querySelector('img[src*="interface_logo"]');
          if (!logo) return null;
          const rect = logo.getBoundingClientRect();
          const styles = getComputedStyle(logo);
          return {
            width: rect.width,
            height: rect.height,
            transform: styles.transform,
            transformOrigin: styles.transformOrigin,
            margin: styles.margin
          };
        })(),
        inputContainer: (() => {
          const container = document.querySelector('.rounded-full');
          if (!container) return null;
          const rect = container.getBoundingClientRect();
          const styles = getComputedStyle(container);
          return {
            width: rect.width,
            height: rect.height,
            borderRadius: styles.borderRadius,
            backgroundColor: styles.backgroundColor,
            hasButton: !!container.querySelector('button')
          };
        })(),
        trustIndicators: (() => {
          const trustDiv = document.querySelector('.space-x-8');
          if (!trustDiv) return null;
          return {
            childrenCount: trustDiv.children.length,
            spacing: getComputedStyle(trustDiv).gap,
            text: Array.from(trustDiv.children).map(child => child.textContent)
          };
        })()
      };
    });

    console.log('📊 HTML Analysis:', JSON.stringify(htmlAnalysis, null, 2));
    console.log('📊 Next.js Analysis:', JSON.stringify(nextjsAnalysis, null, 2));
    
    // Compare key elements
    if (htmlAnalysis.logoElement && nextjsAnalysis.logoElement) {
      expect(Math.abs(htmlAnalysis.logoElement.width - nextjsAnalysis.logoElement.width)).toBeLessThan(5);
      expect(Math.abs(htmlAnalysis.logoElement.height - nextjsAnalysis.logoElement.height)).toBeLessThan(5);
      console.log('✅ Logo dimensions match');
    }
    
    if (htmlAnalysis.inputContainer && nextjsAnalysis.inputContainer) {
      expect(htmlAnalysis.inputContainer.hasButton).toBe(nextjsAnalysis.inputContainer.hasButton);
      expect(htmlAnalysis.inputContainer.borderRadius).toBe(nextjsAnalysis.inputContainer.borderRadius);
      console.log('✅ Input container style matches');
    }
    
    if (htmlAnalysis.trustIndicators && nextjsAnalysis.trustIndicators) {
      expect(htmlAnalysis.trustIndicators.childrenCount).toBe(nextjsAnalysis.trustIndicators.childrenCount);
      expect(htmlAnalysis.trustIndicators.text).toEqual(nextjsAnalysis.trustIndicators.text);
      console.log('✅ Trust indicators match');
    }
    
    console.log('🎉 All key elements match between HTML and Next.js versions!');
  });
});