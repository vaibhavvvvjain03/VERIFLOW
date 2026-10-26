# Veriflow — Architecture (Phase 2: Public Website Testing)

## System Overview
Veriflow is a voice-directed browser testing platform that enables engineers to test arbitrary public websites as well as local web applications.
Users describe testing scenarios in natural language or dictate them using Wispr Flow, review structured test plans, and observe genuine headless Chromium execution with real-time milestone frame previews and assertion evidence.

## Core Modules & Routing
- `/` — Product Overview and visual landing experience.
- `/workspace` — Primary testing workspace (Target URL selector, Wispr Flow dictation, structured plan editor, honest browser execution preview, timeline telemetry, and evidence inspector).
- `/demo-store` — Internal development fixture maintained for regression testing and defect verification.

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS design tokens (warm off-white editorial aesthetic, lavender surfaces, coral accents), Lucide icons.
- **Backend API**: Node.js, Express, TypeScript (`tsx`).
- **Automation Runner**: Playwright Test & Headless Chromium process engine.
- **Security**: Strict URL parsing, loopback/private IP blocking (RFC 1918/3927/4193), cloud metadata endpoint defense, DNS rebinding validation, port policy, redirect validation.

## Architecture Layers

```text
┌─────────────────────────────────────────────────────────────┐
│                       Frontend UI                           │
│  TargetUrlInput  │ CommandBar (Wispr) │ PlanReviewBox        │
│  BrowserPreview  │ RunTimeline        │ EvidencePanel       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                    Express Backend API                      │
│  /api/validate-url │ /api/plan │ /api/runs │ /api/preview   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼─────────────┐   ┌─────────────▼──────────────┐
│  URL Security & Guardrails │   │ Natural Language Planner   │
│  - Protocol & port policy  │   │ - Dictation normalization  │
│  - Private IP & loopback   │   │ - Action/Assertion grammar │
│  - DNS rebinding checks    │   │ - Prompt injection guard   │
│  - Redirect interceptors   │   │ - Destructive confirmation │
└──────────────┬─────────────┘   └─────────────┬──────────────┘
               │                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│             Dynamic Playwright Execution Engine             │
│  - Isolated Chromium Context (ephemeral browser profile)    │
│  - Navigation, click, fill, scroll, keypress actions        │
│  - Observability: assert_visible, assert_text, assert_title │
│  - Honest Milestone Screenshots -> /artifacts/:runId/       │
│  - Failure Artifacts: screenshot, diff {expected, actual}   │
└─────────────────────────────────────────────────────────────┘
```

## Security & Destination Controls (Phase 2)
1. **Protocol Restriction**: Only `https:` and `http:` (with unencrypted transport warning) are permitted. Prohibited schemes (`file:`, `data:`, `javascript:`, `ftp:`, `ws:`, `about:`) are rejected before browser invocation.
2. **Private Network & Loopback Defense**: `localhost`, `127.0.0.0/8`, `::1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, IPv6 unique local `fc00::/7`, link-local `fe80::/10` are blocked by default. Localhost is permitted only when the explicit "Allow Local Fixture" toggle is active.
3. **Cloud Metadata Defense**: Known metadata hosts (`metadata.google.internal`, `169.254.169.254`, `instance-data`) are blocked.
4. **DNS Rebinding Protection**: Target domains are resolved prior to execution, and all resolved IPs are inspected against prohibited ranges.
5. **Runtime Redirect Interception**: Playwright `page.on('response')` monitors 3xx redirects to verify destination safety before subsequent hops execute.
6. **Destructive Action Guards**: Tests involving state modifications (payments, user deletion) require explicit checkbox confirmation prior to running.
7. **Credential Protection**: Plaintext passwords are prohibited in voice prompts; credentials in URLs are stripped with warnings.

## Honest Browser Preview
Because Playwright operates in an isolated server-side headless Chromium instance, Veriflow implements an **Honest Execution Preview**:
- Live execution frames are captured at each action milestone and assertion checkpoint.
- Frames are timestamped and displayed alongside active step labels and a frame-scrubbing gallery.
- Frames are explicitly labeled as milestone viewport captures to avoid misleading users into thinking a static image is a video stream.
