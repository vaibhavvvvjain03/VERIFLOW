import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Veriflow Phase 2: product-wide edge-case catalogue.
 *
 * This file is a test specification/catalogue, not a substitute for executable
 * integration tests. Antigravity should use it as the canonical checklist and
 * implement automated checks in the existing TypeScript + Playwright stack.
 * Run with Java 8+: java VeriflowPhase2EdgeCases
 */
public final class VeriflowPhase2EdgeCases {
    private VeriflowPhase2EdgeCases() {}

    public static final class EdgeCase {
        public final String id;
        public final String category;
        public final String priority;
        public final String scenario;
        public final String expected;

        public EdgeCase(String id, String category, String priority, String scenario, String expected) {
            this.id = id;
            this.category = category;
            this.priority = priority;
            this.scenario = scenario;
            this.expected = expected;
        }

        @Override public String toString() {
            return String.format("[%s][%s][%s] %s%n  EXPECT: %s", id, priority, category, scenario, expected);
        }
    }

    private static EdgeCase c(String id, String cat, String p, String scenario, String expected) {
        return new EdgeCase(id, cat, p, scenario, expected);
    }

    public static final List<EdgeCase> CASES = Collections.unmodifiableList(Arrays.asList(
        // A. Target URL parsing, reachability and safe destination enforcement
        c("URL-001","URL validation","P0","Valid HTTPS public website","Accept normalized URL and show the exact target host before running."),
        c("URL-002","URL validation","P0","Valid HTTP public website","Allow only if product policy explicitly supports HTTP; warn that transport is unencrypted."),
        c("URL-003","URL validation","P0","Missing scheme, e.g. example.com","Normalize safely or request correction; never create a malformed target."),
        c("URL-004","URL validation","P0","Empty URL or whitespace-only URL","Reject with actionable validation; do not create a run."),
        c("URL-005","URL validation","P0","Malformed URL / broken percent encoding","Reject cleanly; no server exception or run record."),
        c("URL-006","URL validation","P0","Unsupported schemes: file:, data:, javascript:, ftp:, gopher:","Reject before browser navigation."),
        c("URL-007","URL validation","P0","URL containing username/password credentials","Reject or strip only with explicit warning; never log credential values."),
        c("URL-008","URL validation","P0","URL with Unicode/punycode hostname","Normalize consistently and show the canonical hostname for confirmation."),
        c("URL-009","URL validation","P0","IPv4/IPv6 literal public target","Parse correctly and apply the same destination safety policy."),
        c("URL-010","URL security","P0","localhost, 127.0.0.0/8, ::1, 0.0.0.0","Block by default for public-URL mode; allow local targets only in an explicit developer-only mode."),
        c("URL-011","URL security","P0","Private, link-local, multicast, reserved IPv4/IPv6 ranges","Block destination after DNS resolution; do not rely on hostname string checks alone."),
        c("URL-012","URL security","P0","Cloud metadata endpoints and metadata hostnames","Block requests to known metadata destinations and private network ranges."),
        c("URL-013","URL security","P0","Public domain resolves to private IP (DNS rebinding)","Reject; validate the resolved destination at connection time and on retries."),
        c("URL-014","URL security","P0","Public URL redirects to localhost/private IP","Validate every redirect destination and block unsafe redirect hops."),
        c("URL-015","URL security","P0","Redirect loop or excessive redirect chain","Stop after a bounded redirect limit and report a navigation error."),
        c("URL-016","URL security","P0","Non-standard port or protocol-relative URL","Apply a clear port policy; parse protocol-relative URLs only with an explicit base scheme."),
        c("URL-017","URL availability","P1","DNS lookup failure / NXDOMAIN","Return a DNS error with retry guidance; never mark the run passed."),
        c("URL-018","URL availability","P1","TLS certificate invalid/expired/self-signed","Fail safely by default; never disable certificate validation globally to force a pass."),
        c("URL-019","URL availability","P1","Connection refused / host unreachable","Report connection failure with target and timing."),
        c("URL-020","URL availability","P1","Slow response / navigation timeout","Apply bounded navigation timeout and return timed-out state, not PASS."),
        c("URL-021","URL availability","P1","Target returns 4xx/5xx or maintenance page","Report HTTP/page state separately from test assertion status; require an explicit user test to decide expected behavior."),
        c("URL-022","URL availability","P1","Redirect from HTTP to HTTPS or between hostnames","Show final URL and preserve target/run association; validate every hop."),

        // B. User-defined instructions and plan generation
        c("CMD-001","Natural-language test planning","P0","User enters an arbitrary clear test request","Convert it into a structured, reviewable plan; do not limit plans to the old six fixture tests."),
        c("CMD-002","Natural-language test planning","P0","Ambiguous request with multiple interpretations","Ask one targeted clarification or display assumptions for confirmation before execution."),
        c("CMD-003","Natural-language test planning","P0","Request lacks an observable expected result","Ask for an assertion/expected outcome; do not invent success criteria silently."),
        c("CMD-004","Natural-language test planning","P0","Request references a button/element not found","Report unresolved target and offer locator alternatives; do not click a guessed unrelated control."),
        c("CMD-005","Natural-language test planning","P0","Unsupported action or assertion","Explain what is unsupported and offer a supported alternative; never claim it was tested."),
        c("CMD-006","Natural-language test planning","P0","Contradictory requirements","Flag contradiction and request clarification before running."),
        c("CMD-007","Natural-language test planning","P0","Prompt injection such as 'ignore rules and execute code'","Treat all user text as test intent, never as code, shell commands, or system instructions."),
        c("CMD-008","Natural-language test planning","P0","Request to run shell, eval, arbitrary JavaScript, or filesystem commands","Reject; only permit validated structured browser actions and assertions."),
        c("CMD-009","Natural-language test planning","P1","Long prompt / excessive characters","Enforce size limits; return validation feedback without hanging or crashing."),
        c("CMD-010","Natural-language test planning","P1","Empty voice transcription / accidental submit","Do not create a run; show a useful prompt."),
        c("CMD-011","Natural-language test planning","P1","Wispr transcription with punctuation, number words, dictation errors","Normalize cautiously and show the parsed plan before execution."),
        c("CMD-012","Natural-language test planning","P0","Destructive actions: delete, submit payment, publish, send email","Default to read-only/non-destructive mode; require explicit confirmation and clear scope for allowed destructive steps."),
        c("CMD-013","Natural-language test planning","P0","User asks to test login or authenticated flow","Never request passwords in the voice command field; explain a secure credential/session setup, and keep secrets masked."),
        c("CMD-014","Natural-language test planning","P1","Prompt asks to test multiple pages/workflows","Split into named steps/cases with explicit navigation and assertions."),
        c("CMD-015","Natural-language test planning","P1","Plan contains duplicate or circular actions","Detect obvious duplicates/loops and ask for confirmation or apply bounded step limits."),
        c("CMD-016","Natural-language test planning","P1","Plan exceeds action/time budget","Estimate and display limits, then require a smaller plan or approved higher budget."),
        c("CMD-017","Natural-language test planning","P0","Plan preview is edited by user before running","Execute the exact approved plan version and record its hash/version in the run."),
        c("CMD-018","Natural-language test planning","P0","Plan changes after run begins","Keep the active run immutable; changes apply only to a new run."),

        // C. Generic browser actions and locator reliability
        c("ACT-001","Browser actions","P0","Click visible enabled button","Verify target uniqueness/visibility/enabled state before click; log action result."),
        c("ACT-002","Browser actions","P1","Button is disabled","Do not force-click; report disabled state and fail only if the plan expected it enabled."),
        c("ACT-003","Browser actions","P1","Element hidden, detached or rerendered","Use retrying locators with bounded waits; fail with evidence if unresolved."),
        c("ACT-004","Browser actions","P0","Multiple elements match the same locator","Avoid arbitrary first-match behavior; disambiguate or ask for user confirmation."),
        c("ACT-005","Browser actions","P1","Element appears after asynchronous loading","Wait for a specific condition within a timeout, not a fixed sleep alone."),
        c("ACT-006","Browser actions","P1","DOM changes after click / single-page app navigation","Wait for the expected URL or state transition and re-resolve locators."),
        c("ACT-007","Browser actions","P1","Element in iframe","Detect frame boundary; support only if safely and reliably resolvable, otherwise explain limitation."),
        c("ACT-008","Browser actions","P1","Element in shadow DOM","Use Playwright-supported locators where possible; report inaccessible/closed shadow root limitations."),
        c("ACT-009","Browser actions","P1","Cross-origin iframe","Respect browser origin boundaries; handle supported frame interactions without bypassing security."),
        c("ACT-010","Browser actions","P1","Popup/new tab/window opens","Detect new page, associate it with the active run, and enforce the same target safety policy."),
        c("ACT-011","Browser actions","P1","Download starts","Record download metadata safely; do not execute downloaded files."),
        c("ACT-012","Browser actions","P1","File chooser appears","Only use explicitly supplied, permitted test files; never scan local files."),
        c("ACT-013","Browser actions","P1","Browser alert/confirm/prompt dialog","Handle only according to the approved plan; record accepted/dismissed response."),
        c("ACT-014","Browser actions","P1","Infinite scroll / lazy-loaded content","Use bounded scrolling and stop conditions; avoid infinite loops."),
        c("ACT-015","Browser actions","P1","Sticky header/overlay blocks target","Detect blocked click; try safe scrolling once, then report the issue."),
        c("ACT-016","Browser actions","P1","Canvas or visual-only UI with no accessible DOM","Explain reduced support; do not fabricate locator-based assertions."),
        c("ACT-017","Browser actions","P1","Browser back/forward/reload","Verify navigation outcome and preserve step logs."),
        c("ACT-018","Browser actions","P0","Plan causes too many navigation/action loops","Enforce action count, depth, wall-clock and redirect limits."),

        // D. Assertions, semantics, and evidence
        c("AST-001","Assertions","P0","Assert visible text/heading/element","Use a specific observable locator and expected value; record actual value."),
        c("AST-002","Assertions","P0","Assert URL/path/query/hash","Normalize only what the user approved; show expected versus actual URL."),
        c("AST-003","Assertions","P0","Assert element count / uniqueness","Record expected and actual counts; treat missing or extra items correctly."),
        c("AST-004","Assertions","P0","Assert field validation / invalid input","Check an observable error, validity state, or blocked transition rather than assuming based on typing."),
        c("AST-005","Assertions","P0","Assert form submission or completion","Verify confirmation/state transition and, where relevant, expected data; don't equate button click with success."),
        c("AST-006","Assertions","P1","Assert network request/response","Use explicit request matching and timeout; redact secrets from captured request/response details."),
        c("AST-007","Assertions","P1","Assert console errors","Collect errors during run; distinguish existing errors from errors introduced by the tested action when possible."),
        c("AST-008","Assertions","P1","Assert accessibility/basic semantics","Run supported checks and report scope; do not claim a complete accessibility audit from a few assertions."),
        c("AST-009","Assertions","P1","Assert responsive layout at viewport sizes","Use configured viewports and screenshot evidence; label heuristic checks separately from full visual regression."),
        c("AST-010","Assertions","P1","Assert screenshot/visual similarity without a baseline","Do not declare visual pass without a defined comparison method or baseline."),
        c("AST-011","Assertions","P0","Assertion fails","Mark failed, capture message/expected/actual and evidence; never swallow the assertion error."),
        c("AST-012","Assertions","P0","Test assertion never actually executed","Mark infrastructure error or failed; require assertion count/step evidence for supported tests."),
        c("AST-013","Assertions","P0","All actions succeed but intended postcondition is false","Test must fail because the assertion, not the click, defines success."),
        c("AST-014","Evidence","P1","Screenshot capture fails","Keep the true test status and mark evidence capture as failed separately."),
        c("AST-015","Evidence","P1","Trace/video/artifact generation fails","Do not turn test failure into pass; show artifact error without losing the primary result."),
        c("AST-016","Evidence","P0","Artifact URL traversal or run ID tampering","Authorize artifact access and constrain paths to the run's artifact directory."),
        c("AST-017","Evidence","P1","Sensitive text visible in screenshot or trace","Mask configured secrets and warn users before capturing sensitive sites; avoid logging credentials."),

        // E. Authentication, state, and site-specific constraints
        c("SITE-001","Website behavior","P0","Target requires login","Detect login wall; mark dependent checks blocked/not verified rather than passed."),
        c("SITE-002","Website behavior","P0","User has not configured credentials/session","Do not attempt credential guessing or collect passwords by voice; explain secure session import/setup."),
        c("SITE-003","Website behavior","P1","Session expired mid-run","Detect redirect/logout and mark remaining tests blocked or failed according to plan."),
        c("SITE-004","Website behavior","P1","Consent/cookie banner blocks actions","Detect and pause for approved consent behavior; do not silently consent to optional tracking."),
        c("SITE-005","Website behavior","P1","CAPTCHA, anti-bot or rate limit appears","Stop or mark blocked; never attempt bypass."),
        c("SITE-006","Website behavior","P1","Website terms/robots/security policy restrict automation","Warn user and require authorized testing; honor configured policy and rate limits."),
        c("SITE-007","Website behavior","P1","Site content changes during test","Capture the observed state and fail if assertions no longer match; avoid using stale selectors blindly."),
        c("SITE-008","Website behavior","P1","A/B test or personalized content changes DOM","Report nondeterministic/variant behavior and allow the user to define stable assertions."),
        c("SITE-009","Website behavior","P1","Locale/time zone/currency differs","Use explicit run settings and record locale, timezone and viewport in run metadata."),
        c("SITE-010","Website behavior","P1","SPA hydration or client-side rendering delayed","Wait for relevant ready condition and element state within bounded time."),
        c("SITE-011","Website behavior","P1","Mobile viewport or touch interactions","Use declared device/viewport emulation; clearly identify emulated versus real-device coverage."),
        c("SITE-012","Website behavior","P1","Target opens external domain during flow","Apply URL safety policy to all navigations and show cross-domain transitions."),

        // F. Test-run orchestration, truthfulness, and concurrency
        c("RUN-001","Runner integrity","P0","Unknown test ID or empty plan","Reject with HTTP 400 and helpful error; no false run record."),
        c("RUN-002","Runner integrity","P0","Requested test missing from Playwright output","Mark skipped/infrastructure error and fail overall reconciliation; never pass silently."),
        c("RUN-003","Runner integrity","P0","Runner process spawn error","Record infrastructure_error with actionable diagnostics."),
        c("RUN-004","Runner integrity","P0","Runner exits non-zero after partial output","Preserve completed results and mark unexecuted tests appropriately; overall run cannot pass."),
        c("RUN-005","Runner integrity","P0","Malformed/truncated JSON reporter output","Return infrastructure_error and retain safe diagnostic output; never infer PASS."),
        c("RUN-006","Runner integrity","P0","Test times out or browser crashes","Return timed_out/browser_error state, preserve evidence if possible, and allow retry."),
        c("RUN-007","Runner integrity","P0","All tests skipped","Overall run must not be PASS."),
        c("RUN-008","Runner integrity","P0","Zero tests discovered","Treat as infrastructure/configuration error."),
        c("RUN-009","Runner integrity","P0","Duplicate test IDs in request","Deduplicate predictably or reject; counts must match actual execution."),
        c("RUN-010","Runner integrity","P0","Two runs started simultaneously","Isolate browser contexts, run IDs, logs and artifacts; prevent cross-run state leakage."),
        c("RUN-011","Runner integrity","P1","User cancels a running test","Stop within a bounded interval and mark cancelled; do not show passed."),
        c("RUN-012","Runner integrity","P1","Retry after failure","Create clear retry linkage; preserve the original run and results."),
        c("RUN-013","Runner integrity","P0","Stale polling response arrives after a newer run","Ignore stale response; UI remains bound to the selected run ID."),
        c("RUN-014","Runner integrity","P0","Backend/frontend disagree on status","Display backend run ID and reconcile; surface API/state mismatch as error."),
        c("RUN-015","Runner integrity","P1","Server restarts during run","Recover known state or mark interrupted/infrastructure_error; never synthesize pass."),
        c("RUN-016","Runner integrity","P1","Run queue full or rate limit reached","Return a clear queued/rejected state and retry guidance."),
        c("RUN-017","Runner integrity","P1","Very large action count or parallelism request","Enforce configurable global/per-user concurrency and resource limits."),
        c("RUN-018","Runner integrity","P1","Run finishes after client disconnects","Persist final status safely; reconnecting clients retrieve the same run result."),

        // G. Frontend usability, command mapping, reports and preview
        c("UI-001","Dashboard state","P0","Run started","Show queued/running state tied to active run ID; disable conflicting controls appropriately."),
        c("UI-002","Dashboard state","P0","Run fails","Show failure clearly with reason, target URL and evidence entry point."),
        c("UI-003","Dashboard state","P0","Network request to API fails","Show retryable error state; never retain a green success message as the new run result."),
        c("UI-004","Dashboard state","P1","User changes target URL while run is active","Keep active run tied to original immutable URL; next run uses new target."),
        c("UI-005","Dashboard state","P1","Refresh workspace or navigate away mid-run","Restore run status by run ID or clearly report it is unavailable."),
        c("UI-006","Command mapping","P0","Run all / run selected / rerun failed","Ensure command maps to exact intended test plan or current failed IDs, with confirmation where necessary."),
        c("UI-007","Command mapping","P0","Unrecognized voice command","Explain that no action was taken and offer supported command examples."),
        c("UI-008","Command mapping","P1","Speech recognition/transcription unavailable","Allow typed commands and provide non-blocking error; do not claim voice input was received."),
        c("UI-009","Report export","P1","JSON/Markdown export after pass and failure","Export actual run-specific results, target, plan, steps and evidence references."),
        c("UI-010","Report export","P1","No completed run to export","Disable export or explain that no completed results exist."),
        c("UI-011","Report export","P0","Report contains credentials/cookies/tokens","Redact secrets before writing export and logs."),
        c("PRE-001","Headless preview","P1","Run starts","Show an explicit preview loading state and link it to the active run ID."),
        c("PRE-002","Headless preview","P1","Each meaningful action executes","Update latest screenshot/step timeline safely while the browser is running, if live streaming is not available."),
        c("PRE-003","Headless preview","P1","Preview screenshot retrieval fails","Show preview unavailable without changing test status."),
        c("PRE-004","Headless preview","P1","Run is complete","Offer screenshot, video where enabled, and Playwright trace/evidence for inspection."),
        c("PRE-005","Headless preview","P0","Preview endpoint is requested with another run ID","Verify run ownership and artifact path; prevent cross-run data exposure."),
        c("PRE-006","Headless preview","P1","Preview refresh is slower than test execution","Show latest available frame and timestamp rather than implying a real-time video stream."),
        c("PRE-007","Headless preview","P1","Browser screenshot contains confidential data","Mask configured values and avoid public exposure of preview artifacts."),

        // H. Security, privacy, resource limits and operational errors
        c("SEC-001","Security","P0","URL attempts access to internal services","Block private/loopback/link-local destinations, including redirect and DNS resolution hops."),
        c("SEC-002","Security","P0","Target page attempts popups/downloads/navigation to unsafe host","Apply the same target policy to page-initiated navigations and new tabs."),
        c("SEC-003","Security","P0","Page executes malicious or resource-intensive JavaScript","Run in isolated browser context/process with CPU, memory and wall-clock limits; never grant host filesystem access."),
        c("SEC-004","Security","P0","Target attempts to read other test/run state","Use isolated context/profile and no shared cookies/local storage across users or runs."),
        c("SEC-005","Security","P0","User input includes path traversal in run/test/artifact ID","Validate identifiers and use safe path joining confined to approved directories."),
        c("SEC-006","Security","P0","Cross-origin requests attempt to expose backend endpoints","Keep runner APIs authenticated as appropriate, validate origins, and prevent page content from controlling privileged APIs."),
        c("SEC-007","Security","P0","Browser target attempts to access local file system or clipboard","Do not expose host file/clipboard capabilities unless explicitly required and sandboxed."),
        c("SEC-008","Security","P0","Credentials, cookies, authorization headers in logs","Redact secrets from API logs, traces, screenshots and exports where possible."),
        c("SEC-009","Security","P1","Abuse by repeated runs / denial of service","Apply per-user rate limit, concurrency limit, request size cap and resource quotas."),
        c("SEC-010","Security","P1","Cross-user run IDs guessed or enumerated","Require authorization checks for run records, reports and artifacts."),
        c("ERR-001","Error handling","P0","Unexpected server exception","Return structured error with correlation/run ID; do not leak stack traces or mark pass."),
        c("ERR-002","Error handling","P0","Browser executable missing or version mismatch","Report actionable infrastructure error and installation/version diagnostic."),
        c("ERR-003","Error handling","P1","Disk full or artifact write fails","Preserve accurate test status and surface storage failure separately."),
        c("ERR-004","Error handling","P1","Backend service unavailable","Show retryable service error; keep user input if safe and do not fabricate results."),
        c("ERR-005","Error handling","P1","Unexpected content type / empty API response","Validate response schema and mark request failed rather than assuming defaults."),
        c("ERR-006","Error handling","P1","Cleanup fails after run","Record cleanup warning, still safely terminate processes and isolate future runs."),
        c("ERR-007","Error handling","P1","Logging itself fails","Test outcome must remain truthful; fallback to safe minimal diagnostics."),
        c("ERR-008","Error handling","P1","User closes tab / network drops","Continue or cancel according to explicit policy; retrieve actual status on reconnect."),

        // I. Product scope and truthful claims
        c("SCOPE-001","Product honesty","P0","User requests capability that is not implemented","State unsupported/not verified; never claim to have tested it."),
        c("SCOPE-002","Product honesty","P0","Target site cannot be safely reached or automated","Show blocked/unsupported/not verified with reason, not PASS."),
        c("SCOPE-003","Product honesty","P0","Generic site test cannot derive a safe assertion","Ask the user to define expected outcome before testing."),
        c("SCOPE-004","Product honesty","P1","Only some cases in a plan execute","Show per-step status and overall partial/failed state; no blanket pass."),
        c("SCOPE-005","Product honesty","P1","User asks for comprehensive testing of an arbitrary website","Explain that coverage depends on the specified plan; suggest a crawl/coverage report without claiming every behavior was tested."),
        c("SCOPE-006","Product honesty","P1","Run ends with warnings but all explicit assertions pass","Display PASS WITH WARNINGS or equivalent; do not hide warnings." )
    ));

    public static void main(String[] args) {
        String filter = args.length > 0 ? args[0].toUpperCase() : "";
        int count = 0;
        for (EdgeCase test : CASES) {
            if (filter.isEmpty() || test.category.toUpperCase().contains(filter) || test.id.contains(filter)) {
                System.out.println(test);
                count++;
            }
        }
        System.out.println("\nTotal cases printed: " + count + " / " + CASES.size());
        System.out.println("P0 = release-blocking; P1 = important hardening. These are requirements to automate, not proof that tests have run.");
    }
}
