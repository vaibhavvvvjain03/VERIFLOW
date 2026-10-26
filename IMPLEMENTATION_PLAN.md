# Veriflow — Two-Day Implementation Plan

## Rule
Build one complete vertical slice first: dictate command → parse test selection → run Playwright → show real evidence → export report. Polish after it works.

## Day 1: Core product
### 1. Inspect and scaffold (30 min)
Read all docs, inspect the repo, preserve working code, verify Node/npm scripts. Dictate the real implementation prompt with Wispr Flow.

### 2. Dashboard and routes (1–2 h)
Build `/` dashboard and `/demo-store` route. Use original Veriflow branding and clear information hierarchy. Include command field, six-test catalog, status summary, timeline, evidence panel.

### 3. Demo store (1–2 h)
Implement product list, cart, quantity, checkout, validation, confirmation, out-of-stock state, stable labels/test IDs, reset.

### 4. Six Playwright tests (2–3 h)
Implement T01–T06 and get them passing independently and as a suite. Fix flaky selectors before UI integration.

### 5. Demo bug injection (45–90 min)
Implement wrong cart total and invalid-email acceptance toggles. Prove the related real tests fail when enabled and pass when disabled.

### 6. Backend runner (2–3 h)
Add run API, allowlisted test IDs, run manager, structured events, status polling. Do not overengineer websockets.

**End-of-Day 1 gate:** at least one real pass, one real fail, and dashboard displays actual Playwright results. If this is not working, stop adding features.

## Day 2: Voice, evidence, polish, release
### 7. Command parser (1–2 h)
Support run all, test-specific commands, rerun failed, open evidence, export report, reset demo. Make Wispr Flow dictation into the command field the primary workflow. Buttons remain as fallback.

### 8. Evidence and export (1–2 h)
Show step logs/assertions, failure screenshot/trace, and JSON plus readable Markdown/HTML report where feasible.

### 9. Visual polish (1–2 h)
Refine typography, spacing, focus states, selected test, run states, responsive layout. Avoid neon gradients, fake metrics, excessive animation, and placeholder panels.

### 10. Deployment and rehearsal (2 h)
Choose a host that supports Node + Playwright. Test public link from a fresh session and run all six tests twice. Reset the demo and record two rehearsals under two minutes.

## Priority
**Must:** both routes; six real tests; real runner; Wispr command field; rerun failed; one reproducible failure; public link.
**Should:** two bug injections, report export, failure screenshot/trace, mobile layout.
**Cut first:** arbitrary URLs, repo uploads, LLM parsing, automatic source repair, accounts, integrations.

## Use Wispr meaningfully
Dictate actual product decisions, acceptance criteria, implementation prompts, test cases, bug reproduction, code review requests, demo script, and release notes. Track what was dictated and how it was verified. Do not generate repetitive filler to inflate word count.

## Release checklist
- [ ] No login/API key.
- [ ] Six test IDs visible.
- [ ] Real Playwright execution.
- [ ] Bug injection causes real failure; disabling it produces real pass.
- [ ] Rerun failed runs only failed IDs.
- [ ] No fake statuses or unsupported claims.
- [ ] Public deployment works in a fresh session.
- [ ] Demo can be repeated twice.
- [ ] Wispr Insights usage card saved.


## Strict phase gates and IX loop
Use the exact phase prompts in PRD.md. Execute one phase at a time. After each phase, run Inspect → eXecute → eXamine → eXplain → eXit-gate. If a check fails, repair and repeat. If blocked, stop and report the blocker; do not start the next phase.
