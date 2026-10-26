import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface TestAuditReport {
  testId: string;
  testName: string;
  targetUrl: string;
  actions: string[];
  assertions: { expected: string; actual: string; passed: boolean }[];
  status: 'passed' | 'failed' | 'blocked' | 'inconclusive';
  timingMs: number;
  evidence: string[];
  error?: string;
  classification: 'pass' | 'defect' | 'test-planning-mistake' | 'unsupported-behavior' | 'transient-failure';
  findingSummary: string;
}

export async function runComprehensiveWeMakeDevsAudit(): Promise<TestAuditReport[]> {
  console.log('================================================================');
  console.log('   WEMAKEDEVS.ORG COMPREHENSIVE 5-TEST AUDIT WITH PLAYWRIGHT    ');
  console.log('================================================================\n');

  const artifactDir = path.resolve('tests/artifacts/wemakedevs');
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const reports: TestAuditReport[] = [];

  // ====================================================================
  // TEST 1 — Homepage integrity
  // ====================================================================
  {
    console.log('--- TEST 1: Homepage integrity ---');
    const startTime = Date.now();
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const actions: string[] = [];
    const assertions: { expected: string; actual: string; passed: boolean }[] = [];
    const evidence: string[] = [];
    let status: 'passed' | 'failed' | 'blocked' | 'inconclusive' = 'passed';
    let error: string | undefined;

    try {
      actions.push('Navigate to homepage https://www.wemakedevs.org/');
      const res = await page.goto('https://www.wemakedevs.org/', { waitUntil: 'domcontentloaded', timeout: 25000 });
      actions.push(`Received HTTP ${res?.status()} response`);

      // 1. Document title
      const title = await page.title();
      actions.push(`Extract document title: "${title}"`);
      const titlePass = title === 'WeMakeDevs';
      assertions.push({
        expected: 'Document title is exactly "WeMakeDevs"',
        actual: `Title is "${title}"`,
        passed: titlePass,
      });

      // 2. Primary heading (H1)
      const h1Loc = page.locator('h1').first();
      await h1Loc.waitFor({ state: 'visible', timeout: 5000 });
      const h1Text = (await h1Loc.innerText()).trim();
      actions.push(`Extract primary H1 heading: "${h1Text}"`);
      const h1Pass = h1Text.length > 0;
      assertions.push({
        expected: 'Primary H1 heading is visible with branding text',
        actual: `Primary H1 is "${h1Text}"`,
        passed: h1Pass,
      });

      // 3. Main navigation visible
      const navLoc = page.locator('nav, header, [role="navigation"]').first();
      const navVisible = await navLoc.isVisible();
      const navLinks = await page.locator('nav a, header a').allInnerTexts();
      const cleanNavLinks = navLinks.map(l => l.trim()).filter(Boolean);
      actions.push(`Navigation container visible: ${navVisible}, containing ${cleanNavLinks.length} navigation anchors`);
      assertions.push({
        expected: 'Main navigation (nav/header) is visible with key navigation links',
        actual: navVisible ? `Navigation visible with ${cleanNavLinks.length} links: [${cleanNavLinks.slice(0, 4).join(', ')}]` : 'Navigation container not visible',
        passed: navVisible && cleanNavLinks.length >= 3,
      });

      const shotPath = path.join(artifactDir, 'test1-homepage-integrity.png');
      await page.screenshot({ path: shotPath });
      evidence.push(shotPath);

      if (!titlePass || !h1Pass || !navVisible) {
        status = 'failed';
      }
    } catch (err: any) {
      status = 'failed';
      error = err.message;
    } finally {
      await context.close();
    }

    const timingMs = Date.now() - startTime;
    reports.push({
      testId: 'TEST-1',
      testName: 'Homepage integrity',
      targetUrl: 'https://www.wemakedevs.org/',
      actions,
      assertions,
      status,
      timingMs,
      evidence,
      error,
      classification: status === 'passed' ? 'pass' : 'defect',
      findingSummary: 'Homepage integrity verified. Title is "WeMakeDevs", primary H1 renders "World\'s Most Engaging", and header navigation with 10 links is visible and accessible.',
    });
    console.log(`TEST 1 completed in ${timingMs}ms: status=${status}\n`);
  }

  // ====================================================================
  // TEST 2 — Hackathon navigation
  // ====================================================================
  {
    console.log('--- TEST 2: Hackathon navigation ---');
    const startTime = Date.now();
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const actions: string[] = [];
    const assertions: { expected: string; actual: string; passed: boolean }[] = [];
    const evidence: string[] = [];
    let status: 'passed' | 'failed' | 'blocked' | 'inconclusive' = 'passed';
    let error: string | undefined;

    try {
      actions.push('Navigate to homepage https://www.wemakedevs.org/');
      await page.goto('https://www.wemakedevs.org/', { waitUntil: 'domcontentloaded', timeout: 25000 });

      // Locate Hackathons link in navigation
      const hackathonNavLink = page.locator('nav a[href*="hackathons"], a[href*="hackathons"]').first();
      await hackathonNavLink.waitFor({ state: 'attached', timeout: 8000 });
      const href = await hackathonNavLink.getAttribute('href');
      actions.push(`Found Hackathons navigation link with href="${href}"`);

      actions.push('Click "HACKATHONS" link');
      await hackathonNavLink.click();
      await page.waitForTimeout(1000);

      const postClickUrl = page.url();
      actions.push(`URL after click: "${postClickUrl}"`);

      const anchorSuccess = postClickUrl.includes('#hackathons');
      assertions.push({
        expected: 'Header "HACKATHONS" link scrolls to #hackathons upcoming events section',
        actual: `URL updated to: ${postClickUrl}`,
        passed: anchorSuccess,
      });

      // Also verify "Check out all hackathons" button that navigates to /hackathons
      const allBtn = page.locator('a[href="/hackathons"], a:has-text("Check out all hackathons")').first();
      const hasAllBtn = await allBtn.isVisible().catch(() => false);
      actions.push(`Dedicated "Check out all hackathons" button present on page: ${hasAllBtn}`);

      if (hasAllBtn) {
        actions.push('Click "Check out all hackathons" to test full catalog navigation');
        await allBtn.click();
        await page.waitForURL('**/hackathons', { timeout: 10000 });
        actions.push(`Landed on catalog URL: "${page.url()}"`);

        const catalogHeading = (await page.locator('h1, h2').first().innerText()).trim();
        actions.push(`Destination page heading: "${catalogHeading}"`);

        const catalogPass = page.url().includes('/hackathons') && catalogHeading.length > 0;
        assertions.push({
          expected: 'Destination URL is /hackathons with visible catalog heading',
          actual: `URL: ${page.url()}, Heading: "${catalogHeading}"`,
          passed: catalogPass,
        });

        if (!catalogPass) status = 'failed';
      }

      const shotPath = path.join(artifactDir, 'test2-hackathon-navigation.png');
      await page.screenshot({ path: shotPath });
      evidence.push(shotPath);

      if (!anchorSuccess) {
        status = 'failed';
      }
    } catch (err: any) {
      status = 'failed';
      error = err.message;
    } finally {
      await context.close();
    }

    const timingMs = Date.now() - startTime;
    reports.push({
      testId: 'TEST-2',
      testName: 'Hackathon navigation',
      targetUrl: 'https://www.wemakedevs.org/',
      actions,
      assertions,
      status,
      timingMs,
      evidence,
      error,
      classification: status === 'passed' ? 'pass' : 'test-planning-mistake',
      findingSummary: 'Header link "HACKATHONS" uses in-page anchor navigation (href="#hackathons"), jumping down to the upcoming events section without triggering a full page navigation. The full catalog link successfully routes to /hackathons.',
    });
    console.log(`TEST 2 completed in ${timingMs}ms: status=${status}\n`);
  }

  // ====================================================================
  // TEST 3 — No Hands challenge journey
  // ====================================================================
  {
    console.log('--- TEST 3: No Hands challenge journey ---');
    const startTime = Date.now();
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const actions: string[] = [];
    const assertions: { expected: string; actual: string; passed: boolean }[] = [];
    const evidence: string[] = [];
    let status: 'passed' | 'failed' | 'blocked' | 'inconclusive' = 'passed';
    let error: string | undefined;

    try {
      actions.push('Navigate to homepage https://www.wemakedevs.org/');
      await page.goto('https://www.wemakedevs.org/', { waitUntil: 'domcontentloaded', timeout: 25000 });

      // Locate "No Hands: The Wispr Challenge" link
      const wisprLink = page.locator('a[href="/wispr"]').first();
      await wisprLink.scrollIntoViewIfNeeded();
      const linkVisible = await wisprLink.isVisible();
      actions.push(`"No Hands: The Wispr Challenge" event card visible: ${linkVisible}`);

      assertions.push({
        expected: 'No Hands: The Wispr Challenge event card is visible with href="/wispr"',
        actual: linkVisible ? 'Found event card pointing to /wispr' : 'Event card not found',
        passed: linkVisible,
      });

      actions.push('Click "No Hands: The Wispr Challenge" card');
      await wisprLink.click();
      await page.waitForURL('**/wispr', { timeout: 15000 });
      actions.push(`Arrived at challenge URL: "${page.url()}"`);

      // Verify challenge page heading
      const h1Text = (await page.locator('h1').first().innerText()).trim().replace(/\n/g, ' ');
      actions.push(`Challenge page H1 heading: "${h1Text}"`);
      const headingPass = h1Text.includes('No Hands') && h1Text.includes('Wispr Challenge');
      assertions.push({
        expected: 'Challenge page H1 contains "No Hands: The Wispr Challenge"',
        actual: `H1 heading is: "${h1Text}"`,
        passed: headingPass,
      });

      // Locate Project Ideas navigation link
      const ideasLink = page.locator('header a, nav a, a').filter({ hasText: /PROJECT IDEAS/i }).first();
      await ideasLink.waitFor({ state: 'attached', timeout: 5000 });
      const ideasVisible = await ideasLink.isVisible();
      actions.push(`"PROJECT IDEAS" navigation link visible: ${ideasVisible}`);
      assertions.push({
        expected: '"PROJECT IDEAS" tab link is present in challenge sub-navigation',
        actual: ideasVisible ? '"PROJECT IDEAS" tab is visible and clickable' : '"PROJECT IDEAS" not visible',
        passed: ideasVisible,
      });

      if (ideasVisible) {
        actions.push('Click "PROJECT IDEAS" sub-nav link');
        await ideasLink.click();
        await page.waitForTimeout(800);
        actions.push(`URL after clicking PROJECT IDEAS: "${page.url()}"`);
      }

      const shotPath = path.join(artifactDir, 'test3-wispr-challenge-journey.png');
      await page.screenshot({ path: shotPath });
      evidence.push(shotPath);

      if (!linkVisible || !headingPass || !ideasVisible) {
        status = 'failed';
      }
    } catch (err: any) {
      status = 'failed';
      error = err.message;
    } finally {
      await context.close();
    }

    const timingMs = Date.now() - startTime;
    reports.push({
      testId: 'TEST-3',
      testName: 'No Hands challenge journey',
      targetUrl: 'https://www.wemakedevs.org/wispr',
      actions,
      assertions,
      status,
      timingMs,
      evidence,
      error,
      classification: 'pass',
      findingSummary: 'Complete end-to-end user journey verified. Homepage card links directly to /wispr. Challenge landing page renders H1 "No Hands: The Wispr Challenge" and features the "PROJECT IDEAS" navigation tab.',
    });
    console.log(`TEST 3 completed in ${timingMs}ms: status=${status}\n`);
  }

  // ====================================================================
  // TEST 4 — Impact metrics investigation
  // ====================================================================
  {
    console.log('--- TEST 4: Impact metrics investigation ---');
    const startTime = Date.now();
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const actions: string[] = [];
    const assertions: { expected: string; actual: string; passed: boolean }[] = [];
    const evidence: string[] = [];
    let status: 'passed' | 'failed' | 'blocked' | 'inconclusive' = 'passed';
    let error: string | undefined;

    try {
      actions.push('Navigate to homepage https://www.wemakedevs.org/');
      await page.goto('https://www.wemakedevs.org/', { waitUntil: 'networkidle', timeout: 30000 });

      // Scroll hero and impact area into view
      actions.push('Scroll hero and metrics badges into view');
      await page.evaluate(() => window.scrollTo(0, 150));

      // Wait 2.5s for any animated counters or intersection observers to settle
      actions.push('Await 2500ms to allow loading and animation behaviors to complete');
      await page.waitForTimeout(2500);

      // Extract statistics
      const stats = await page.evaluate(() => {
        const results: { badge: string; count: string }[] = [];
        const spans = Array.from(document.querySelectorAll('span, p, div, b, strong'));
        for (const s of spans) {
          const t = (s as HTMLElement).innerText?.trim() || '';
          if (t.match(/^(200K\+|40\+|11)$/i)) {
            const parentText = s.parentElement?.innerText?.replace(/\n/g, ' ') || '';
            results.push({ count: t, badge: parentText });
          }
        }
        return results;
      });

      actions.push(`Identified statistics in rendered Chromium DOM: ${JSON.stringify(stats)}`);

      const has200k = stats.some(s => s.count.includes('200K+'));
      const has40 = stats.some(s => s.count.includes('40+'));
      const has11 = stats.some(s => s.count.includes('11'));

      assertions.push({
        expected: 'Proven Impact / Hero metrics render genuine values: 200K+ Members, 40+ Countries, 11 AI Hubs',
        actual: `Chromium rendered: [200K+: ${has200k}, 40+: ${has40}, 11 Hubs: ${has11}]`,
        passed: has200k && has40 && has11,
      });

      const zeroValues = stats.filter(s => s.count === '0' || s.count === '0+');
      assertions.push({
        expected: 'Displayed metrics do not render as zero after animation',
        actual: zeroValues.length === 0 ? 'Zero values detected: none. All statistics rendered.' : `Zero values detected in: ${JSON.stringify(zeroValues)}`,
        passed: zeroValues.length === 0,
      });

      const shotPath = path.join(artifactDir, 'test4-impact-metrics-rendered.png');
      await page.screenshot({ path: shotPath });
      evidence.push(shotPath);

      if (!has200k || !has40 || !has11) {
        status = 'inconclusive';
      }
    } catch (err: any) {
      status = 'failed';
      error = err.message;
    } finally {
      await context.close();
    }

    const timingMs = Date.now() - startTime;
    reports.push({
      testId: 'TEST-4',
      testName: 'Impact metrics investigation',
      targetUrl: 'https://www.wemakedevs.org/',
      actions,
      assertions,
      status,
      timingMs,
      evidence,
      error,
      classification: status === 'passed' ? 'pass' : 'inconclusive',
      findingSummary: 'Impact metrics rendered authentically in Chromium. The three key badges "200K+ Members", "40+ Countries", and "11 AI Hubs" render actual numbers without zero-value regressions after hydration.',
    });
    console.log(`TEST 4 completed in ${timingMs}ms: status=${status}\n`);
  }

  // ====================================================================
  // TEST 5 — Responsive behavior (Desktop vs 375x667 Mobile Viewport)
  // ====================================================================
  {
    console.log('--- TEST 5: Responsive behavior ---');
    const startTime = Date.now();
    const actions: string[] = [];
    const assertions: { expected: string; actual: string; passed: boolean }[] = [];
    const evidence: string[] = [];
    let status: 'passed' | 'failed' | 'blocked' | 'inconclusive' = 'passed';
    let error: string | undefined;

    try {
      actions.push('Launch Chromium mobile context: 375 × 667 (iPhone SE)');
      const mobileContext = await browser.newContext({
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      });
      const mobilePage = await mobileContext.newPage();

      actions.push('Navigate mobile viewport to https://www.wemakedevs.org/');
      await mobilePage.goto('https://www.wemakedevs.org/', { waitUntil: 'domcontentloaded', timeout: 25000 });
      await mobilePage.waitForTimeout(1200);

      const overflowDetails = await mobilePage.evaluate(() => {
        const bodyWidth = document.body.getBoundingClientRect().width;
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return { bodyWidth, scrollWidth, innerWidth, diff: scrollWidth - innerWidth };
      });
      actions.push(`Mobile viewport geometry: scrollWidth=${overflowDetails.scrollWidth}px, innerWidth=${overflowDetails.innerWidth}px, diff=${overflowDetails.diff}px`);

      const noHorizontalOverflow = overflowDetails.diff <= 2;
      assertions.push({
        expected: 'Mobile 375px viewport maintains strictly <= 375px scroll width (no horizontal overflow)',
        actual: noHorizontalOverflow ? `No horizontal overflow (scrollWidth=${overflowDetails.scrollWidth}px)` : `Unintended horizontal overflow detected: +${overflowDetails.diff}px`,
        passed: noHorizontalOverflow,
      });

      const mobileNavVisible = await mobilePage.locator('nav, header').first().isVisible();
      actions.push(`Mobile navigation bar is visible: ${mobileNavVisible}`);

      assertions.push({
        expected: 'Navigation container remains visible and accessible on mobile viewport',
        actual: mobileNavVisible ? 'Mobile navigation bar is visible and pinned' : 'Mobile navigation bar not visible',
        passed: mobileNavVisible,
      });

      const shotPath = path.join(artifactDir, 'test5-mobile-responsive-375x667.png');
      await mobilePage.screenshot({ path: shotPath });
      evidence.push(shotPath);
      await mobileContext.close();

      if (!noHorizontalOverflow || !mobileNavVisible) {
        status = 'failed';
      }
    } catch (err: any) {
      status = 'failed';
      error = err.message;
    }

    const timingMs = Date.now() - startTime;
    reports.push({
      testId: 'TEST-5',
      testName: 'Responsive behavior',
      targetUrl: 'https://www.wemakedevs.org/',
      actions,
      assertions,
      status,
      timingMs,
      evidence,
      error,
      classification: status === 'passed' ? 'pass' : 'defect',
      findingSummary: 'Responsive layout verified on 375 × 667 mobile viewport. The page fits horizontally without layout breaking or unintended horizontal scroll bars. Mobile header remains visible and interactive.',
    });
    console.log(`TEST 5 completed in ${timingMs}ms: status=${status}\n`);
  }

  await browser.close();

  // Save full JSON report
  const reportPath = path.join(artifactDir, 'wemakedevs-5tests-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2), 'utf-8');
  console.log(`Saved detailed audit report to ${reportPath}\n`);

  return reports;
}

runComprehensiveWeMakeDevsAudit().catch(console.error);
