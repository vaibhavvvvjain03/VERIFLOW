import { TestId, RunRecord, TestPlan } from '../../../shared/types';
import { UrlValidationResult } from '../../../server/urlSecurity';
import { PlanGenerationResult } from '../commands/testPlanner';

const API_BASE = typeof window !== 'undefined' ? '' : 'http://localhost:3001';

export async function createRun(testIds: TestId[]): Promise<RunRecord> {
  const res = await fetch(`${API_BASE}/api/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testIds }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to create run: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createPlanRun(
  plan: TestPlan,
  targetUrl?: string
): Promise<RunRecord> {
  const res = await fetch(`${API_BASE}/api/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, targetUrl }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to start plan run: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchRun(runId: string): Promise<RunRecord> {
  const res = await fetch(`${API_BASE}/api/runs/${runId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch run "${runId}": HTTP ${res.status}`);
  }
  return res.json();
}

export async function validateTargetUrlApi(
  url: string
): Promise<UrlValidationResult> {
  const res = await fetch(`${API_BASE}/api/validate-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, allowLocalFixture: false }),
  });
  if (!res.ok) {
    throw new Error(`URL validation request failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function generatePlanApi(
  prompt: string,
  targetUrl: string
): Promise<PlanGenerationResult> {
  const res = await fetch(`${API_BASE}/api/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, targetUrl }),
  });
  if (!res.ok) {
    throw new Error(`Test planning request failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchRunPreview(runId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/runs/${runId}/preview`);
  if (!res.ok) {
    throw new Error(`Failed to fetch preview for "${runId}": HTTP ${res.status}`);
  }
  return res.json();
}
