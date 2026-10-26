import { chromium } from '@playwright/test';

async function inspectWeMakeDevs() {
  console.log('Launching Chromium to inspect https://www.wemakedevs.org/ ...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs: { type: string; text: string }[] = [];
  const pageErrors: string[] = [];
  const failedRequests: { url: string; status?: number; errorText?: string }[] = [];

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
    console.log(`[Browser Uncaught PageError]: ${err.message}`);
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push({ url: res.url(), status: res.status() });
      console.log(`[HTTP ${res.status()} Error]: ${res.url()}`);
    }
  });

  page.on('requestfailed', (req) => {
    failedRequests.push({ url: req.url(), errorText: req.failure()?.errorText });
    console.log(`[Request Failed]: ${req.url()} - ${req.failure()?.errorText}`);
  });

  try {
    const res = await page.goto('https://www.wemakedevs.org/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`Navigation status: ${res?.status()}`);
    console.log(`Page title: "${await page.title()}"`);

    // Check headings
    const h1Count = await page.locator('h1').count();
    console.log(`H1 count: ${h1Count}`);
    for (let i = 0; i < h1Count; i++) {
      console.log(`  H1 [${i}]: "${(await page.locator('h1').nth(i).innerText()).trim()}"`);
    }

    // Check links and images
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src);
    });
    console.log(`Broken images found: ${brokenImages.length}`);
    if (brokenImages.length > 0) {
      console.log('Broken images:', brokenImages);
    }

    // Check buttons & CTAs
    const buttons = await page.locator('button, a.btn, a[href*="discord"], a[href*="youtube"]').allInnerTexts();
    console.log('Key CTA buttons/links found:', buttons.slice(0, 10));

    // Summary of defects
    console.log('\n--- AUDIT SUMMARY FOR WEMAKEDEVS.ORG ---');
    console.log(`Total Console Errors: ${consoleLogs.filter((l) => l.type === 'error').length}`);
    console.log(`Total Page Errors: ${pageErrors.length}`);
    console.log(`Total Failed Network Requests: ${failedRequests.length}`);

    // Take screenshot
    await page.screenshot({ path: 'tests/wemakedevs-inspection.png', fullPage: true });
    console.log('Saved inspection screenshot to tests/wemakedevs-inspection.png');
  } catch (err: any) {
    console.error('Inspection error:', err.message);
  } finally {
    await browser.close();
  }
}

inspectWeMakeDevs().catch(console.error);
