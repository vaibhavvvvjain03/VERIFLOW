import { test, expect } from '@playwright/test';

test.describe('Veriflow Universal Voice-Directed Browser Testing Platform', () => {
  test('Landing page renders simplified hero with mascot sketch and CTA', async ({ page }) => {
    await page.goto('/');

    // Assert headline
    await expect(page.locator('h1')).toContainText('Say what to test');

    // Assert mascot illustration is rendered
    await expect(page.locator('.veri-mascot-sketch').first()).toBeVisible();

    // Assert CTA button leads to workspace
    const workspaceBtn = page.locator('#hero-btn-start-testing');
    await expect(workspaceBtn).toBeVisible();
    await workspaceBtn.click();
    await expect(page).toHaveURL(/.*\/workspace/);
  });

  test('Workspace renders Target URL input with 5 public presets', async ({ page }) => {
    await page.goto('/workspace');

    // Assert URL input exists
    const urlInput = page.locator('#target-url-input');
    await expect(urlInput).toBeVisible();

    // Assert public presets exist
    await expect(page.getByText('Example Domain')).toBeVisible();
    await expect(page.getByText('Hacker News')).toBeVisible();
    await expect(page.getByText('Wikipedia')).toBeVisible();
    await expect(page.getByText('httpbin')).toBeVisible();
    await expect(page.getByText('Playwright Docs')).toBeVisible();
  });

  test('Workspace displays all 7 Universal Commands', async ({ page }) => {
    await page.goto('/workspace');

    // Assert 7 universal chips in command console
    await expect(page.locator('#chip-CMD-TITLE')).toBeVisible();
    await expect(page.locator('#chip-CMD-HEADING')).toBeVisible();
    await expect(page.locator('#chip-CMD-NAV')).toBeVisible();
    await expect(page.locator('#chip-CMD-SEARCH')).toBeVisible();
    await expect(page.locator('#chip-CMD-CONSOLE')).toBeVisible();
    await expect(page.locator('#chip-CMD-RESPONSIVE')).toBeVisible();
    await expect(page.locator('#chip-CMD-LINK')).toBeVisible();
  });

  test('Clicking a universal chip opens the structured plan review', async ({ page }) => {
    await page.goto('/workspace');

    // Click CMD-TITLE chip
    await page.locator('#chip-CMD-TITLE').click();

    // The structured plan review box opens with Confirm & Run Plan button
    const confirmBtn = page.locator('#btn-confirm-and-run-plan');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Structured Test Plan:')).toBeVisible();
  });

  test('SSRF security shield rejects private IP addresses', async ({ page }) => {
    await page.goto('/workspace');

    const urlInput = page.locator('#target-url-input');
    await urlInput.fill('http://192.168.1.1');

    // Validation pill displays safety block
    const errorPill = page.locator('#url-error-pill');
    await expect(errorPill).toBeVisible({ timeout: 5000 });
    await expect(errorPill).toContainText('Safety Policy Block');
  });

  test('Dictating command parses into structured plan', async ({ page }) => {
    await page.goto('/workspace');

    const commandInput = page.locator('#wispr-command-input');
    await commandInput.fill('Verify page title');

    const planBanner = page.locator('#command-plan-banner');
    await expect(planBanner).toBeVisible({ timeout: 5000 });
    await expect(planBanner).toContainText('Page Title & Identity Assertion');
    await expect(page.locator('#btn-execute-parsed-plan')).toBeVisible();
  });

  test('Recognizes compound multi-command: "Check. With a primary heading and a navigation bar, there is"', async ({ page }) => {
    await page.goto('/workspace');

    const commandInput = page.locator('#wispr-command-input');
    await commandInput.fill('Check. With a primary heading and a navigation bar, there is');

    const planBanner = page.locator('#command-plan-banner');
    await expect(planBanner).toBeVisible({ timeout: 5000 });
    // Verify BOTH commands are recognized in the plan
    await expect(planBanner).toContainText('primary heading');
    await expect(planBanner).toContainText('navigation bar');

    // Click Review & Execute to open structured plan modal
    const executeBtn = page.locator('#btn-execute-parsed-plan');
    await expect(executeBtn).toBeVisible();
    await executeBtn.click();

    // Verify structured plan review contains both assertion steps
    const reviewBox = page.locator('#plan-review-box');
    await expect(reviewBox).toBeVisible();
    await expect(reviewBox).toContainText('Assert primary top-level heading (h1)');
    await expect(reviewBox).toContainText('Assert navigation bar / header menu');
  });

  test('Workspace cards feature distinct color palettes', async ({ page }) => {
    await page.goto('/workspace');

    // 1. Target URL card is styled in emerald/mint
    const targetUrlBox = page.locator('#target-url-container');
    await expect(targetUrlBox).toBeVisible();
    await expect(targetUrlBox).toHaveCSS('background-color', 'rgb(240, 253, 244)'); // #f0fdf4

    // 2. Command console is styled in lavender/violet
    const commandConsole = page.locator('.command-console');
    await expect(commandConsole).toBeVisible();
    await expect(commandConsole).toHaveCSS('background-color', 'rgb(250, 245, 255)'); // #faf5ff

    // 3. Universal commands tab is styled in amber
    const universalTab = page.locator('#tab-universal-commands');
    await expect(universalTab).toBeVisible();
    await expect(universalTab).toHaveCSS('color', 'rgb(180, 83, 9)'); // #b45309

    // 4. Live preview tab is styled in dark obsidian slate
    const previewTab = page.locator('#tab-live-preview');
    await expect(previewTab).toBeVisible();
    await expect(previewTab).toHaveCSS('background-color', 'rgb(30, 41, 59)'); // #1e293b
  });
});
