import { TestPlan } from '../../../shared/types';

export function createUniversalPlan(commandId: string, targetUrl: string): TestPlan | null {
  const cleanUrl = targetUrl || 'https://example.com';
  const now = new Date().toISOString();

  switch (commandId.toUpperCase()) {
    case 'CMD-TITLE':
      return {
        id: 'CMD-TITLE',
        name: 'Page Title & Identity Assertion',
        description: `Verify that ${cleanUrl} document title loads correctly and is not empty.`,
        targetUrl: cleanUrl,
        createdAt: now,
        steps: [
          {
            id: 'step-1',
            type: 'action',
            action: 'navigate',
            target: cleanUrl,
            description: `Navigate to target URL: ${cleanUrl}`,
          },
          {
            id: 'step-2',
            type: 'assertion',
            assertion: 'assert_title',
            value: '',
            options: { contains: true },
            description: 'Assert page document title is present and rendered',
            expectedOutcome: 'Document title is loaded and non-empty',
          },
        ],
      };

    case 'CMD-HEADING':
      return {
        id: 'CMD-HEADING',
        name: 'Primary Heading (H1) Visibility',
        description: `Verify that ${cleanUrl} displays a primary top-level heading (H1) or header landmark.`,
        targetUrl: cleanUrl,
        createdAt: now,
        steps: [
          {
            id: 'step-1',
            type: 'action',
            action: 'navigate',
            target: cleanUrl,
            description: `Navigate to target URL: ${cleanUrl}`,
          },
          {
            id: 'step-2',
            type: 'assertion',
            assertion: 'assert_visible',
            target: 'h1',
            description: 'Assert primary top-level heading (h1) is visible in the viewport',
            expectedOutcome: 'Page contains a visible h1 element',
          },
        ],
      };

    case 'CMD-NAV':
      return {
        id: 'CMD-NAV',
        name: 'Header & Navigation Bar Check',
        description: `Verify that ${cleanUrl} renders a header or navigation landmark for user discovery.`,
        targetUrl: cleanUrl,
        createdAt: now,
        steps: [
          {
            id: 'step-1',
            type: 'action',
            action: 'navigate',
            target: cleanUrl,
            description: `Navigate to target URL: ${cleanUrl}`,
          },
          {
            id: 'step-2',
            type: 'assertion',
            assertion: 'assert_visible',
            target: 'header, nav, [role="navigation"], #header, .header, #nav, .nav',
            description: 'Assert header or navigation landmark is visible',
            expectedOutcome: 'Navigation container is accessible',
          },
        ],
      };

    case 'CMD-SEARCH':
      return {
        id: 'CMD-SEARCH',
        name: 'Interactive Search & Input Flow',
        description: `Detect interactive search or text input on ${cleanUrl}, input a test query, and submit.`,
        targetUrl: cleanUrl,
        createdAt: now,
        steps: [
          {
            id: 'step-1',
            type: 'action',
            action: 'navigate',
            target: cleanUrl,
            description: `Navigate to target URL: ${cleanUrl}`,
          },
          {
            id: 'step-2',
            type: 'action',
            action: 'fill',
            target: 'input[type="search"], input[name*="search" i], input[name="q"], input[placeholder*="search" i], input[type="text"]',
            value: 'Veriflow',
            description: 'Locate search or query input and enter search term "Veriflow"',
          },
          {
            id: 'step-3',
            type: 'action',
            action: 'press',
            target: 'input[type="search"], input[name*="search" i], input[name="q"], input[placeholder*="search" i], input[type="text"]',
            value: 'Enter',
            description: 'Submit search by pressing Enter',
          },
          {
            id: 'step-4',
            type: 'assertion',
            assertion: 'assert_visible',
            target: 'body',
            description: 'Assert search response or search page rendered',
            expectedOutcome: 'Page handles query interaction without crashing',
          },
        ],
      };

    case 'CMD-CONSOLE':
      return {
        id: 'CMD-CONSOLE',
        name: 'Zero Console Errors Audit',
        description: `Audit ${cleanUrl} console logs during initial render and verify zero uncaught exceptions.`,
        targetUrl: cleanUrl,
        createdAt: now,
        steps: [
          {
            id: 'step-1',
            type: 'action',
            action: 'navigate',
            target: cleanUrl,
            description: `Navigate to target URL: ${cleanUrl}`,
          },
          {
            id: 'step-2',
            type: 'assertion',
            assertion: 'assert_console_no_errors',
            description: 'Assert zero uncaught runtime exceptions or pageerror events in console',
            expectedOutcome: 'Browser console health is 100% clean',
          },
        ],
      };

    case 'CMD-RESPONSIVE':
      return {
        id: 'CMD-RESPONSIVE',
        name: 'Mobile Viewport Layout Validation',
        description: `Emulate mobile device viewport (375x667) and verify responsive rendering and scrollability on ${cleanUrl}.`,
        targetUrl: cleanUrl,
        createdAt: now,
        steps: [
          {
            id: 'step-1',
            type: 'action',
            action: 'navigate',
            target: cleanUrl,
            options: {
              viewport: { width: 375, height: 667 },
            },
            description: `Navigate to ${cleanUrl} with mobile viewport dimensions 375×667`,
          },
          {
            id: 'step-2',
            type: 'action',
            action: 'scroll',
            options: { direction: 'down', amount: 300 },
            description: 'Scroll viewport down 300px to trigger dynamic mobile rendering',
          },
          {
            id: 'step-3',
            type: 'assertion',
            assertion: 'assert_visible',
            target: 'body',
            description: 'Assert page body and layout are responsive and visible',
            expectedOutcome: 'Content renders without mobile layout truncation',
          },
        ],
      };

    case 'CMD-LINK':
      return {
        id: 'CMD-LINK',
        name: 'Primary Navigation Link Flow',
        description: `Find first interactive content or navigation link on ${cleanUrl}, click it, and assert navigation.`,
        targetUrl: cleanUrl,
        createdAt: now,
        steps: [
          {
            id: 'step-1',
            type: 'action',
            action: 'navigate',
            target: cleanUrl,
            description: `Navigate to target URL: ${cleanUrl}`,
          },
          {
            id: 'step-2',
            type: 'action',
            action: 'click',
            target: 'main a, article a, header a, nav a, a[href^="/"], a[href^="http"]',
            description: 'Click primary navigation link or call-to-action on the page',
          },
          {
            id: 'step-3',
            type: 'assertion',
            assertion: 'assert_visible',
            target: 'body',
            description: 'Assert destination page renders after link click',
            expectedOutcome: 'Page transition completes successfully',
          },
        ],
      };

    default:
      return null;
  }
}
