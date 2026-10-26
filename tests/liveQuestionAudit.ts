import { generateTestPlan } from '../src/features/commands/testPlanner';

async function testLiveQuestion() {
  const targetUrl = 'https://example.com';
  const question = 'Does the page contain "documentation examples"?';

  console.log(`Testing Live Natural Question: "${question}" on ${targetUrl}`);
  const planResult = generateTestPlan(question, targetUrl);
  if (!planResult.success || !planResult.plan) {
    throw new Error('Failed to parse question into plan');
  }

  const res = await fetch('http://localhost:3001/api/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan: planResult.plan,
      targetUrl,
    }),
  });

  const { runId } = await res.json();
  console.log(`Run started with ID: ${runId}. Polling execution...`);

  let completedRun: any = null;
  const start = Date.now();
  while (Date.now() - start < 15000) {
    await new Promise((r) => setTimeout(r, 600));
    const poll = await fetch(`http://localhost:3001/api/runs/${runId}`);
    const data = await poll.json();
    if (data.status === 'passed' || data.status === 'failed' || data.status === 'error') {
      completedRun = data;
      break;
    }
  }

  if (!completedRun) throw new Error('Run timed out');

  console.log(`\nStatus: ${completedRun.status.toUpperCase()} (${completedRun.summary?.durationMs}ms)`);
  console.log(`Steps executed: ${completedRun.results[planResult.plan.id]?.steps.length}`);
  completedRun.results[planResult.plan.id]?.steps.forEach((s: any, idx: number) => {
    console.log(`  ✓ Step ${idx + 1}: ${s.label} (${s.durationMs}ms)`);
  });

  if (completedRun.status !== 'passed') {
    throw new Error(`Test expected to pass but got ${completedRun.status}`);
  }

  console.log('\n🎉 Real Chromium browser genuinely validated the question and proved it passes!');
}

testLiveQuestion().catch((err) => {
  console.error('Failure:', err);
  process.exit(1);
});
