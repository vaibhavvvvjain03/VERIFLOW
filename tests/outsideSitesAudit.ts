import { TestPlan } from '../shared/types';

interface OutsideSiteTest {
  siteName: string;
  targetUrl: string;
  question: string;
  plan: TestPlan;
}

const auditSuite: OutsideSiteTest[] = [
  // 1. Example Domain
  {
    siteName: 'Example Domain',
    targetUrl: 'https://example.com',
    question: 'Does example.com render with its verified "Example Domain" title and documentation text?',
    plan: {
      id: 'OUTSIDE-01-EXAMPLE',
      name: 'Example Domain - Title and Text Verification',
      description: 'Assert that https://example.com loads with title "Example Domain" and documentation text.',
      targetUrl: 'https://example.com',
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 'step-1',
          type: 'action',
          action: 'navigate',
          target: 'https://example.com',
          description: 'Navigate to https://example.com',
        },
        {
          id: 'step-2',
          type: 'assertion',
          assertion: 'assert_title',
          value: 'Example Domain',
          description: 'Assert document title contains "Example Domain"',
          expectedOutcome: 'Page title is "Example Domain"',
        },
        {
          id: 'step-3',
          type: 'assertion',
          assertion: 'assert_text',
          target: 'body',
          value: 'documentation examples',
          description: 'Assert body text contains "documentation examples"',
          expectedOutcome: 'Documentation body text is rendered',
        },
      ],
    },
  },

  // 2. Hacker News
  {
    siteName: 'Hacker News (Y Combinator)',
    targetUrl: 'https://news.ycombinator.com',
    question: 'Does Hacker News load with its brand title and render its top navigation banner?',
    plan: {
      id: 'OUTSIDE-02-HN',
      name: 'Hacker News - Brand Title & Navigation Landmark Verification',
      description: 'Assert that https://news.ycombinator.com title contains "Hacker News" and top navbar is visible.',
      targetUrl: 'https://news.ycombinator.com',
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 'step-1',
          type: 'action',
          action: 'navigate',
          target: 'https://news.ycombinator.com',
          description: 'Navigate to https://news.ycombinator.com',
        },
        {
          id: 'step-2',
          type: 'assertion',
          assertion: 'assert_title',
          value: 'Hacker News',
          description: 'Assert document title contains "Hacker News"',
          expectedOutcome: 'Document title contains "Hacker News"',
        },
        {
          id: 'step-3',
          type: 'assertion',
          assertion: 'assert_visible',
          target: '#hnmain, .hnname, table',
          description: 'Assert top navigation container or table is visible',
          expectedOutcome: 'Top navigation bar is visible',
        },
      ],
    },
  },

  // 3. Wikipedia
  {
    siteName: 'Wikipedia English Portal',
    targetUrl: 'https://en.wikipedia.org',
    question: 'Does Wikipedia provide an interactive search input that accepts queries and navigates to the query result?',
    plan: {
      id: 'OUTSIDE-03-WIKI',
      name: 'Wikipedia - Search Input & Query Flow',
      description: 'Assert Wikipedia search input accepts "Playwright" and renders the query.',
      targetUrl: 'https://en.wikipedia.org',
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 'step-1',
          type: 'action',
          action: 'navigate',
          target: 'https://en.wikipedia.org',
          description: 'Navigate to https://en.wikipedia.org',
        },
        {
          id: 'step-2',
          type: 'action',
          action: 'fill',
          target: 'input[name="search"], input[type="search"]',
          value: 'Playwright',
          description: 'Fill search query input with "Playwright"',
        },
        {
          id: 'step-3',
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'body',
          description: 'Assert page body and search suggestions render cleanly',
          expectedOutcome: 'Search query accepted without crash',
        },
      ],
    },
  },

  // 4. httpbin
  {
    siteName: 'httpbin.org HTTP Testing Service',
    targetUrl: 'https://httpbin.org',
    question: 'Does httpbin.org adapt cleanly in mobile viewport (375x667) and scroll down without layout crash?',
    plan: {
      id: 'OUTSIDE-04-HTTPBIN',
      name: 'httpbin - Mobile Viewport & Scroll Responsiveness',
      description: 'Assert httpbin.org in mobile viewport (375x667) scrolls smoothly and title matches.',
      targetUrl: 'https://httpbin.org',
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 'step-1',
          type: 'action',
          action: 'navigate',
          target: 'https://httpbin.org',
          options: {
            viewport: { width: 375, height: 667 },
          },
          description: 'Navigate to https://httpbin.org with 375x667 mobile viewport',
        },
        {
          id: 'step-2',
          type: 'assertion',
          assertion: 'assert_title',
          value: 'httpbin',
          description: 'Assert document title contains "httpbin"',
          expectedOutcome: 'Document title matches httpbin',
        },
        {
          id: 'step-3',
          type: 'action',
          action: 'scroll',
          options: { direction: 'down', amount: 350 },
          description: 'Scroll viewport down 350px',
        },
        {
          id: 'step-4',
          type: 'assertion',
          assertion: 'assert_visible',
          target: 'body',
          description: 'Assert body content renders properly in mobile viewport',
          expectedOutcome: 'Mobile layout is responsive',
        },
      ],
    },
  },

  // 5. Playwright Documentation
  {
    siteName: 'Playwright Official Documentation',
    targetUrl: 'https://playwright.dev',
    question: 'Does playwright.dev display its title and primary "Get started" link leading to the docs?',
    plan: {
      id: 'OUTSIDE-05-PLAYWRIGHT',
      name: 'Playwright.dev - Primary CTA Link Navigation',
      description: 'Assert playwright.dev title and click primary "Get started" link navigating to docs.',
      targetUrl: 'https://playwright.dev',
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 'step-1',
          type: 'action',
          action: 'navigate',
          target: 'https://playwright.dev',
          description: 'Navigate to https://playwright.dev',
        },
        {
          id: 'step-2',
          type: 'assertion',
          assertion: 'assert_title',
          value: 'Playwright',
          description: 'Assert title contains "Playwright"',
          expectedOutcome: 'Document title contains "Playwright"',
        },
        {
          id: 'step-3',
          type: 'action',
          action: 'click',
          target: 'a:has-text("Get started")',
          description: 'Click primary "Get started" call to action button',
        },
        {
          id: 'step-4',
          type: 'assertion',
          assertion: 'assert_url',
          value: '/docs/intro',
          description: 'Assert URL contains "/docs/intro"',
          expectedOutcome: 'Browser navigates to intro documentation',
        },
      ],
    },
  },
];

async function runAudit() {
  console.log('================================================================');
  console.log('   VERIFLOW OUTSIDE WEBSITES VERIFICATION AUDIT');
  console.log(`   Auditing ${auditSuite.length} Public Websites via Backend Playwright Runner`);
  console.log('================================================================\n');

  const results: any[] = [];

  for (let i = 0; i < auditSuite.length; i++) {
    const item = auditSuite[i];
    console.log(`[${i + 1}/${auditSuite.length}] Testing: ${item.siteName}`);
    console.log(`     Target URL: ${item.targetUrl}`);
    console.log(`     Question:   ${item.question}`);

    const res = await fetch('http://localhost:3001/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: item.plan,
        targetUrl: item.targetUrl,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`     ❌ Failed to start run: HTTP ${res.status} - ${errText}`);
      results.push({ site: item.siteName, status: 'FAILED_TO_START', error: errText });
      continue;
    }

    const { runId } = await res.json();
    console.log(`     Run created: ${runId}. Polling execution...`);

    let completedRun: any = null;
    const startPoll = Date.now();

    while (Date.now() - startPoll < 35000) {
      await new Promise((r) => setTimeout(r, 800));
      const pollRes = await fetch(`http://localhost:3001/api/runs/${runId}`);
      if (pollRes.ok) {
        const data = await pollRes.json();
        if (data.status === 'passed' || data.status === 'failed' || data.status === 'error') {
          completedRun = data;
          break;
        }
      }
    }

    if (!completedRun) {
      console.error(`     ❌ Execution timed out waiting for run ${runId}`);
      results.push({ site: item.siteName, status: 'TIMEOUT' });
      continue;
    }

    const testResult = completedRun.results[item.plan.id];
    console.log(`     Status:     ${completedRun.status.toUpperCase()} (${completedRun.summary?.durationMs}ms)`);
    if (testResult) {
      console.log(`     Steps executed: ${testResult.steps?.length || 0}`);
      testResult.steps?.forEach((step: any, idx: number) => {
        const stepName = step.label || step.description || `Step ${idx + 1}`;
        console.log(`       ${step.status === 'passed' ? '✓' : '✗'} Step ${idx + 1}: ${stepName} (${step.durationMs}ms)`);
        if (step.error) console.log(`         Error: ${step.error}`);
      });
    }

    results.push({
      site: item.siteName,
      targetUrl: item.targetUrl,
      question: item.question,
      runId,
      status: completedRun.status,
      durationMs: completedRun.summary?.durationMs,
      steps: testResult?.steps || [],
    });

    console.log('');
  }

  console.log('================================================================');
  console.log('                     FINAL AUDIT SUMMARY');
  console.log('================================================================');
  const allPassed = results.every((r) => r.status === 'passed');
  results.forEach((r, idx) => {
    console.log(`${r.status === 'passed' ? '✅' : '❌'} [${idx + 1}] ${r.site}: ${r.status.toUpperCase()} (${r.durationMs || 0}ms)`);
  });
  console.log('================================================================');

  if (!allPassed) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
