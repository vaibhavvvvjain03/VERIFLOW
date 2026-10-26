# Veriflow — Product Requirements Document

## Product
Veriflow is a voice-directed browser-testing workspace for developers building apps with AI coding tools. Promise: **Say what to test. Watch it run. See proof.**

Wispr Flow is the dictation layer: the user focuses the command field, invokes Wispr Flow, and speaks. Veriflow parses the resulting text into supported actions. No separate speech-recognition API is needed.

## Problem and users
AI-generated interfaces can look finished while important user journeys still fail. Solo developers, students, and hackathon builders need a fast way to check common flows and see evidence rather than trust a chatbot's claim.

## Core journey
1. Open the app without login.
2. See the preloaded Veriflow Demo Store project.
3. Dictate a supported command or select tests.
4. Review the planned test IDs.
5. Run real Playwright browser tests against `/demo-store`.
6. Inspect pass/fail results, steps, assertions, and failure evidence.
7. Dictate “rerun failed tests.”
8. Export the actual run report.

## Required six tests
- **T01 Add to cart:** add an in-stock product; assert cart count and item.
- **T02 Cart total:** change quantity from one to two; assert quantity and subtotal.
- **T03 Empty address:** submit checkout without a shipping address; assert validation and no confirmation.
- **T04 Invalid email:** submit malformed email; assert validation and no checkout completion.
- **T05 Valid checkout:** submit valid fixture details; assert confirmation and order reference.
- **T06 Out of stock:** attempt to add a sold-out product; assert disabled purchase or clear out-of-stock message and no cart addition.

Use stable fixture products and resettable data. Optional demo-only bug injection should be able to make T02 and T04 genuinely fail. A Playwright assertion—not a hardcoded status—must determine every result.

## Voice commands
Support:
- “Run all six tests.”
- “Test the cart total and invalid email validation.”
- “Run checkout tests only.”
- “Rerun failed tests.”
- “Open the evidence for the invalid email test.”
- “Export the test report.”
- “Reset the demo data.”

Show the dictated command and parsed plan. Unknown or ambiguous commands must ask for clarification or show supported commands. Never evaluate dictated text as code or shell commands.

## Dashboard requirements
- Project name and status summary.
- Command bar designed for Wispr Flow dictation.
- Six-test catalog with IDs, descriptions, tags, and current status.
- Run all, run selected, rerun failed, reset demo.
- Timeline of test events.
- Evidence panel with steps, assertions, failure screenshot/trace where available.
- Export JSON plus a readable report if time permits.
- Idle, running, pass, fail, empty, and error states.

## Demo website
`/demo-store` is a real route in the same repository, with product list, cart, quantity controls, checkout form, validation, confirmation, out-of-stock product, stable accessible labels, and deterministic fixtures. It is a real website that Playwright opens and tests; it is not a mock result screen.

## Non-functional requirements
- No login, API keys, or paid runtime service.
- Desktop-first, responsive, accessible, high contrast.
- Deterministic tests and clear errors.
- No real customer data.
- No fake results or unsupported AI claims.

## Out of scope
Arbitrary URL testing, repository import, auto-editing arbitrary source code, accounts, billing, team features, CI/CD, external LLM dependency, and arbitrary shell execution.

## Acceptance criteria
1. Judge can open the app without login.
2. All six tests execute against `/demo-store`.
3. At least two demo bug injections cause real test failures.
4. Results are generated from actual assertions.
5. Wispr Flow dictation triggers supported commands.
6. Rerun-failed runs only failed IDs.
7. Export includes actual run results.
8. Public demo works twice consecutively from a clean state.

**Principle: evidence before confidence.** Never show PASS unless the assertion passed.


## 12. Phase-gated Antigravity execution
**Execute one phase only, verify it, then stop.** Use Wispr Flow to dictate the prompt for the current phase. Do not ask the model to build the entire product in one generation.

### Phase 0 — Inspect repository (no edits)
Prompt: “Start Veriflow Phase 0 only. Read PROJECT.md, PRD.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md, and TEST_AND_DEMO.md fully. Inspect the repository, stack, scripts, entry points, dependencies, and reusable code. Do not edit files. Report repo map, risks, proposed changes, and exact verification commands. Wait for approval.”
Exit gate: plan reviewed and approved.

### Phase 1 — Dashboard shell and demo store
Prompt: “Implement Phase 1 only: build the dashboard shell and real /demo-store route. Follow the docs and create an original, polished engineering workspace inspired by SpecFlow’s clarity, not a copy of its exact layout, logo, text, or assets. Do not fake test results. Run the app, typecheck/build, inspect both routes and responsive layout, fix introduced issues, report changed files and evidence, then stop.”
Exit gate: both routes work; no blocking console errors.

### Phase 2 — Six real Playwright tests
Prompt: “Implement Phase 2 only. Add T01–T06 from PRD.md and TEST_AND_DEMO.md as real Playwright end-to-end tests against /demo-store. Use accessible selectors or stable test IDs; reset state between tests. Run every test independently and the full suite. Fix failures and flakiness; never skip assertions or hardcode results. Report exact commands and outcomes, then stop.”
Exit gate: all six pass against healthy demo state.

### Phase 3 — Real runner API
Prompt: “Implement Phase 3 only. Connect the dashboard to the backend Playwright runner. Validate IDs with an allowlist, create run IDs, store structured events/results, and update UI only from actual runner output. Use polling if streaming adds risk. Verify one real pass and one real fail end-to-end. Do not simulate results. Run checks, report evidence, then stop.”
Exit gate: dashboard displays genuine runner outcomes.

### Phase 4 — Demo failure and recovery
Prompt: “Implement Phase 4 only. Add clearly labeled demo-only BUG_CART_TOTAL_WRONG and BUG_INVALID_EMAIL_ACCEPTED settings that change real demo-store behavior. Prove T02/T04 fail with the respective defect enabled and pass when disabled. Add reset behavior, run tests in both states, fix issues, report actual outcomes, then stop.”
Exit gate: repeatable real fail/pass cycles.

### Phase 5 — Wispr Flow command workflow
Prompt: “Implement Phase 5 only. Add the deterministic allowlist command parser in ARCHITECTURE.md. I will dictate into the focused command field using Wispr Flow. Support run all, test-specific selection, checkout tests, rerun failed, open evidence, export report, and reset demo. Show parsed plan; explain unknown/ambiguous commands instead of guessing. Never evaluate dictated text as code. Test each command, report results, then stop.”
Exit gate: commands work; rerun-failed runs only failed IDs.

### Phase 6 — Evidence and report export
Prompt: “Implement Phase 6 only. Complete the evidence panel and report export from actual run data. Show step/assertion details and failure screenshots/traces where supported. Verify exported statuses match Playwright results and evidence belongs to the selected run/test. Run checks, fix issues, report evidence, then stop.”
Exit gate: a real run can be inspected and exported accurately.

### Phase 7 — Polish and release
Prompt: “Implement Phase 7 only. Polish typography, spacing, status states, responsiveness, and Veriflow branding without copying proprietary SpecFlow assets. Do not add out-of-scope features. Deploy only where the backend can run Playwright. Test from a fresh session, run all six tests, verify fail/pass and report export, and rehearse twice. Fix blockers and provide a release checklist with evidence, then stop.”
Exit gate: public demo works twice consecutively and fits the two-minute video.

## 13. Mandatory IX verification loop
After every phase and meaningful change:
1. **Inspect** — compare changes with scope; inspect diffs, UI, security, and regressions.
2. **eXecute** — run the narrowest relevant test, then typecheck/lint/build and broader tests.
3. **eXamine** — inspect real browser behavior, console/network errors, logs, screenshots/traces, and exported data.
4. **eXplain** — report changed files, exact commands, outcomes, limitations, and anything unverified.
5. **eXit-gate** — proceed only if acceptance criteria pass. If checks fail, fix and repeat; if blocked, stop and report it.

Never claim a command passed unless it actually ran successfully. Do not hide failures or mark a phase complete because the code merely looks plausible.
