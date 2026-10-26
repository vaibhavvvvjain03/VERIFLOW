const fs = require('fs');

async function main() {
  console.log('=== VERIFLOW QA AUDITOR & PLAYWRIGHT TEST INFRASTRUCTURE VERIFICATION ===\n');

  // Test 0: Invalid Test ID Validation
  console.log('--- TEST 0: Invalid Test ID Rejection ---');
  const invRes = await fetch('http://localhost:3001/api/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testIds: ['INVALID_T99'] }),
  });
  console.log(`Status Code: ${invRes.status}`);
  const invBody = await invRes.json();
  console.log(`Response:`, invBody);
  if (invRes.status !== 400 || !invBody.error) {
    throw new Error('FAILED: Invalid test ID was not rejected with 400!');
  }
  console.log('✓ PASS: Invalid test ID correctly rejected with 400 and explanation.\n');

  // Helper to run tests and poll
  async function executeRun(testIds) {
    const postRes = await fetch('http://localhost:3001/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testIds }),
    });
    if (!postRes.ok) {
      const err = await postRes.text();
      throw new Error(`Failed to create run: ${err}`);
    }
    const initial = await postRes.json();
    const runId = initial.runId;

    // Poll until complete
    let run = initial;
    const start = Date.now();
    while (run.status === 'queued' || run.status === 'running') {
      await new Promise((r) => setTimeout(r, 600));
      const getRes = await fetch(`http://localhost:3001/api/runs/${runId}`);
      run = await getRes.json();
      if (Date.now() - start > 60000) {
        throw new Error(`Timeout polling run ${runId}`);
      }
    }
    return run;
  }

  // Helper to set defect config
  async function setConfig(cfg) {
    const res = await fetch('http://localhost:3001/api/demo/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    return res.json();
  }

  // Helper to reset demo store
  async function resetDemo() {
    const res = await fetch('http://localhost:3001/api/demo/reset', { method: 'POST' });
    return res.json();
  }

  await resetDemo();

  // Test 1: Run T01 through T06 individually
  console.log('--- TEST 1: Running T01 through T06 Individually ---');
  for (const tid of ['T01', 'T02', 'T03', 'T04', 'T05', 'T06']) {
    console.log(`Starting run for [${tid}]...`);
    const run = await executeRun([tid]);
    const res = run.results[tid];
    console.log(`[${tid}] Result: status=${res.status}, duration=${res.durationMs}ms, steps=${res.steps.length}`);
    for (const s of res.steps) {
      console.log(`   - ${s.label} (${s.durationMs}ms) [${s.status}]`);
    }
    if (run.status !== 'passed' || res.status !== 'passed') {
      throw new Error(`FAILED: ${tid} did not pass! Run status: ${run.status}`);
    }
    console.log(`✓ [${tid}] Passed with ${res.steps.length} verified steps.\n`);
  }

  // Test 2: Run all six tests together
  console.log('--- TEST 2: Running All Six Tests (T01-T06) Suite ---');
  const allRun = await executeRun(['T01', 'T02', 'T03', 'T04', 'T05', 'T06']);
  console.log(`All Suite Result: status=${allRun.status}, summary=passed:${allRun.summary.passed}, failed:${allRun.summary.failed}, duration=${allRun.summary.durationMs}ms`);
  if (allRun.status !== 'passed' || allRun.summary.passed !== 6 || allRun.summary.failed !== 0) {
    throw new Error('FAILED: Full suite did not pass all 6 tests!');
  }
  console.log('✓ PASS: All 6 tests passed deterministically.\n');

  // Test 3: Activate BUG_CART_TOTAL_WRONG -> Run T02 (MUST FAIL)
  console.log('--- TEST 3: Activate BUG_CART_TOTAL_WRONG -> Run T02 ---');
  await setConfig({ bugCartTotalWrong: true });
  console.log('Defect BUG_CART_TOTAL_WRONG activated.');
  const bugCartRun = await executeRun(['T02']);
  console.log(`T02 with Bug Result: runStatus=${bugCartRun.status}, testStatus=${bugCartRun.results.T02.status}`);
  console.log(`Assertion error:`, bugCartRun.results.T02.error);
  console.log(`Assertion diff:`, bugCartRun.results.T02.steps.find((s) => s.assertionDiff)?.assertionDiff);
  console.log(`Screenshot URL:`, bugCartRun.results.T02.screenshotUrl);

  if (bugCartRun.status !== 'failed' || bugCartRun.results.T02.status !== 'failed') {
    throw new Error('FAILED: T02 did not fail when BUG_CART_TOTAL_WRONG was active!');
  }
  if (!bugCartRun.results.T02.screenshotUrl) {
    throw new Error('FAILED: Failure screenshot was not captured!');
  }
  console.log('✓ PASS: T02 failed genuinely on subtotal assertion with screenshot artifact.\n');

  // Test 4: Reset Defect -> Rerun T02 (MUST PASS)
  console.log('--- TEST 4: Reset Defect -> Rerun T02 ---');
  await resetDemo();
  const cleanCartRun = await executeRun(['T02']);
  console.log(`T02 after reset: runStatus=${cleanCartRun.status}, testStatus=${cleanCartRun.results.T02.status}`);
  if (cleanCartRun.status !== 'passed' || cleanCartRun.results.T02.status !== 'passed') {
    throw new Error('FAILED: T02 did not pass after reset!');
  }
  console.log('✓ PASS: T02 passed after resetting defect.\n');

  // Test 5: Activate BUG_INVALID_EMAIL_ACCEPTED -> Run T04 (MUST FAIL)
  console.log('--- TEST 5: Activate BUG_INVALID_EMAIL_ACCEPTED -> Run T04 ---');
  await setConfig({ bugInvalidEmailAccepted: true });
  console.log('Defect BUG_INVALID_EMAIL_ACCEPTED activated.');
  const bugEmailRun = await executeRun(['T04']);
  console.log(`T04 with Bug Result: runStatus=${bugEmailRun.status}, testStatus=${bugEmailRun.results.T04.status}`);
  console.log(`Assertion error:`, bugEmailRun.results.T04.error);
  console.log(`Screenshot URL:`, bugEmailRun.results.T04.screenshotUrl);

  if (bugEmailRun.status !== 'failed' || bugEmailRun.results.T04.status !== 'failed') {
    throw new Error('FAILED: T04 did not fail when BUG_INVALID_EMAIL_ACCEPTED was active!');
  }
  if (!bugEmailRun.results.T04.screenshotUrl) {
    throw new Error('FAILED: Failure screenshot was not captured for email defect!');
  }
  console.log('✓ PASS: T04 failed genuinely on email validation with screenshot artifact.\n');

  // Test 6: Reset Defect -> Rerun T04 (MUST PASS)
  console.log('--- TEST 6: Reset Defect -> Rerun T04 ---');
  await resetDemo();
  const cleanEmailRun = await executeRun(['T04']);
  console.log(`T04 after reset: runStatus=${cleanEmailRun.status}, testStatus=${cleanEmailRun.results.T04.status}`);
  if (cleanEmailRun.status !== 'passed' || cleanEmailRun.results.T04.status !== 'passed') {
    throw new Error('FAILED: T04 did not pass after reset!');
  }
  console.log('✓ PASS: T04 passed after resetting defect.\n');

  console.log('=====================================================');
  console.log('ALL PLAYWRIGHT INFRASTRUCTURE & QA AUDIT CHECKS PASSED!');
  console.log('=====================================================');
}

main().catch((err) => {
  console.error('\n❌ AUDIT CHECK FAILED:', err);
  process.exit(1);
});
