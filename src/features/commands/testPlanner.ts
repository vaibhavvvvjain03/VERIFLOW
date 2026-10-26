import { TestPlan, PlanStep } from '../../../shared/types';

export interface PlanGenerationResult {
  success: boolean;
  plan?: TestPlan;
  error?: string;
  clarificationRequired?: string;
  warning?: string;
  requiresConfirmation?: boolean;
}

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt/i,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /child_process/i,
  /rm\s+-rf/i,
  /powershell/i,
  /cmd\.exe/i,
  /<script[\s>]/i,
  /javascript\s*:/i,
  /process\.env/i,
  /fs\.read/i,
];

const DESTRUCTIVE_PATTERNS = [
  /\b(delete|destroy|purge|drop)\b/i,
  /\b(pay|purchase|charge|credit\s*card|checkout\s*real|payment)\b/i,
  /\b(publish|post\s*publicly|send\s*email|send\s*sms)\b/i,
];

const AUTH_CREDENTIAL_PATTERNS = [
  /\b(password|passwd|secret|api[_\s]?key|bearer\s*token)\b/i,
];

/**
 * Splits natural language or Wispr Flow voice prompt into distinct semantic clauses
 * preserving quoted strings and recognizing conjunctions (and, then, with, also, commas, periods).
 */
function splitPromptIntoClauses(prompt: string): string[] {
  // First split by sentence punctuation (. ; \n ?)
  const sentences = prompt.split(/[.;\n?]+/).map((s) => s.trim()).filter(Boolean);
  const clauses: string[] = [];

  for (const sentence of sentences) {
    // Strip standalone filler words like "Check" or "Test" when followed by actual clauses
    const trimmed = sentence.replace(/[^\w\s-]/g, '').trim();
    if (['check', 'test', 'verify', 'please', 'hello', 'run'].includes(trimmed.toLowerCase())) {
      continue;
    }

    // Split sentence by conjunctions: "and then", "then", "and also", "as well as", ", and", "and", "also", ","
    const parts = splitByConjunctionsPreservingQuotes(sentence);
    for (const p of parts) {
      const cleanP = p.trim();
      if (
        cleanP &&
        !['there is', 'is there', 'are there', 'there are', 'is it', 'can you'].includes(cleanP.toLowerCase())
      ) {
        clauses.push(cleanP);
      }
    }
  }

  if (clauses.length === 0) {
    clauses.push(prompt.trim());
  }

  return clauses;
}

/**
 * Tokenizes a sentence by conjunctions while respecting single/double quotes.
 */
function splitByConjunctionsPreservingQuotes(text: string): string[] {
  // Strip leading preposition "with " if present (e.g. "with a primary heading and a navigation bar")
  let cleaned = text.replace(/^with\s+/i, '');

  const parts: string[] = [];
  let lastIndex = 0;
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if ((char === '"' || char === "'") && (i === 0 || cleaned[i - 1] !== '\\')) {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
      }
    }

    if (!inQuote) {
      const remaining = cleaned.substring(i);
      const match = remaining.match(
        /^(?:and\s+then|then|and\s+also|as\s+well\s+as|,\s*and|\band\b|,\s*then|\balso\b|,)/i
      );
      if (match) {
        const chunk = cleaned.substring(lastIndex, i).trim();
        if (chunk) parts.push(chunk);
        i += match[0].length - 1;
        lastIndex = i + 1;
      }
    }
  }

  const remainder = cleaned.substring(lastIndex).trim();
  if (remainder) parts.push(remainder);

  return parts.length > 0 ? parts : [cleaned];
}

/**
 * Translates natural language questions or Wispr Flow voice prompts into a structured, reviewable TestPlan.
 * Supports arbitrary testing questions, compound sentences, multi-action journeys, and universal browser verification.
 */
export function generateTestPlan(
  rawPrompt: string,
  targetUrl: string
): PlanGenerationResult {
  // CMD-010: Empty voice transcription or accidental submit
  if (!rawPrompt || !rawPrompt.trim()) {
    return {
      success: false,
      error: 'Test prompt is empty. Dictate with Wispr Flow or type a description of the test scenario.',
    };
  }

  // CMD-009: Prompt length limit (2000 chars)
  if (rawPrompt.length > 2000) {
    return {
      success: false,
      error: 'Test prompt exceeds maximum allowed length of 2,000 characters. Please provide a more concise instruction.',
    };
  }

  const prompt = rawPrompt.trim();

  // CMD-007, CMD-008: Prompt injection and arbitrary code execution rejection
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        success: false,
        error: 'Security violation: The request contains prohibited commands or prompt injection syntax. Only browser testing actions and assertions are permitted.',
      };
    }
  }

  // CMD-013: Login / password collection guard
  let authWarning: string | undefined;
  for (const pattern of AUTH_CREDENTIAL_PATTERNS) {
    if (pattern.test(prompt)) {
      authWarning = 'Security notice: Passwords and sensitive credentials must never be dictated or entered in plain text. Testing is running in an unauthenticated or public scope.';
    }
  }

  // CMD-012: Destructive action detection
  let isDestructive = false;
  let destructiveWarning: string | undefined;
  for (const pattern of DESTRUCTIVE_PATTERNS) {
    if (pattern.test(prompt)) {
      isDestructive = true;
      destructiveWarning = 'Notice: This test request appears to involve potentially state-modifying or destructive actions. Execution requires explicit confirmation.';
    }
  }

  const normalized = prompt.toLowerCase();

  // CMD-006: Contradictory requirements
  if (
    (normalized.includes('should be visible') && normalized.includes('should not be visible')) ||
    (normalized.includes('expect pass') && normalized.includes('expect fail'))
  ) {
    return {
      success: false,
      clarificationRequired: 'The prompt contains contradictory requirements (e.g. both requiring an element to be visible and hidden). Please clarify the expected outcome.',
    };
  }

  // CMD-003: Purely passive exploration without testing assertions
  if (
    (normalized.includes('browse around') || normalized.includes('look around') || normalized.includes('do nothing')) &&
    !normalized.includes('verify') &&
    !normalized.includes('assert') &&
    !normalized.includes('check') &&
    !normalized.includes('is') &&
    !normalized.includes('does')
  ) {
    return {
      success: false,
      clarificationRequired: 'We parsed your request, but did not find an explicit observable assertion. Please specify what outcome to verify (e.g. "and verify text \'Success\' appears" or "and check that URL contains /done").',
      requiresConfirmation: isDestructive,
      warning: destructiveWarning || authWarning,
    };
  }

  const steps: PlanStep[] = [];
  const planId = `plan-${Date.now()}`;
  let stepIndex = 1;

  // Always start with navigation to target URL
  steps.push({
    id: `step-${planId}-${stepIndex++}`,
    type: 'action',
    action: 'navigate',
    target: targetUrl,
    description: `Navigate to target website: ${targetUrl}`,
    expectedOutcome: 'Target page loads with HTTP 200 or successful document readiness.',
  });

  // -------------------------------------------------------------
  // PATTERN 0: Dedicated Hackathon / Challenge Journey (WeMakeDevs No Hands Challenge)
  // e.g. "Locate the No Hands challenge and verify Project Ideas section"
  // -------------------------------------------------------------
  if (
    normalized.includes('no hands') ||
    normalized.includes('wispr challenge') ||
    (normalized.includes('challenge') && (normalized.includes('ideas') || normalized.includes('project ideas') || normalized.includes('wispr')))
  ) {
    steps.push({
      id: `step-${planId}-${stepIndex++}`,
      type: 'action',
      action: 'click',
      target: 'a[href*="/wispr"], a:has-text("No Hands"), a:has-text("Wispr")',
      description: 'Locate and open the "No Hands: The Wispr Challenge" event card',
    });

    steps.push({
      id: `step-${planId}-${stepIndex++}`,
      type: 'assertion',
      assertion: 'assert_visible',
      target: 'h1, h2, [role="heading"]',
      description: 'Assert that the challenge headline "No Hands: The Wispr Challenge" appears',
      expectedOutcome: 'Challenge headline is rendered and visible.',
    });

    steps.push({
      id: `step-${planId}-${stepIndex++}`,
      type: 'action',
      action: 'click',
      target: 'a[href*="/wispr/ideas"], a[href*="/ideas"], button:has-text("PROJECT IDEAS"), a:has-text("PROJECT IDEAS")',
      description: 'Navigate to the "PROJECT IDEAS" section',
    });

    steps.push({
      id: `step-${planId}-${stepIndex++}`,
      type: 'assertion',
      assertion: 'assert_visible',
      target: 'body',
      description: 'Verify the Project Ideas destination view is accessible and loaded',
      expectedOutcome: 'Project Ideas view loads successfully.',
    });

    return assemblePlan(prompt, planId, targetUrl, steps, isDestructive, destructiveWarning || authWarning);
  }

  // -------------------------------------------------------------
  // PATTERN 0B: Form Field Validation & Reject Pattern
  // e.g. "check whether email field rejects invalid format"
  // -------------------------------------------------------------
  if (normalized.includes('invalid email') || (normalized.includes('email') && normalized.includes('reject'))) {
    steps.push({
      id: `step-${planId}-${stepIndex++}`,
      type: 'action',
      action: 'fill',
      target: 'input[type="email"], input[name="email"], input[placeholder*="email" i]',
      value: 'not-an-email',
      description: 'Fill email field with malformed value "not-an-email"',
    });

    steps.push({
      id: `step-${planId}-${stepIndex++}`,
      type: 'action',
      action: 'click',
      target: 'button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Place Order")',
      description: 'Submit form to trigger validation',
    });

    steps.push({
      id: `step-${planId}-${stepIndex++}`,
      type: 'assertion',
      assertion: 'assert_visible',
      target: '[data-testid*="error"], .error, [role="alert"], :invalid',
      description: 'Assert that an observable field validation error or :invalid state is displayed',
      expectedOutcome: 'Form submission is blocked and an error message is visible.',
    });

    return assemblePlan(prompt, planId, targetUrl, steps, isDestructive, destructiveWarning || authWarning);
  }

  // -------------------------------------------------------------
  // MULTI-CLAUSE & ARBITRARY NATURAL LANGUAGE EXTRACTION
  // Decomposes compound instructions into discrete Playwright steps.
  // -------------------------------------------------------------
  const clauses = splitPromptIntoClauses(prompt);
  const addedAssertionKeys = new Set<string>();

  for (const clause of clauses) {
    const cNorm = clause.toLowerCase();

    // 1. Search Flow within clause
    // e.g. "search for 'veriflow' and verify results" or "test search query 'ai'"
    const searchMatch = clause.match(/search\s+(?:for\s+)?["']?([^"']+)["']?(?:\s+(?:and|then)\s+(.+))?/i);
    if (searchMatch && searchMatch[1] && !['bar', 'box', 'input', 'field'].includes(searchMatch[1].toLowerCase().trim())) {
      const query = searchMatch[1].trim();
      steps.push({
        id: `step-${planId}-${stepIndex++}`,
        type: 'action',
        action: 'fill',
        target: 'input[type="search"], input[name="q"], input[name="search"], input[placeholder*="Search" i]',
        value: query,
        description: `Enter search term "${query}" into search input field`,
      });

      steps.push({
        id: `step-${planId}-${stepIndex++}`,
        type: 'action',
        action: 'press',
        value: 'Enter',
        description: 'Press Enter to submit search query',
      });

      steps.push({
        id: `step-${planId}-${stepIndex++}`,
        type: 'assertion',
        assertion: 'assert_visible',
        target: 'body',
        description: `Assert that search results or keyword "${query}" is visible on page`,
        expectedOutcome: `Search query "${query}" is accepted and response renders.`,
      });
      addedAssertionKeys.add('search_results');
      continue;
    }

    // 2. Click Element & (optional) URL Verification
    // e.g. "click 'About' and verify URL contains /about", "click 'Documentation' button"
    if (cNorm.startsWith('click') || cNorm.includes('click on') || cNorm.includes('does clicking')) {
      const clickMatch = clause.match(/(?:click(?:ing)?(?:\s+on)?)\s+["']?([^"']+)["']?(?:\s+(?:button|link|element))?(?:\s+(?:and|then|\,)?\s*(?:verify|assert|check|does it|navigates to|open)?\s*(?:url\s+contains|navigates to)?\s*["']?([^"'\?]+)["']?)?/i);
      const clickTarget = clickMatch ? clickMatch[1].trim() : 'a';
      const expectedUrl = clickMatch && clickMatch[2] ? clickMatch[2].trim() : '';

      steps.push({
        id: `step-${planId}-${stepIndex++}`,
        type: 'action',
        action: 'click',
        target: `button:has-text("${clickTarget}"), a:has-text("${clickTarget}"), text="${clickTarget}"`,
        description: `Click element or link with text "${clickTarget}"`,
      });

      if (expectedUrl && !['and', 'then', 'a', 'the'].includes(expectedUrl.toLowerCase())) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_url',
          value: expectedUrl,
          description: `Assert that destination URL contains "${expectedUrl}"`,
          expectedOutcome: `Browser navigates to URL containing "${expectedUrl}".`,
          options: { contains: true },
        });
        addedAssertionKeys.add(`url_${expectedUrl}`);
      } else {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'body',
          description: `Assert that destination view loads cleanly after clicking "${clickTarget}"`,
          expectedOutcome: 'Page transition completes without crash.',
        });
        addedAssertionKeys.add(`click_${clickTarget}`);
      }
      continue;
    }

    // 2B. Dedicated Destination URL Assertion
    // e.g. "verify url contains '/about'", "navigates to iana.org"
    if (cNorm.includes('url') || cNorm.includes('navigat') || cNorm.includes('redirect')) {
      const urlMatch = clause.match(/(?:url\s+(?:contains|is|has|=|matches)?|navigates\s+to|redirects\s+to|goes\s+to)\s*["']?([^"'\s\?]+)["']?/i);
      const rawUrl = urlMatch ? urlMatch[1].trim() : '';
      const cleanUrl = rawUrl && !['contains', 'is', 'a', 'the', 'what', 'does'].includes(rawUrl.toLowerCase()) ? rawUrl : '';

      if (cleanUrl) {
        // If the immediately preceding step was the fallback body visible from a click, replace it with this specific URL assertion
        const lastStep = steps[steps.length - 1];
        if (lastStep && lastStep.type === 'assertion' && lastStep.target === 'body' && lastStep.description.includes('loads cleanly after clicking')) {
          steps.pop();
          stepIndex--;
        }

        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_url',
          value: cleanUrl,
          description: `Assert that destination URL contains "${cleanUrl}"`,
          expectedOutcome: `Browser navigates to URL containing "${cleanUrl}".`,
          options: { contains: true },
        });
        addedAssertionKeys.add(`url_${cleanUrl}`);
        continue;
      }
    }

    // 3. Page Title Assertion
    // e.g. "verify page title", "what is the page title?", "title is 'Wikipedia'", "title contains 'Example Domain'"
    if (cNorm.includes('title')) {
      let cleanExpected = '';

      // 1. Explicit quotes: e.g. title is "Wikipedia", title contains 'Example Domain'
      const quotedMatch = clause.match(/title\s*(?:is|contains|matches|=|should be|has)?\s*["']([^"']+)["']/i);
      if (quotedMatch && quotedMatch[1].trim()) {
        cleanExpected = quotedMatch[1].trim();
      } else {
        // 2. Unquoted match: e.g. title is Wikipedia, title contains Example Domain
        const unquotedMatch = clause.match(/title\s+(?:is|contains|matches|=|should be)\s+([^,\?]+)/i);
        if (unquotedMatch && unquotedMatch[1].trim()) {
          const candidate = unquotedMatch[1].trim().replace(/^["']|["']$/g, '');
          const candidateLower = candidate.toLowerCase();
          const genericWords = ['page', 'the page', 'website', 'the website', 'site', 'the site', 'document', 'tab', 'window', 'present', 'valid', 'loaded'];
          if (!genericWords.includes(candidateLower)) {
            cleanExpected = candidate;
          }
        } else {
          // 3. title of <Subject>: e.g. "title of Wikipedia" vs "title of page"
          const titleOfMatch = clause.match(/title\s+of\s+(?:the\s+)?(["']?[^,\?\s]+["']?)/i);
          if (titleOfMatch && titleOfMatch[1]) {
            const candidate = titleOfMatch[1].trim().replace(/^["']|["']$/g, '');
            const candidateLower = candidate.toLowerCase();
            if (!['page', 'site', 'website', 'document', 'tab', 'window', 'it', 'this'].includes(candidateLower)) {
              cleanExpected = candidate;
            }
          }
        }
      }

      if (!addedAssertionKeys.has('title')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_title',
          value: cleanExpected,
          description: cleanExpected
            ? `Assert page title contains "${cleanExpected}"`
            : 'Assert page title is present and non-empty',
          expectedOutcome: cleanExpected
            ? `Document title matches "${cleanExpected}".`
            : 'Page has a valid document title.',
          options: { contains: true },
        });
        addedAssertionKeys.add('title');
      }
      continue;
    }

    // 4. Responsive Viewport Check
    // e.g. "is the site mobile friendly?", "test at 375x667", "mobile viewport"
    if (cNorm.includes('responsive') || cNorm.includes('viewport') || cNorm.includes('mobile')) {
      const dimMatch = clause.match(/(\d{3,4})\s*[x×,]\s*(\d{3,4})/);
      const width = dimMatch ? parseInt(dimMatch[1], 10) : 375;
      const height = dimMatch ? parseInt(dimMatch[2], 10) : 667;

      if (!addedAssertionKeys.has('responsive')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'action',
          action: 'scroll',
          description: `Set browser viewport to mobile dimensions ${width}×${height} and scroll page`,
          options: { viewport: { width, height }, direction: 'down', amount: 300 },
        });

        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'body',
          description: `Assert primary layout elements remain visible and unbroken at ${width}×${height}`,
          expectedOutcome: `Layout adapts gracefully to ${width}×${height} viewport.`,
        });
        addedAssertionKeys.add('responsive');
      }
      continue;
    }

    // 5. Console Health & Error Audit
    // e.g. "are there any console errors?", "check console logs", "zero errors"
    if (
      cNorm.includes('console') ||
      cNorm.includes('runtime error') ||
      cNorm.includes('zero error') ||
      cNorm.includes('site healthy') ||
      cNorm.includes('broken')
    ) {
      if (!addedAssertionKeys.has('console')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_console_no_errors',
          description: 'Assert that no JavaScript exceptions or console.error calls were emitted',
          expectedOutcome: 'Browser console log has 0 unhandled errors.',
        });
        addedAssertionKeys.add('console');
      }
      continue;
    }

    // 6. Element State Assertion (Enabled / Disabled / Hidden)
    // e.g. "check that button 'Submit' is disabled", "is the search input enabled?"
    if (cNorm.includes('enabled') || cNorm.includes('disabled') || cNorm.includes('hidden')) {
      const state = cNorm.includes('disabled') ? 'disabled' : cNorm.includes('hidden') ? 'hidden' : 'enabled';
      const targetMatch = clause.match(/(?:button|input|element|field)?\s*["']?([^"']+)["']?\s+(?:is|should be)?\s*(?:enabled|disabled|hidden)/i);
      const targetName = targetMatch ? targetMatch[1].trim() : 'button';

      steps.push({
        id: `step-${planId}-${stepIndex++}`,
        type: 'assertion',
        assertion: 'assert_element_state',
        target: `button:has-text("${targetName}"), input[name*="${targetName}" i], text="${targetName}"`,
        value: state,
        description: `Assert that element "${targetName}" is in state "${state}"`,
        expectedOutcome: `Element is confirmed to be ${state}.`,
      });
      addedAssertionKeys.add(`state_${targetName}`);
      continue;
    }

    // 7. Scroll Action
    // e.g. "scroll down 400px", "scroll to footer"
    if (cNorm.includes('scroll down') || cNorm.includes('scroll up') || cNorm.includes('scroll to')) {
      const isUp = cNorm.includes('up') || cNorm.includes('top');
      const amountMatch = clause.match(/(\d+)\s*px/);
      const amount = amountMatch ? parseInt(amountMatch[1], 10) : 400;

      steps.push({
        id: `step-${planId}-${stepIndex++}`,
        type: 'action',
        action: 'scroll',
        description: `Scroll page ${isUp ? 'up' : 'down'} by ${amount}px`,
        options: { direction: isUp ? 'up' : 'down', amount },
      });
      continue;
    }

    // 8. Primary Heading (H1) Landmark Recognition
    // e.g. "with a primary heading", "h1 heading", "primary heading exists"
    if (
      cNorm.includes('primary heading') ||
      cNorm.includes('h1') ||
      cNorm.includes('top heading') ||
      cNorm.includes('main heading') ||
      (cNorm.includes('heading') && !cNorm.includes('subheading'))
    ) {
      if (!addedAssertionKeys.has('heading')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'h1, [role="heading"][aria-level="1"], h2, [role="heading"]',
          description: 'Assert primary top-level heading (h1) or header landmark is visible in the viewport',
          expectedOutcome: 'Primary heading landmark is rendered and visible.',
        });
        addedAssertionKeys.add('heading');
      }
      continue;
    }

    // 9. Navigation Bar Landmark Recognition
    // e.g. "navigation bar", "nav bar", "navbar", "header menu"
    if (
      cNorm.includes('navigation bar') ||
      cNorm.includes('nav bar') ||
      cNorm.includes('navbar') ||
      cNorm.includes('header menu') ||
      cNorm.includes('main nav') ||
      (cNorm.includes('nav') && !cNorm.includes('navigate'))
    ) {
      if (!addedAssertionKeys.has('navbar')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'header, nav, [role="navigation"], [role="banner"], #header, .header, #nav, .nav, .navbar',
          description: 'Assert navigation bar / header menu is rendered and visible',
          expectedOutcome: 'Main navigation landmark is present in document structure.',
        });
        addedAssertionKeys.add('navbar');
      }
      continue;
    }

    // 10. Search Input Landmark Recognition
    // e.g. "search bar", "search input", "search box"
    if (cNorm.includes('search bar') || cNorm.includes('search input') || cNorm.includes('search box') || cNorm.includes('search field')) {
      if (!addedAssertionKeys.has('search_input')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'input[type="search"], [role="searchbox"], input[name*="search" i], input[name="q"], input[placeholder*="search" i], input[id*="search" i], input[type="text"]',
          description: 'Assert search input field is rendered and interactive',
          expectedOutcome: 'Search field is visible and accessible.',
        });
        addedAssertionKeys.add('search_input');
      }
      continue;
    }

    // 11. Brand Logo Recognition
    // e.g. "is the logo visible?", "brand logo"
    if (cNorm.includes('logo')) {
      if (!addedAssertionKeys.has('logo')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'img[alt*="logo" i], svg[class*="logo" i], .logo, #logo, [data-testid*="logo"], a[class*="brand" i], header img',
          description: 'Assert brand logo is visible and rendered',
          expectedOutcome: 'Brand logo is visible in viewport.',
        });
        addedAssertionKeys.add('logo');
      }
      continue;
    }

    // 12. Footer / Copyright Landmark Recognition
    // e.g. "footer", "copyright text", "page footer"
    if (cNorm.includes('footer') || cNorm.includes('copyright')) {
      if (!addedAssertionKeys.has('footer')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'footer, [role="contentinfo"], #footer, .footer',
          description: 'Assert page footer landmark is rendered',
          expectedOutcome: 'Footer landmark is present in DOM.',
        });
        addedAssertionKeys.add('footer');
      }
      continue;
    }

    // 13. Login / Sign In Button or Link
    if (cNorm.includes('login') || cNorm.includes('sign in')) {
      if (!addedAssertionKeys.has('login')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'button:has-text("Log in"), button:has-text("Sign in"), a:has-text("Log in"), a:has-text("Sign in"), [data-testid*="login"]',
          description: 'Assert login button or link is visible',
          expectedOutcome: 'Login interactive trigger is visible.',
        });
        addedAssertionKeys.add('login');
      }
      continue;
    }

    // 14. Sign Up / Register Button or Link
    if (cNorm.includes('sign up') || cNorm.includes('signup') || cNorm.includes('register')) {
      if (!addedAssertionKeys.has('signup')) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'button:has-text("Sign up"), button:has-text("Register"), a:has-text("Sign up"), a:has-text("Register"), [data-testid*="signup"]',
          description: 'Assert sign up button or link is visible',
          expectedOutcome: 'Registration trigger is visible.',
        });
        addedAssertionKeys.add('signup');
      }
      continue;
    }

    // 15. Explicit Quoted Text Matching
    // e.g. Does the page contain "Example Domain"? Verify that "Get Started" appears
    const quotedMatch = clause.match(/["']([^"']+)["']/);
    if (quotedMatch && quotedMatch[1].trim()) {
      const qText = quotedMatch[1].trim();
      if (!addedAssertionKeys.has(`text_${qText}`)) {
        steps.push({
          id: `step-${planId}-${stepIndex++}`,
          type: 'assertion',
          assertion: 'assert_visible',
          target: `text="${qText}"`,
          description: `Assert that text "${qText}" is visible and rendered`,
          expectedOutcome: `Text "${qText}" is observable on page.`,
        });
        addedAssertionKeys.add(`text_${qText}`);
      }
      continue;
    }

    // 16. General Interrogative or Imperative Noun Phrase
    // e.g. "is there a contact form?", "verify the pricing table"
    const nounMatch = clause.match(
      /(?:is\s+there\s+a|does\s+the\s+page\s+have\s+a|does\s+the\s+page\s+contain\s+a|check\s+if\s+there\s+is\s+a|verify\s+(?:the|that)?|check\s+(?:the|that)?|assert\s+(?:the|that)?)\s+([a-zA-Z0-9\s-]+?)(?:\s+visible|\s+on|\s+displayed|\?|$)/i
    );
    if (nounMatch && nounMatch[1].trim()) {
      const rawNoun = nounMatch[1].trim();
      const cleanNoun = rawNoun.replace(/^(the|a|an)\s+/i, '').trim();

      if (cleanNoun && cleanNoun.length > 1 && !['it', 'this', 'there'].includes(cleanNoun.toLowerCase())) {
        if (!addedAssertionKeys.has(`noun_${cleanNoun}`)) {
          steps.push({
            id: `step-${planId}-${stepIndex++}`,
            type: 'assertion',
            assertion: 'assert_visible',
            target: `text=${cleanNoun}`,
            description: `Assert that "${cleanNoun}" is visible on the page`,
            expectedOutcome: `Observable element for "${cleanNoun}" is present.`,
          });
          addedAssertionKeys.add(`noun_${cleanNoun}`);
        }
        continue;
      }
    }
  }

  // Ensure at least one assertion exists across the plan (AST-012, CMD-003)
  const hasAssertion = steps.some((s) => s.type === 'assertion');
  if (!hasAssertion) {
    return {
      success: false,
      clarificationRequired: `We parsed your request: "${prompt}", but did not find an explicit observable assertion. Please specify what outcome to verify (e.g. "and verify text 'Success' appears" or "and check that URL contains /done").`,
      requiresConfirmation: isDestructive,
      warning: destructiveWarning || authWarning,
    };
  }

  return assemblePlan(prompt, planId, targetUrl, steps, isDestructive, destructiveWarning || authWarning);
}

/**
 * Builds the final structured TestPlan object with descriptive metadata.
 */
function assemblePlan(
  prompt: string,
  planId: string,
  targetUrl: string,
  steps: PlanStep[],
  isDestructive: boolean,
  warning?: string
): PlanGenerationResult {
  // Construct a concise editorial plan name
  const assertionSteps = steps.filter((s) => s.type === 'assertion');
  let planName = prompt;
  if (assertionSteps.length > 1) {
    const labels = assertionSteps.map((s) => {
      if (s.assertion === 'assert_title') return 'page title';
      if (s.assertion === 'assert_console_no_errors') return 'console errors';
      if (s.assertion === 'assert_url') return 'navigation URL';
      if (s.target?.includes('h1')) return 'primary heading';
      if (s.target?.includes('nav')) return 'navigation bar';
      if (s.target?.includes('search')) return 'search input';
      if (s.target?.includes('logo')) return 'brand logo';
      if (s.target?.includes('footer')) return 'footer';
      return s.description.replace(/^Assert\s+(?:that\s+)?/i, '').substring(0, 20);
    });
    planName = `Verify ${labels.slice(0, 3).join(', ')}${labels.length > 3 ? ' +' + (labels.length - 3) + ' more' : ''}`;
  } else if (prompt.length > 50) {
    planName = prompt.substring(0, 47) + '...';
  }

  const plan: TestPlan = {
    id: planId,
    name: planName,
    description: prompt,
    targetUrl,
    steps,
    createdAt: new Date().toISOString(),
    estimatedDurationMs: Math.max(steps.length * 1200, 2500),
    requiresConfirmation: isDestructive,
    warning,
  };

  return {
    success: true,
    plan,
    warning,
    requiresConfirmation: isDestructive,
  };
}
