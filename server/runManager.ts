import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import {
  TestId,
  ALLOWED_TEST_IDS,
  RunRecord,
  TestResult,
  StepEvent,
  TEST_CATALOG,
  TestStatus,
  TestPlan,
} from '../shared/types';
import { executeDynamicPlan } from './dynamicRunner';

interface InternalRunRecord extends RunRecord {
  outputPath: string;
}

const runsStore = new Map<string, InternalRunRecord>();
let activeChildProcess: ReturnType<typeof spawn> | null = null;

const RUNS_DIR = path.resolve(process.cwd(), 'runs');
if (!fs.existsSync(RUNS_DIR)) {
  fs.mkdirSync(RUNS_DIR, { recursive: true });
}

export function validateTestIds(ids: string[]): { valid: boolean; validated: TestId[]; error?: string } {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { valid: false, validated: [], error: 'Payload must contain non-empty array of testIds' };
  }
  const deduplicated = Array.from(new Set(ids));
  const validated: TestId[] = [];
  for (const id of deduplicated) {
    if (!ALLOWED_TEST_IDS.includes(id as TestId)) {
      return { valid: false, validated: [], error: `Invalid testId "${id}". Allowed: ${ALLOWED_TEST_IDS.join(', ')}` };
    }
    validated.push(id as TestId);
  }
  return { valid: true, validated };
}

export function getRun(runId: string): RunRecord | null {
  const run = runsStore.get(runId);
  if (!run) return null;
  return run;
}

export function createAndStartRun(testIds: TestId[]): RunRecord {
  // If an active run is in progress, cancel or wait
  if (activeChildProcess) {
    try {
      activeChildProcess.kill();
    } catch {
      // ignore
    }
    activeChildProcess = null;
  }

  const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const runDir = path.join(RUNS_DIR, runId);
  const artifactsDir = path.join(runDir, 'artifacts');
  fs.mkdirSync(artifactsDir, { recursive: true });

  const outputFile = path.join(runDir, 'results.json');

  const initialResults: Record<TestId, TestResult> = {} as Record<TestId, TestResult>;
  for (const tid of ALLOWED_TEST_IDS) {
    const catalogItem = TEST_CATALOG.find((t) => t.id === tid);
    const isTargeted = testIds.includes(tid);
    initialResults[tid] = {
      testId: tid,
      name: catalogItem?.name || tid,
      description: catalogItem?.description || '',
      tag: catalogItem?.tag || 'General',
      status: isTargeted ? 'queued' : 'pending',
      durationMs: 0,
      steps: [],
    };
  }

  const runRecord: InternalRunRecord = {
    runId,
    status: 'queued',
    testIds,
    createdAt: new Date().toISOString(),
    summary: {
      total: testIds.length,
      passed: 0,
      failed: 0,
      durationMs: 0,
    },
    results: initialResults,
    targetUrl: process.env.BASE_URL
      ? `${process.env.BASE_URL}/demo-store`
      : `http://localhost:${process.env.PORT || 3000}/demo-store`,
    executionMode: 'Isolated Headless Automation Context',
    browserInstance: 'Playwright Headless Chromium (Separate Node Subprocess)',
    outputPath: outputFile,
  };

  runsStore.set(runId, runRecord);

  // Build strict regex pattern for selected test IDs
  // E.g. \[(T01|T02)\]
  const grepPattern = `\\[(${testIds.join('|')})\\]`;

  runRecord.status = 'running';
  runRecord.startedAt = new Date().toISOString();

  // Mark selected tests as running with initial queue step
  for (const tid of testIds) {
    runRecord.results[tid].status = 'running';
    runRecord.results[tid].steps = [
      {
        stepId: `step-${Date.now()}-${tid}-init`,
        testId: tid,
        label: `Spawned Playwright Chromium instance for [${tid}]`,
        status: 'running',
        durationMs: 0,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  // Execute Playwright directly via node cli
  const cliPath = path.resolve(process.cwd(), 'node_modules', '@playwright', 'test', 'cli.js');
  const args = [
    cliPath,
    'test',
    '-g',
    grepPattern,
    '--reporter=json',
  ];

  const startTime = Date.now();
  let stdoutData = '';
  let stderrData = '';

  const activePort = process.env.PORT || 3000;
  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      CI: '1',
      PORT: String(activePort),
      BASE_URL: process.env.BASE_URL || `http://localhost:${activePort}`,
    },
    shell: false,
  });

  activeChildProcess = child;

  child.stdout.on('data', (chunk) => {
    stdoutData += chunk.toString();
  });

  child.stderr.on('data', (chunk) => {
    stderrData += chunk.toString();
  });

  child.on('error', (err) => {
    activeChildProcess = null;
    console.error('Playwright process spawn error:', err);
    handleRunFailure(runRecord, null, `Spawn error: ${err.message}`, 'infrastructure_error');
  });

  child.on('close', (exitCode) => {
    activeChildProcess = null;
    const durationMs = Date.now() - startTime;
    runRecord.completedAt = new Date().toISOString();
    runRecord.summary.durationMs = durationMs;

    let parsedSuccessfully = false;

    try {
      // Find JSON object from stdout
      const jsonStart = stdoutData.indexOf('{');
      const jsonEnd = stdoutData.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = stdoutData.substring(jsonStart, jsonEnd + 1);
        fs.writeFileSync(outputFile, jsonStr);
        const parsedReport = JSON.parse(jsonStr);
        parsePlaywrightReport(parsedReport, runRecord, artifactsDir, runId);
        parsedSuccessfully = true;
      } else {
        handleRunFailure(runRecord, exitCode, stderrData || stdoutData || 'No JSON test report output produced', 'infrastructure_error');
      }
    } catch (err: unknown) {
      console.error('Failed to parse Playwright report:', err);
      handleRunFailure(runRecord, exitCode, stderrData || String(err), 'infrastructure_error');
    }

    // Source of Truth Reconciliation:
    // Any requested test that never finished running must NOT remain "running" or falsely pass
    for (const tid of runRecord.testIds) {
      const res = runRecord.results[tid];
      if (res.status === 'running' || res.status === 'queued') {
        if (exitCode === 0 && parsedSuccessfully) {
          res.status = 'skipped';
          res.error = 'Test was skipped or not executed by the runner';
        } else {
          res.status = 'infrastructure_error';
          res.error = `Playwright process terminated unexpectedly (exit code ${exitCode}). ${stderrData || ''}`.trim();
        }
      }
    }

    // Finalize summary counts
    let passedCount = 0;
    let failedCount = 0;
    let infraErrorCount = 0;
    let skippedCount = 0;

    for (const tid of testIds) {
      const res = runRecord.results[tid];
      if (res.status === 'passed') passedCount++;
      else if (res.status === 'failed') failedCount++;
      else if (res.status === 'infrastructure_error') infraErrorCount++;
      else if (res.status === 'skipped') skippedCount++;
    }

    runRecord.summary.passed = passedCount;
    runRecord.summary.failed = failedCount + infraErrorCount;

    // Strict Source of Truth Rule:
    // A run is 'passed' ONLY if exitCode === 0 AND every requested test passed.
    if (exitCode === 0 && passedCount === testIds.length) {
      runRecord.status = 'passed';
    } else if (infraErrorCount > 0 && failedCount === 0 && passedCount === 0) {
      runRecord.status = 'error';
    } else {
      runRecord.status = 'failed';
    }
  });

  return runRecord;
}

function collectSpecs(suite: any): any[] {
  let specs: any[] = [];
  if (Array.isArray(suite.specs)) {
    specs = specs.concat(suite.specs);
  }
  if (Array.isArray(suite.suites)) {
    for (const childSuite of suite.suites) {
      specs = specs.concat(collectSpecs(childSuite));
    }
  }
  return specs;
}

function parsePlaywrightReport(
  report: any,
  runRecord: InternalRunRecord,
  artifactsDir: string,
  runId: string
) {
  let specs: any[] = [];
  if (Array.isArray(report.suites)) {
    for (const s of report.suites) {
      specs = specs.concat(collectSpecs(s));
    }
  }

  for (const spec of specs) {
    const title: string = spec.title || '';
    const match = title.match(/\[(T0\d)\]/);
    if (!match) continue;
    const testId = match[1] as TestId;

    // Only process tests that were requested in this run
    if (!runRecord.testIds.includes(testId)) continue;

    const testExecution = spec.tests?.[0];
    const testResult = testExecution?.results?.[0];

    let status: TestStatus = 'failed';
    if (testResult?.status === 'passed') {
      status = 'passed';
    } else if (testResult?.status === 'skipped') {
      status = 'skipped';
    } else if (testResult?.status === 'timedOut') {
      status = 'failed';
    } else if (testResult?.status === 'interrupted') {
      status = 'infrastructure_error';
    } else {
      status = 'failed';
    }

    const duration = testResult?.duration || 0;
    const steps: StepEvent[] = [];

    let errorMessage = testResult?.error?.message;
    if (errorMessage) {
      errorMessage = errorMessage.replace(/\u001b\[[0-9;]*m/g, '');
    }

    // Extract assertion diff if present in error message
    let globalDiff: { expected: string; actual: string } | undefined;
    if (errorMessage) {
      const expMatch = errorMessage.match(/Expected:\s*([^\n\r]+)/);
      const recMatch = errorMessage.match(/Received:\s*([^\n\r]+)/);
      if (expMatch && recMatch) {
        globalDiff = {
          expected: expMatch[1].trim().replace(/^"|"$/g, ''),
          actual: recMatch[1].trim().replace(/^"|"$/g, ''),
        };
      }
    }

    // Extract step telemetry from testResult.steps
    if (Array.isArray(testResult?.steps)) {
      for (let i = 0; i < testResult.steps.length; i++) {
        const s = testResult.steps[i];
        let stepError = s.error?.message;
        let stepDiff = undefined;

        if (stepError) {
          stepError = stepError.replace(/\u001b\[[0-9;]*m/g, '');
          const expMatch = stepError.match(/Expected:\s*([^\n\r]+)/);
          const recMatch = stepError.match(/Received:\s*([^\n\r]+)/);
          if (expMatch && recMatch) {
            stepDiff = {
              expected: expMatch[1].trim().replace(/^"|"$/g, ''),
              actual: recMatch[1].trim().replace(/^"|"$/g, ''),
            };
          } else if (globalDiff) {
            stepDiff = globalDiff;
          }
        }

        steps.push({
          stepId: `step-${testId}-${i}`,
          testId,
          label: s.title || `Step ${i + 1}`,
          status: s.error ? 'failed' : 'passed',
          durationMs: s.duration || 0,
          assertionDiff: stepDiff,
          error: stepError,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Fallback step if testResult had no sub-steps
    if (steps.length === 0) {
      steps.push({
        stepId: `step-${testId}-final`,
        testId,
        label: `Executed test scenario: ${title}`,
        status: status === 'passed' ? 'passed' : 'failed',
        durationMs: duration,
        assertionDiff: globalDiff,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }

    let screenshotUrl: string | undefined;

    // Check for screenshot attachments on failure
    if (Array.isArray(testResult?.attachments)) {
      for (const att of testResult.attachments) {
        if (att.name === 'screenshot' && att.path && fs.existsSync(att.path)) {
          const destName = `${testId}-failure.png`;
          const destPath = path.join(artifactsDir, destName);
          fs.copyFileSync(att.path, destPath);
          screenshotUrl = `/artifacts/${runId}/${destName}`;
        }
      }
    }

    runRecord.results[testId] = {
      testId,
      name: title,
      description: runRecord.results[testId]?.description || '',
      tag: runRecord.results[testId]?.tag || 'General',
      status,
      durationMs: duration,
      steps,
      error: errorMessage,
      screenshotUrl,
    };
  }
}

function handleRunFailure(
  runRecord: InternalRunRecord,
  exitCode: number | null,
  errorMsg: string,
  targetStatus: TestStatus = 'infrastructure_error'
) {
  for (const tid of runRecord.testIds) {
    if (runRecord.results[tid].status === 'running' || runRecord.results[tid].status === 'queued') {
      runRecord.results[tid].status = targetStatus;
      runRecord.results[tid].error = errorMsg || `Runner exited with code ${exitCode}`;
      runRecord.results[tid].steps.push({
        stepId: `step-${tid}-err`,
        testId: tid,
        label: `Execution failed: ${errorMsg.substring(0, 100)}`,
        status: 'failed',
        durationMs: 0,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export function createAndStartPlanRun(
  plan: TestPlan,
  targetUrl?: string,
  isLocalFixture: boolean = false
): RunRecord {
  if (activeChildProcess) {
    try {
      activeChildProcess.kill();
    } catch {
      // ignore
    }
    activeChildProcess = null;
  }

  const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const runDir = path.join(RUNS_DIR, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const resolvedTargetUrl = targetUrl || plan.targetUrl;
  const initialRun: InternalRunRecord = {
    runId,
    status: 'queued',
    testIds: [plan.id],
    createdAt: new Date().toISOString(),
    summary: {
      total: 1,
      passed: 0,
      failed: 0,
      durationMs: 0,
    },
    results: {
      [plan.id]: {
        testId: plan.id,
        name: plan.name,
        description: plan.description,
        tag: 'Custom Plan',
        status: 'queued',
        durationMs: 0,
        steps: [],
      },
    },
    targetUrl: resolvedTargetUrl,
    executionMode: 'Isolated Headless Automation Context',
    browserInstance: 'Playwright Headless Chromium (Dynamic Plan Engine)',
    plan,
    outputPath: path.join(runDir, 'results.json'),
    previewFrames: [],
    warnings: plan.warning ? [plan.warning] : [],
  };

  runsStore.set(runId, initialRun);

  // Trigger dynamic execution
  executeDynamicPlan({
    runId,
    plan: { ...plan, targetUrl: resolvedTargetUrl },
    runDir,
    isLocalFixture,
    onUpdate: (updatedRecord) => {
      const existing = runsStore.get(runId);
      runsStore.set(runId, {
        ...(existing || initialRun),
        ...updatedRecord,
        outputPath: initialRun.outputPath,
      });
    },
  }).catch((err) => {
    const existing = runsStore.get(runId);
    if (existing) {
      existing.status = 'error';
      existing.results[plan.id].status = 'infrastructure_error';
      existing.results[plan.id].error = err.message || 'Fatal execution error';
      runsStore.set(runId, existing);
    }
  });

  return initialRun;
}
