import { generateTestPlan } from '../src/features/commands/testPlanner';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('================================================================');
console.log('   TESTING QUESTION FORMULATIONS & HACKATHON EDGE CASES');
console.log('================================================================\n');

const testCases = [
  {
    q: 'Is the logo visible?',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.assertion === 'assert_visible'),
    name: 'Question: "Is the logo visible?" -> assert_visible',
  },
  {
    q: 'Does the page contain "Example Domain"?',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.assertion === 'assert_visible'),
    name: 'Question: "Does the page contain \'Example Domain\'?" -> assert_visible on text',
  },
  {
    q: 'Is there a search bar on this website?',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.target.includes('search')),
    name: 'Question: "Is there a search bar...?" -> targets search input',
  },
  {
    q: 'Is there a login button?',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.target.includes('Log in') || s.target.includes('login')),
    name: 'Question: "Is there a login button?" -> targets login element',
  },
  {
    q: 'Does clicking "Learn more" navigate to iana.org?',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.action === 'click') && res.plan?.steps.some((s: any) => s.assertion === 'assert_url'),
    name: 'Question: "Does clicking \'Learn more\' navigate to iana.org?" -> click + assert_url',
  },
  {
    q: 'Are there any console errors on this page?',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.assertion === 'assert_console_no_errors'),
    name: 'Question: "Are there any console errors...?" -> assert_console_no_errors',
  },
  {
    q: 'Is the page mobile-friendly at 375x667?',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.options?.viewport?.width === 375),
    name: 'Question: "Is the page mobile-friendly...?" -> responsive mobile viewport plan',
  },
  {
    q: 'What is the page title?',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.assertion === 'assert_title'),
    name: 'Question: "What is the page title?" -> assert_title plan',
  },
  {
    q: 'Is there an H1 heading on the page?',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.target.includes('h1')),
    name: 'Question: "Is there an H1 heading...?" -> targets h1 heading',
  },
  {
    q: 'Check if the navbar is displayed',
    check: (res: any) => res.success && res.plan?.steps.some((s: any) => s.target.includes('nav')),
    name: 'Imperative: "Check if the navbar is displayed" -> targets navigation',
  },
  {
    q: 'Check. With a primary heading and a navigation bar, there is',
    check: (res: any) =>
      res.success &&
      res.plan?.steps.some((s: any) => s.target?.includes('h1')) &&
      res.plan?.steps.some((s: any) => s.target?.includes('nav')) &&
      res.plan?.steps.length >= 3,
    name: 'Compound: "Check. With a primary heading and a navigation bar, there is" -> extracts BOTH heading AND navigation assertions',
  },
  {
    q: "Verify page title contains 'Wikipedia', assert h1 heading is visible, and ensure zero console errors",
    check: (res: any) =>
      res.success &&
      res.plan?.steps.some((s: any) => s.assertion === 'assert_title') &&
      res.plan?.steps.some((s: any) => s.target?.includes('h1')) &&
      res.plan?.steps.some((s: any) => s.assertion === 'assert_console_no_errors'),
    name: 'Multi-command: "Verify title, h1 heading, and zero console errors" -> extracts all 3 assertions',
  },
  {
    q: "Click on 'About' link and verify url contains '/about'",
    check: (res: any) =>
      res.success &&
      res.plan?.steps.some((s: any) => s.action === 'click') &&
      res.plan?.steps.some((s: any) => s.assertion === 'assert_url'),
    name: 'Action + Assertion: "Click About and verify url /about" -> click + assert_url',
  },
  {
    q: "Check that button 'Submit' is disabled",
    check: (res: any) =>
      res.success &&
      res.plan?.steps.some((s: any) => s.assertion === 'assert_element_state' && s.value === 'disabled'),
    name: 'Element state: "Check that button Submit is disabled" -> assert_element_state disabled',
  },
];

let passed = 0;
for (const tc of testCases) {
  const result = generateTestPlan(tc.q, 'https://example.com');
  assert(tc.check(result), tc.name);
  passed++;
}

console.log(`\n✅ All ${passed}/${testCases.length} Question Variations Successfully Translated into Playwright Plans!`);
