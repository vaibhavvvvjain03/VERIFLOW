# Veriflow — Test Plan and Demo Script

## Six required test cases

### T01 Add product to cart
Reset store; add `LP-HEADPHONES`; open cart; assert product is present and count is one. Expected: PASS.

### T02 Cart quantity recalculates subtotal
Reset; add $59 headphones; set quantity to two; assert quantity is two and subtotal is $118. Expected: PASS normally; FAIL with `BUG_CART_TOTAL_WRONG`.

### T03 Empty address is blocked
Reset; add an in-stock item; checkout with address blank; submit; assert required-address validation and no confirmation. Expected: PASS.

### T04 Invalid email is rejected
Reset; add item; enter `not-an-email` and other required fixture fields; submit; assert email validation and no confirmation. Expected: PASS normally; FAIL with `BUG_INVALID_EMAIL_ACCEPTED`.

### T05 Valid checkout completes
Reset; add item; enter `demo@example.com`, valid sample name/address; submit; assert confirmation heading and order reference. No real payment. Expected: PASS.

### T06 Out-of-stock item cannot be purchased
Reset; open `LP-SOLDOUT`; try add to cart; assert purchase is disabled or clear out-of-stock message appears and cart remains unchanged. Expected: PASS.

## Reliability tests
- Unknown command runs nothing and shows help.
- Invalid test ID rejected.
- Empty selection does not start a run.
- Runner crash yields readable error, not endless spinner.
- Reset restores deterministic data/configuration.
- Report uses actual run results.
- Rerun failed submits only failed IDs.
- Refresh never turns a failure into a pass.

## Two-minute demo (target 1:50)
**0:00–0:12 — Problem:** “AI can build an app fast. Proving its critical flows still takes work. Veriflow lets me dictate tests, run them in a real browser, and inspect evidence.”

**0:12–0:25 — Voice:** Show six tests. Use Wispr Flow to dictate: “Run the cart total test and the invalid email test.” Show parsed plan.

**0:25–0:55 — Real failure:** Enable a labeled demo bug, run its test, and show the actual failing assertion and evidence. Do not fake a failure.

**0:55–1:15 — Verified rerun:** Disable the demo bug and dictate “Rerun failed tests.” Show only the failed test runs and now passes because the assertion passes.

**1:15–1:35 — Breadth:** Dictate “Run all six tests.” Show real run progress and final summary.

**1:35–1:48 — Evidence:** Open steps/assertions and dictate “Export the test report.” Show actual report.

**1:48–1:55 — Close:** “Veriflow doesn't just tell me the app works. It runs the test and shows me the proof.”

## Recording checklist
- Fresh browser session; reset data.
- Confirm planned bug injection state.
- Run all six tests before recording.
- Close unrelated tabs/notifications.
- Keep Wispr interaction visible where possible.
- Record two rehearsals; choose the cleanest under two minutes.

## Honesty rules
Never show a hardcoded PASS/FAIL, call a static animation a test, claim arbitrary-site support if only the demo store works, or claim automatic code repair when only demo bug injection exists.
