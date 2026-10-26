# Veriflow — Master Instructions for Antigravity

Before coding, read `PRD.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, and `TEST_AND_DEMO.md` in full. Treat them as the product contract. Inspect the existing repository and preserve working code; do not replace a sound scaffold without reason.

## Non-negotiable
1. One repo/product with `/` dashboard and `/demo-store` real sample site.
2. Playwright must execute actual browser actions/assertions against `/demo-store`.
3. Implement all six T01–T06 tests.
4. Wispr Flow dictates into the focused command field; Veriflow parses the text. No extra speech API.
5. Never fake status. PASS only follows a passing assertion.
6. Support run all, selected test, rerun failed, open evidence, export report, reset demo.
7. No login, API key, or external LLM needed for MVP.
8. Do not claim arbitrary URL/repository testing.
9. No claim of automatic source-code repair. Demo-only bug injection is acceptable if clearly labeled and genuinely changes behavior.
10. Never execute dictated text as code or shell commands.

## Visual direction
The user likes the clarity and polish of SpecFlow's winning UI. Use only high-level usability principles: structured workspace, clear hierarchy, deliberate spacing, readable status, and visible evidence. Do not copy its exact layout, logo, wording, or assets. Create a distinct Veriflow brand: light theme, off-white background, dark text, subtle borders, one restrained accent, clear pass/fail states. Avoid generic neon gradients, fake metrics, and decorative clutter. Desktop is primary; mobile must remain usable.

## Build order
1. Inspect repo and scaffold.
2. Build `/demo-store`.
3. Implement six passing Playwright tests.
4. Add deterministic demo bug injection and prove genuine fail/pass.
5. Connect runner to dashboard.
6. Add Wispr-friendly command parser.
7. Add evidence and report export.
8. Polish and deploy.

At each milestone, run relevant tests, report files changed, state what works and what remains incomplete. Prefer one working end-to-end flow over many mock screens.

## Definition of done
A judge can open the app without login, dictate a supported command with Wispr Flow, run one or more of six real tests, inspect actual step-by-step results/evidence, rerun failures, and export a report. The complete demo works twice from a clean state.

Start by inspecting the repository, provide a brief implementation plan, then begin Milestone 1. Do not stop after writing a plan.


## Model/tool policy: Gemini Flash and Graphify
Graphify may be used as an auxiliary repository-analysis/workflow tool if it is available. Do not assume it turns Gemini Flash into Claude or guarantees equivalent reasoning. Validate its suggestions against the repository and use the IX loop. If the model struggles, split work into smaller phase-scoped prompts; never skip tests. Use the exact current-phase prompt from PRD.md and do not dictate the next phase until the exit gate passes.
