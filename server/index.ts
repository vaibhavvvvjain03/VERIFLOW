import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import {
  createAndStartRun,
  createAndStartPlanRun,
  getRun,
  validateTestIds,
} from './runManager';
import { validateTargetUrl } from './urlSecurity';
import { generateTestPlan } from '../src/features/commands/testPlanner';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve artifacts (screenshots, traces)
const RUNS_DIR = path.resolve(process.cwd(), 'runs');
app.use('/artifacts', express.static(RUNS_DIR));

// Production Static Frontend Serving
const DIST_DIR = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// In-Memory Demo Store Defect Injection Flags (for T02/T04 regression audits)
let demoConfig = {
  bugCartTotalWrong: false,
  bugInvalidEmailAccepted: false,
};

app.get('/api/demo/config', (_req, res) => {
  res.json(demoConfig);
});

app.post('/api/demo/config', (req, res) => {
  const { bugCartTotalWrong, bugInvalidEmailAccepted } = req.body || {};
  if (typeof bugCartTotalWrong === 'boolean') {
    demoConfig.bugCartTotalWrong = bugCartTotalWrong;
  }
  if (typeof bugInvalidEmailAccepted === 'boolean') {
    demoConfig.bugInvalidEmailAccepted = bugInvalidEmailAccepted;
  }
  res.json(demoConfig);
});

app.post('/api/demo/reset', (_req, res) => {
  demoConfig = {
    bugCartTotalWrong: false,
    bugInvalidEmailAccepted: false,
  };
  res.json({ status: 'ok', config: demoConfig });
});

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    distServed: fs.existsSync(DIST_DIR),
  });
});

// URL Safety Validation Endpoint
app.post('/api/validate-url', async (req, res) => {
  const { url, allowLocalFixture } = req.body;
  const result = await validateTargetUrl(url, Boolean(allowLocalFixture));
  return res.json(result);
});

// Test Plan Generator Endpoint
app.post('/api/plan', (req, res) => {
  const { prompt, targetUrl } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }
  const result = generateTestPlan(prompt, targetUrl || 'http://localhost:3000/demo-store');
  return res.json(result);
});

// Create and Start Test Run (Supports both user-defined TestPlan and legacy testIds)
app.post('/api/runs', async (req, res) => {
  const { testIds, plan, targetUrl, isLocalFixture } = req.body;

  // Case A: Structured Dynamic Test Plan
  if (plan) {
    const urlToTest = targetUrl || plan.targetUrl;
    const urlCheck = await validateTargetUrl(urlToTest, Boolean(isLocalFixture));
    if (!urlCheck.valid) {
      return res.status(400).json({ error: `URL safety rejection: ${urlCheck.error}` });
    }
    const run = createAndStartPlanRun(plan, urlCheck.normalizedUrl, Boolean(isLocalFixture));
    return res.status(201).json(run);
  }

  // Case B: Regression Suite / Selected Hardcoded Test IDs
  if (testIds) {
    const validation = validateTestIds(testIds);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    const run = createAndStartRun(validation.validated);
    return res.status(201).json(run);
  }

  return res.status(400).json({
    error: 'Payload must contain either "plan" (TestPlan) or non-empty "testIds" array',
  });
});

// Get Test Run Status and Results
app.get('/api/runs/:runId', (req, res) => {
  const { runId } = req.params;
  const run = getRun(runId);

  if (!run) {
    return res.status(404).json({ error: `Run "${runId}" not found` });
  }

  return res.json(run);
});

// Honest Headless Preview Endpoint (PRE-001 through PRE-007)
app.get('/api/runs/:runId/preview', (req, res) => {
  const { runId } = req.params;
  const run = getRun(runId);

  if (!run) {
    return res.status(404).json({ error: `Run "${runId}" not found` });
  }

  const primaryTestId = run.testIds[0];
  const primaryResult = run.results[primaryTestId];

  return res.json({
    runId: run.runId,
    status: run.status,
    targetUrl: run.targetUrl,
    latestPreviewUrl: run.latestPreviewUrl || null,
    previewFrames: run.previewFrames || [],
    currentStep: primaryResult?.steps?.slice(-1)[0] || null,
    totalSteps: run.plan?.steps?.length || primaryResult?.steps?.length || 0,
    timestamp: new Date().toISOString(),
  });
});

// SPA Catch-All Fallback (Serves index.html for React routes like /workspace and /demo-store)
if (fs.existsSync(DIST_DIR)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/artifacts')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Veriflow Unified Web Platform listening on http://0.0.0.0:${PORT}`);
});
