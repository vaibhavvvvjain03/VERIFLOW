import { parseCommand } from '../src/features/commands/parseCommand';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('Testing Universal Website Command Parser:');

// 1. Page Title & Identity command
const cmd1 = parseCommand('Verify page title contains Example Domain', [], 'https://example.com');
assert(cmd1.action === 'execute_plan', '1. "Verify page title..." parsed as execute_plan');
assert(cmd1.plan !== undefined, '1. Contains plan object');
assert(cmd1.isValid === true, '1. isValid is true');

// 2. Primary Heading H1 command
const cmd2 = parseCommand('Check primary heading is visible', [], 'https://example.com');
assert(cmd2.action === 'execute_plan', '2. "Check primary heading..." parsed as execute_plan');
assert(cmd2.plan?.id === 'CMD-HEADING', '2. Maps to CMD-HEADING');

// 3. Navigation bar command
const cmd3 = parseCommand('Check navigation bar', [], 'https://news.ycombinator.com');
assert(cmd3.action === 'execute_plan', '3. "Check navigation bar" parsed as execute_plan');
assert(cmd3.plan?.id === 'CMD-NAV', '3. Maps to CMD-NAV');

// 4. Interactive Search command
const cmd4 = parseCommand('Test search flow with query Veriflow', [], 'https://en.wikipedia.org');
assert(cmd4.action === 'execute_plan', '4. "Test search flow..." parsed as execute_plan');
assert(cmd4.plan?.id === 'CMD-SEARCH', '4. Maps to CMD-SEARCH');

// 5. Zero Console Errors command
const cmd5 = parseCommand('Verify no console errors', [], 'https://httpbin.org');
assert(cmd5.action === 'execute_plan', '5. "Verify no console errors" parsed as execute_plan');
assert(cmd5.plan?.id === 'CMD-CONSOLE', '5. Maps to CMD-CONSOLE');

// 6. Mobile Viewport Layout command
const cmd6 = parseCommand('Validate mobile viewport layout', [], 'https://httpbin.org');
assert(cmd6.action === 'execute_plan', '6. "Validate mobile viewport..." parsed as execute_plan');
assert(cmd6.plan?.id === 'CMD-RESPONSIVE', '6. Maps to CMD-RESPONSIVE');

// 7. Navigation Link command
const cmd7 = parseCommand('Click link and assert URL', [], 'https://playwright.dev');
assert(cmd7.action === 'execute_plan', '7. "Click link..." parsed as execute_plan');
assert(cmd7.plan?.id === 'CMD-LINK', '7. Maps to CMD-LINK');

// 8. Export report command
const cmd8 = parseCommand('Export the test report.');
assert(cmd8.action === 'export_report', '8. "Export the test report." parsed as export_report');
assert(cmd8.isValid === true, '8. isValid is true for export report');

// 9. Unknown / Ambiguous command
const cmd9 = parseCommand('Deploy to production kubernetes cluster');
assert(cmd9.action === 'unknown', '9. Unknown command rejected');
assert(cmd9.isValid === false, '9. isValid is false for unknown command');
assert(cmd9.explanation.includes('Could not parse command'), '9. Explains without guessing');

console.log('\nAll Universal Commands and Test Scenarios Verified Successfully!');
