import { Page } from '@playwright/test';

/**
 * Resets the demo store to a clean deterministic state:
 * - Fetches server defect configuration (/api/demo/config)
 * - Seeds localStorage with the server defect state while wiping cart items
 * - Reloads /demo-store
 * - Waits for stable DOM readiness
 */
export async function resetDemoStore(page: Page): Promise<void> {
  let serverConfig = { bugCartTotalWrong: false, bugInvalidEmailAccepted: false };
  try {
    const res = await page.request.get('/api/demo/config');
    if (res.ok()) {
      serverConfig = await res.json();
    }
  } catch {
    // fallback to clean state if server endpoint not reachable
  }

  await page.goto('/demo-store');
  await page.evaluate((cfg) => {
    localStorage.removeItem('veriflow_cart');
    localStorage.setItem('veriflow_demo_config', JSON.stringify(cfg));
  }, serverConfig);
  await page.reload();
  await page.waitForSelector('[data-testid="cart-badge"]');
}
