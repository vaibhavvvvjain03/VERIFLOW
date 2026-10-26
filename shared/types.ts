export type TestId = 'T01' | 'T02' | 'T03' | 'T04' | 'T05' | 'T06' | string;

export const ALLOWED_TEST_IDS: string[] = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06'];

export type RunStatus = 'idle' | 'queued' | 'running' | 'passed' | 'failed' | 'error';
export type TestStatus = 'pending' | 'queued' | 'running' | 'passed' | 'failed' | 'skipped' | 'infrastructure_error';

export type ActionType =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'select'
  | 'scroll'
  | 'press'
  | 'wait';

export type AssertionType =
  | 'assert_visible'
  | 'assert_text'
  | 'assert_url'
  | 'assert_count'
  | 'assert_title'
  | 'assert_field_value'
  | 'assert_element_state'
  | 'assert_console_no_errors';

export interface PlanStep {
  id: string;
  type: 'action' | 'assertion';
  action?: ActionType;
  assertion?: AssertionType;
  target?: string;
  value?: string;
  description: string;
  expectedOutcome?: string;
  options?: {
    timeoutMs?: number;
    contains?: boolean;
    exact?: boolean;
    direction?: 'down' | 'up';
    amount?: number;
    viewport?: { width: number; height: number };
  };
}

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  targetUrl: string;
  steps: PlanStep[];
  createdAt: string;
  estimatedDurationMs?: number;
  requiresConfirmation?: boolean;
  warning?: string;
  ambiguityFlag?: string;
}

export interface PreviewFrame {
  timestamp: string;
  stepIndex: number;
  stepLabel: string;
  imageUrl: string;
}

export interface StepEvent {
  stepId: string;
  testId: TestId;
  label: string;
  status: 'passed' | 'failed' | 'running' | 'skipped';
  durationMs: number;
  assertionDiff?: {
    expected: string | number | boolean;
    actual: string | number | boolean;
  };
  error?: string;
  timestamp: string;
}

export interface TestResult {
  testId: TestId;
  name: string;
  description: string;
  tag: string;
  status: TestStatus;
  durationMs: number;
  steps: StepEvent[];
  error?: string;
  screenshotUrl?: string;
}

export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
}

export interface RunRecord {
  runId: string;
  status: RunStatus;
  testIds: TestId[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  summary: RunSummary;
  results: Record<string, TestResult>;
  targetUrl: string;
  executionMode: string;
  browserInstance: string;
  plan?: TestPlan;
  previewFrames?: PreviewFrame[];
  latestPreviewUrl?: string;
  warnings?: string[];
}

export interface UniversalTestTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Identity' | 'Structure' | 'Navigation' | 'Interactivity' | 'Health' | 'Responsive' | 'Links';
  promptTemplate: string;
  defaultAssertion: string;
}

export const UNIVERSAL_COMMANDS: UniversalTestTemplate[] = [
  {
    id: 'CMD-TITLE',
    name: 'Page Title & Identity',
    description: 'Verify page document title matches website identity or brand.',
    category: 'Identity',
    promptTemplate: 'Verify page title contains {title}',
    defaultAssertion: 'Document title matches target brand name',
  },
  {
    id: 'CMD-HEADING',
    name: 'Primary Heading (H1)',
    description: 'Verify top-level hero heading or main landmark is visible.',
    category: 'Structure',
    promptTemplate: 'Verify primary heading is visible',
    defaultAssertion: 'Main H1 or primary page title is rendered in viewport',
  },
  {
    id: 'CMD-NAV',
    name: 'Header & Navigation Bar',
    description: 'Verify top-level navigation container and brand logo are visible.',
    category: 'Navigation',
    promptTemplate: 'Verify navigation bar is visible',
    defaultAssertion: 'Header, navbar, or primary navigation menu is accessible',
  },
  {
    id: 'CMD-SEARCH',
    name: 'Search & Query Flow',
    description: 'Find search input, enter search query, submit, and verify response.',
    category: 'Interactivity',
    promptTemplate: 'Search for "{query}" and verify results',
    defaultAssertion: 'Search query is accepted and results or query appears',
  },
  {
    id: 'CMD-CONSOLE',
    name: 'Zero Console Errors',
    description: 'Verify page loads cleanly with 0 uncaught JavaScript runtime errors.',
    category: 'Health',
    promptTemplate: 'Verify no console errors',
    defaultAssertion: 'Browser console log has zero unhandled exceptions',
  },
  {
    id: 'CMD-RESPONSIVE',
    name: 'Mobile Viewport Layout',
    description: 'Emulate mobile device viewport (375×667) and scroll content.',
    category: 'Responsive',
    promptTemplate: 'Test responsive layout at mobile viewport 375x667',
    defaultAssertion: 'Layout adapts gracefully to 375×667 mobile viewport',
  },
  {
    id: 'CMD-LINK',
    name: 'Link Navigation & URL Transition',
    description: 'Click key navigation link or action and assert destination URL transition.',
    category: 'Links',
    promptTemplate: 'Click "{link}" and verify URL',
    defaultAssertion: 'Browser navigates to expected URL or section',
  },
];

export interface TestCatalogItem {
  id: string;
  name: string;
  description: string;
  tag: string;
  expectedBehavior: string;
}

export const TEST_CATALOG: TestCatalogItem[] = UNIVERSAL_COMMANDS.map((cmd) => ({
  id: cmd.id,
  name: cmd.name,
  description: cmd.description,
  tag: cmd.category,
  expectedBehavior: cmd.defaultAssertion,
}));

export interface ParsedCommand {
  raw: string;
  action: 'execute_plan' | 'export_report' | 'open_evidence' | 'unknown';
  testIds: TestId[];
  targetTestId?: TestId;
  explanation: string;
  isValid: boolean;
  plan?: TestPlan;
  warning?: string;
}
