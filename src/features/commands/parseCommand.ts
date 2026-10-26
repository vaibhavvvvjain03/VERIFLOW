import { ParsedCommand, TestId } from '../../../shared/types';
import { generateTestPlan } from './testPlanner';
import { createUniversalPlan } from './universalPlans';

/**
 * Deterministic allowlist command parser for Wispr Flow dictation and text input.
 * Strictly universal testing across all websites, zero demo-store remnants.
 */
export function parseCommand(
  rawInput: string,
  _currentFailedTestIds: TestId[] = [],
  targetUrl: string = 'https://example.com'
): ParsedCommand {
  const normalized = rawInput
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return {
      raw: rawInput,
      action: 'unknown',
      testIds: [],
      explanation: 'Focus the command bar and speak or type a supported universal testing command.',
      isValid: false,
    };
  }

  // 1. Export Report
  if (
    normalized.includes('export') &&
    (normalized.includes('report') || normalized.includes('test') || normalized.includes('result') || normalized.includes('markdown') || normalized.includes('json'))
  ) {
    return {
      raw: rawInput,
      action: 'export_report',
      testIds: [],
      explanation: 'Exporting test run report (JSON and Markdown formats).',
      isValid: true,
    };
  }

  // 2. Open Evidence / Inspect
  if (normalized.includes('open') || normalized.includes('show') || normalized.includes('view') || normalized.includes('inspect')) {
    if (normalized.includes('evidence') || normalized.includes('step') || normalized.includes('screenshot') || normalized.includes('detail') || normalized.includes('proof')) {
      return {
        raw: rawInput,
        action: 'open_evidence',
        testIds: [],
        explanation: 'Opening evidence inspector for the current execution.',
        isValid: true,
      };
    }
  }

  // 3. Direct Universal Template Match by ID or Name (for single non-compound inputs or chip clicks)
  const isCompound =
    rawInput.includes('.') ||
    rawInput.includes(';') ||
    /\b(and|then|with|also|as\s+well\s+as)\b/i.test(rawInput) ||
    rawInput.includes(',');

  let matchedUniversalId: string | null = null;
  const directId = rawInput.trim().toUpperCase();

  if (['CMD-TITLE', 'CMD-HEADING', 'CMD-NAV', 'CMD-SEARCH', 'CMD-CONSOLE', 'CMD-RESPONSIVE', 'CMD-LINK'].includes(directId)) {
    matchedUniversalId = directId;
  } else if (!isCompound) {
    if (
      normalized === 'cmd-title' ||
      normalized === 'page title' ||
      normalized === 'test title' ||
      normalized === 'verify page title' ||
      normalized === 'check page title'
    ) {
      matchedUniversalId = 'CMD-TITLE';
    } else if (
      normalized === 'cmd-heading' ||
      normalized === 'h1' ||
      normalized === 'primary heading' ||
      normalized === 'header heading' ||
      normalized === 'verify heading'
    ) {
      matchedUniversalId = 'CMD-HEADING';
    } else if (
      normalized === 'cmd-nav' ||
      normalized === 'nav bar' ||
      normalized === 'navigation bar' ||
      normalized === 'header menu' ||
      normalized === 'verify navbar'
    ) {
      matchedUniversalId = 'CMD-NAV';
    } else if (
      normalized === 'cmd-search' ||
      normalized === 'search flow' ||
      normalized === 'test search' ||
      normalized === 'query flow'
    ) {
      matchedUniversalId = 'CMD-SEARCH';
    } else if (
      normalized === 'cmd-console' ||
      normalized === 'console error' ||
      normalized === 'runtime error' ||
      normalized === 'zero errors' ||
      normalized === 'check console errors'
    ) {
      matchedUniversalId = 'CMD-CONSOLE';
    } else if (
      normalized === 'cmd-responsive' ||
      normalized === 'mobile viewport' ||
      normalized === 'mobile view' ||
      normalized === 'responsive test'
    ) {
      matchedUniversalId = 'CMD-RESPONSIVE';
    } else if (
      normalized === 'cmd-link' ||
      normalized === 'navigation link' ||
      normalized === 'click link' ||
      normalized === 'test link'
    ) {
      matchedUniversalId = 'CMD-LINK';
    }
  }

  if (matchedUniversalId) {
    const plan = createUniversalPlan(matchedUniversalId, targetUrl);
    if (plan) {
      return {
        raw: rawInput,
        action: 'execute_plan',
        testIds: [plan.id],
        plan,
        explanation: `Universal Command: ${plan.name} on ${targetUrl} (${plan.steps.length} steps: ${plan.steps.map((s) => s.description).join(' → ')})`,
        isValid: true,
      };
    }
  }

  // 4. Natural Language / Wispr Flow Test Planning
  const planResult = generateTestPlan(rawInput, targetUrl);

  if (planResult.success && planResult.plan) {
    return {
      raw: rawInput,
      action: 'execute_plan',
      testIds: [planResult.plan.id],
      plan: planResult.plan,
      explanation: `Proposed Plan: ${planResult.plan.name} (${planResult.plan.steps.length} steps: ${planResult.plan.steps.map((s) => s.description).join(' → ')})`,
      warning: planResult.warning,
      isValid: true,
    };
  }

  if (planResult.clarificationRequired) {
    return {
      raw: rawInput,
      action: 'unknown',
      testIds: [],
      explanation: `Could not parse command "${rawInput}". ${planResult.clarificationRequired}`,
      isValid: false,
    };
  }

  return {
    raw: rawInput,
    action: 'unknown',
    testIds: [],
    explanation: planResult.error
      ? `Could not parse command "${rawInput}". ${planResult.error}`
      : `Could not parse command "${rawInput}". Speak or type a universal test (e.g. "Verify page title", "Check console errors", "Validate mobile layout").`,
    isValid: false,
  };
}
