import { test, expect } from '@playwright/test';

test.describe('Responsive Design & Device Compatibility Audit', () => {
  const viewports = [
    { name: 'Mobile Small (iPhone SE / Fold Outer)', width: 360, height: 667 },
    { name: 'Mobile Standard (iPhone 14 / Galaxy S21)', width: 390, height: 844 },
    { name: 'Mobile Large / Phablet', width: 428, height: 926 },
    { name: 'Tablet Portrait (iPad Mini / Air)', width: 768, height: 1024 },
    { name: 'Tablet Landscape / Small Laptop', width: 1024, height: 768 },
    { name: 'Desktop Standard', width: 1280, height: 800 },
    { name: 'Desktop Ultra Wide', width: 1600, height: 900 },
  ];

  for (const vp of viewports) {
    test(`Landing Page fits perfectly without horizontal overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Wait for page to render
      await expect(page.locator('h1')).toBeVisible();

      // Check for horizontal blowout: scrollWidth must equal clientWidth (within 1px rounding)
      const hasHorizontalOverflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = window.innerWidth;
        return docWidth > viewWidth + 1;
      });

      expect(hasHorizontalOverflow).toBeFalsy();

      // Ensure key interactive elements are visible
      await expect(page.locator('#hero-btn-start-testing')).toBeVisible();
      await expect(page.locator('#brand-logo-link')).toBeVisible();
    });

    test(`Workspace Cockpit fits perfectly without horizontal overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/workspace');

      // Wait for workspace components
      await expect(page.locator('#target-url-input')).toBeVisible();

      // Verify no horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = window.innerWidth;
        return docWidth > viewWidth + 1;
      });

      expect(hasHorizontalOverflow).toBeFalsy();

      // Check mobile cockpit bar visibility based on screen width
      if (vp.width <= 1024) {
        await expect(page.locator('.mobile-cockpit-bar')).toBeVisible();
        await expect(page.locator('#mobile-tab-commands')).toBeVisible();
        await expect(page.locator('#mobile-tab-browser')).toBeVisible();

        // Switch to browser tab on mobile
        await page.locator('#mobile-tab-browser').click();
        await expect(page.locator('#browser-preview-panel')).toBeVisible();
      } else {
        await expect(page.locator('.mobile-cockpit-bar')).toBeHidden();
        // Both left and right panes should be visible on desktop
        await expect(page.locator('#browser-preview-panel')).toBeVisible();
        await expect(page.locator('#chip-CMD-TITLE')).toBeVisible();
      }
    });
  }
});

