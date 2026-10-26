import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { URL } from 'url';
import {
  TestPlan,
  PlanStep,
  RunRecord,
  TestResult,
  StepEvent,
  PreviewFrame,
} from '../shared/types';
import { validateTargetUrl } from './urlSecurity';

export interface DynamicExecutionOptions {
  runId: string;
  plan: TestPlan;
  runDir: string;
  onUpdate: (run: RunRecord) => void;
  isLocalFixture?: boolean;
}

/**
 * Executes a structured TestPlan in an isolated Playwright Chromium instance.
 * Enforces URL safety, redirect monitoring, bounded timeouts, step telemetry,
 * failure artifacts, and milestone screenshots for honest execution previews.
 */
export async function executeDynamicPlan(options: DynamicExecutionOptions): Promise<void> {
  const { runId, plan, runDir, onUpdate, isLocalFixture = false } = options;
  const artifactsDir = path.join(runDir, 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const testId = plan.id;
  const previewFrames: PreviewFrame[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  const initialTestResult: TestResult = {
    testId,
    name: plan.name,
    description: plan.description,
    tag: 'Custom Plan',
    status: 'running',
    durationMs: 0,
    steps: [],
  };

  const runRecord: RunRecord = {
    runId,
    status: 'running',
    testIds: [testId],
    createdAt: plan.createdAt || new Date().toISOString(),
    startedAt: new Date().toISOString(),
    summary: {
      total: 1,
      passed: 0,
      failed: 0,
      durationMs: 0,
    },
    results: {
      [testId]: initialTestResult,
    },
    targetUrl: plan.targetUrl,
    executionMode: 'Isolated Headless Automation Context',
    browserInstance: 'Playwright Headless Chromium (Dynamic Plan Engine)',
    plan,
    previewFrames: [],
    warnings: plan.warning ? [plan.warning] : [],
  };

  onUpdate({ ...runRecord });

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = Date.now();

  try {
    // 1. Launch Isolated Chromium with performance & container-optimized flags
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--no-first-run',
        '--no-zygote',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-sync',
        '--disable-translate',
        '--renderer-process-limit=2',
      ],
    });

    const viewport = plan.steps.find((s) => s.options?.viewport)?.options?.viewport || {
      width: 1280,
      height: 720,
    };

    context = await browser.newContext({
      viewport,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      ignoreHTTPSErrors: false, // URL-018: Never disable TLS validation globally
    });

    // Bounded timeouts: action 4000ms, navigation 20000ms
    context.setDefaultTimeout(4000);
    context.setDefaultNavigationTimeout(20000);

    page = await context.newPage();

    // Abort known third-party tracking, ad pixels, and telemetry without blocking first-party site assets
    await page.route(
      /(\.google-analytics\.com|\.googletagmanager\.com|\.doubleclick\.net|\.hotjar\.com|\.clarity\.ms|\.segment\.com|connect\.facebook\.net)/i,
      (route) => route.abort().catch(() => {})
    );

    // Telemetry and Security Listeners
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    // Handle dialogs safely (ACT-013)
    page.on('dialog', async (dialog) => {
      try {
        await dialog.dismiss();
      } catch {
        // ignore
      }
    });

    // URL-014, SEC-001: Redirect destination verification
    page.on('response', async (response) => {
      const status = response.status();
      if (status >= 300 && status < 400) {
        const location = response.headers()['location'];
        if (location) {
          try {
            const redirectUrl = new URL(location, response.url()).toString();
            const redirectCheck = await validateTargetUrl(redirectUrl, isLocalFixture);
            if (!redirectCheck.valid) {
              const secMsg = `Security violation on redirect: Destination "${redirectUrl}" is prohibited. ${redirectCheck.error}`;
              runRecord.warnings = runRecord.warnings || [];
              runRecord.warnings.push(secMsg);
            }
          } catch {
            // malformed redirect header
          }
        }
      }
    });

    let overallFailed = false;
    let failureError: string | undefined;

    // 2. Execute Plan Steps Sequentially
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      const stepStartTime = Date.now();

      const stepEvent: StepEvent = {
        stepId: step.id,
        testId,
        label: step.description,
        status: 'running',
        durationMs: 0,
        timestamp: new Date().toISOString(),
      };

      runRecord.results[testId].steps.push(stepEvent);
      onUpdate({ ...runRecord });

      if (overallFailed) {
        stepEvent.status = 'skipped';
        continue;
      }

      try {
        if (step.type === 'action') {
          await executeActionStep(page, step, plan.targetUrl, isLocalFixture);
        } else if (step.type === 'assertion') {
          await executeAssertionStep(page, step, consoleErrors);
        }

        stepEvent.status = 'passed';
        stepEvent.durationMs = Date.now() - stepStartTime;

        // Capture milestone screenshot for Honest Execution Preview
        const frameFilename = `frame-${i + 1}.png`;
        const framePath = path.join(artifactsDir, frameFilename);

        // Visual change actions (navigate, click, fill, scroll, press) or initial step require a fresh screenshot
        const isVisualChangeAction = step.type === 'action' || i === 0;

        let captured = false;
        if (isVisualChangeAction) {
          try {
            await page.screenshot({
              path: framePath,
              fullPage: false,
              animations: 'disabled',
              timeout: 6000,
            });
            captured = fs.existsSync(framePath) && fs.statSync(framePath).size > 0;
          } catch (screenshotErr: any) {
            console.warn(`[Veriflow] Milestone screenshot for step ${i + 1} timed out or failed:`, screenshotErr?.message || screenshotErr);
          }
        }

        // For non-visual assertions (title, console, count, url) or as fallback if capture timed out,
        // propagate the latest valid milestone frame so the timeline is 100% complete with 0 broken images
        if (!captured) {
          if (i > 0) {
            const prevFramePath = path.join(artifactsDir, `frame-${i}.png`);
            if (fs.existsSync(prevFramePath)) {
              try {
                fs.copyFileSync(prevFramePath, framePath);
                captured = true;
              } catch {
                // ignore
              }
            }
          }
        }

        // If step 1 failed with animations: 'disabled', retry standard capture
        if (!captured && i === 0) {
          try {
            await page.screenshot({ path: framePath, fullPage: false, timeout: 8000 });
            captured = fs.existsSync(framePath) && fs.statSync(framePath).size > 0;
          } catch {
            // ignore
          }
        }

        const frameUrl = `/artifacts/${runId}/artifacts/${frameFilename}`;
        previewFrames.push({
          timestamp: new Date().toISOString(),
          stepIndex: i + 1,
          stepLabel: step.description,
          imageUrl: frameUrl,
        });

        runRecord.previewFrames = [...previewFrames];
        runRecord.latestPreviewUrl = frameUrl;
        onUpdate({ ...runRecord });
      } catch (err: any) {
        overallFailed = true;
        stepEvent.status = 'failed';
        stepEvent.durationMs = Date.now() - stepStartTime;
        stepEvent.error = err.message || 'Step execution failed';
        failureError = stepEvent.error;

        // Parse assertion diff if available
        const diffMatch = stepEvent.error?.match(/Expected: (.*)[\r\n]+Received: (.*)/);
        if (diffMatch) {
          stepEvent.assertionDiff = {
            expected: diffMatch[1]?.trim() || '',
            actual: diffMatch[2]?.trim() || '',
          };
        }

        // Capture failure screenshot (AST-011)
        const failureFilename = `${testId}-failure.png`;
        const failurePath = path.join(artifactsDir, failureFilename);
        try {
          await page.screenshot({ path: failurePath, fullPage: true, animations: 'disabled', timeout: 3000 });
          if (fs.existsSync(failurePath) && fs.statSync(failurePath).size > 0) {
            runRecord.results[testId].screenshotUrl = `/artifacts/${runId}/artifacts/${failureFilename}`;
            runRecord.latestPreviewUrl = runRecord.results[testId].screenshotUrl;
          }
        } catch {
          if (previewFrames.length > 0) {
            runRecord.results[testId].screenshotUrl = previewFrames[previewFrames.length - 1].imageUrl;
          }
        }

        onUpdate({ ...runRecord });
      }
    }

    // 3. Finalize Status and Reconcile
    const durationMs = Date.now() - startTime;
    runRecord.completedAt = new Date().toISOString();
    runRecord.summary.durationMs = durationMs;
    runRecord.results[testId].durationMs = durationMs;

    if (overallFailed) {
      runRecord.status = 'failed';
      runRecord.summary.failed = 1;
      runRecord.results[testId].status = 'failed';
      runRecord.results[testId].error = failureError;
    } else {
      runRecord.status = 'passed';
      runRecord.summary.passed = 1;
      runRecord.results[testId].status = 'passed';
    }

    onUpdate({ ...runRecord });
  } catch (fatalErr: any) {
    // Process or infrastructure failure (RUN-003, RUN-006)
    const durationMs = Date.now() - startTime;
    runRecord.status = 'error';
    runRecord.completedAt = new Date().toISOString();
    runRecord.summary.durationMs = durationMs;
    runRecord.results[testId].status = 'infrastructure_error';
    runRecord.results[testId].error = `Infrastructure error: ${fatalErr.message || 'Browser process crashed or timed out'}`;
    onUpdate({ ...runRecord });
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

async function executeActionStep(
  page: Page,
  step: PlanStep,
  defaultUrl: string,
  isLocalFixture: boolean
): Promise<void> {
  switch (step.action) {
    case 'navigate': {
      const targetUrl = step.target || defaultUrl;
      const validation = await validateTargetUrl(targetUrl, isLocalFixture);
      if (!validation.valid) {
        throw new Error(`Navigation blocked: ${validation.error}`);
      }
      // Establish initial HTTP commit, avoiding stalls on sites with background event streams
      await page.goto(targetUrl, { waitUntil: 'commit', timeout: 20000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      // Brief stabilization for initial client bundle hydration
      await page.waitForTimeout(600);
      break;
    }
    case 'click': {
      if (!step.target) throw new Error('Click action requires a target selector or text');
      const locator = resolveLocator(page, step.target);
      const visibleLoc = locator.locator('visible=true');
      const targetLoc = (await visibleLoc.count().catch(() => 0)) > 0 ? visibleLoc.first() : locator.first();
      await targetLoc.waitFor({ state: 'visible', timeout: 4000 });
      await targetLoc.click({ timeout: 4000 });
      break;
    }
    case 'fill': {
      if (!step.target) throw new Error('Fill action requires a target input selector');
      const locator = resolveLocator(page, step.target);
      const visibleLoc = locator.locator('visible=true');
      const targetLoc = (await visibleLoc.count().catch(() => 0)) > 0 ? visibleLoc.first() : locator.first();
      await targetLoc.waitFor({ state: 'visible', timeout: 4000 });
      await targetLoc.fill(step.value || '', { timeout: 4000 });
      break;
    }
    case 'select': {
      if (!step.target) throw new Error('Select action requires a target selector');
      const locator = resolveLocator(page, step.target);
      await locator.first().selectOption(step.value || '', { timeout: 4000 });
      break;
    }
    case 'scroll': {
      const amount = step.options?.amount || 400;
      const direction = step.options?.direction === 'up' ? -amount : amount;
      await page.evaluate((y) => window.scrollBy(0, y), direction);
      await page.waitForTimeout(200);
      break;
    }
    case 'press': {
      const key = step.value || 'Enter';
      await page.keyboard.press(key);
      if (key === 'Enter') {
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        await page.waitForTimeout(800);
      }
      break;
    }
    case 'wait': {
      const ms = Math.min(step.options?.timeoutMs || 1000, 5000);
      await page.waitForTimeout(ms);
      break;
    }
    default:
      throw new Error(`Unsupported action type: "${step.action}"`);
  }
}

async function executeAssertionStep(
  page: Page,
  step: PlanStep,
  consoleErrors: string[]
): Promise<void> {
  switch (step.assertion) {
    case 'assert_visible': {
      if (!step.target) throw new Error('assert_visible requires a target selector or text');
      const locator = resolveLocator(page, step.target);
      
      // Fast path: Immediately test if any candidate is already visible without blocking
      const count = await locator.count().catch(() => 0);
      let isAnyVisible = false;
      for (let idx = 0; idx < Math.min(count, 15); idx++) {
        if (await locator.nth(idx).isVisible().catch(() => false)) {
          isAnyVisible = true;
          break;
        }
      }

      if (!isAnyVisible) {
        // If not immediately visible, wait up to 3500ms
        try {
          const visibleLoc = locator.locator('visible=true');
          const vCount = await visibleLoc.count().catch(() => 0);
          if (vCount > 0) {
            await visibleLoc.first().waitFor({ state: 'visible', timeout: 3500 });
          } else {
            await locator.first().waitFor({ state: 'visible', timeout: 3500 });
          }
        } catch {
          throw new Error(`Expected element matching "${step.target}" to be visible, but it was not found on the page.`);
        }
      }
      break;
    }
    case 'assert_text': {
      if (!step.target) throw new Error('assert_text requires a target selector or text');
      const locator = resolveLocator(page, step.target);
      const actualText = await locator.first().innerText({ timeout: 5000 });
      const expected = step.value || '';
      if (!actualText.includes(expected)) {
        throw new Error(`Text assertion failed.\nExpected: "${expected}"\nReceived: "${actualText.trim()}"`);
      }
      break;
    }
    case 'assert_url': {
      const currentUrl = page.url();
      const expected = step.value || '';
      if (!currentUrl.includes(expected)) {
        throw new Error(`URL assertion failed.\nExpected: "${expected}"\nReceived: "${currentUrl}"`);
      }
      break;
    }
    case 'assert_title': {
      const title = await page.title();
      const expected = step.value || '';
      if (!title || !title.trim()) {
        throw new Error('Title assertion failed: Document title is missing or empty.');
      }
      if (expected && !title.toLowerCase().includes(expected.toLowerCase())) {
        throw new Error(`Title assertion failed.\nExpected: "${expected}"\nReceived: "${title}"`);
      }
      break;
    }
    case 'assert_count': {
      if (!step.target) throw new Error('assert_count requires a target selector');
      const locator = resolveLocator(page, step.target);
      const count = await locator.count();
      const expectedCount = parseInt(step.value || '0', 10);
      if (count !== expectedCount) {
        throw new Error(`Count assertion failed for "${step.target}".\nExpected: ${expectedCount}\nReceived: ${count}`);
      }
      break;
    }
    case 'assert_field_value': {
      if (!step.target) throw new Error('assert_field_value requires a target input selector');
      const locator = resolveLocator(page, step.target);
      const actualValue = await locator.first().inputValue({ timeout: 5000 });
      const expected = step.value || '';
      if (actualValue !== expected) {
        throw new Error(`Input value assertion failed.\nExpected: "${expected}"\nReceived: "${actualValue}"`);
      }
      break;
    }
    case 'assert_element_state': {
      if (!step.target) throw new Error('assert_element_state requires a target selector');
      const locator = resolveLocator(page, step.target);
      const state = step.value || 'enabled';
      if (state === 'disabled') {
        const isDisabled = await locator.first().isDisabled({ timeout: 5000 });
        if (!isDisabled) throw new Error(`Expected element "${step.target}" to be disabled, but it was enabled.`);
      } else if (state === 'hidden') {
        const isHidden = await locator.first().isHidden({ timeout: 5000 });
        if (!isHidden) throw new Error(`Expected element "${step.target}" to be hidden, but it was visible.`);
      } else {
        const isEnabled = await locator.first().isEnabled({ timeout: 5000 });
        if (!isEnabled) throw new Error(`Expected element "${step.target}" to be enabled, but it was disabled.`);
      }
      break;
    }
    case 'assert_console_no_errors': {
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors assertion failed. Emitted errors: ${consoleErrors.slice(0, 3).join('; ')}`);
      }
      break;
    }
    default:
      throw new Error(`Unsupported assertion type: "${step.assertion}"`);
  }
}

/**
 * Flexible locator resolver supporting CSS selectors, text matches, role selectors, and XPath.
 */
function resolveLocator(page: Page, target: string) {
  if (target.startsWith('text=')) {
    const rawText = target.substring(5).replace(/^["']|["']$/g, '');
    return page.getByText(rawText);
  }
  try {
    return page.locator(target);
  } catch {
    return page.getByText(target);
  }
}

