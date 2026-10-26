import React from 'react';
import {
  Mic,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { UNIVERSAL_COMMANDS } from '../../shared/types';
import {
  VeriHero,
  VeriUrl,
  VeriVoice,
  VeriInspect,
  VeriSuccess,
} from '../components/CharacterSketches';

interface LandingPageProps {
  onOpenWorkspace: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenWorkspace }) => {
  return (
    <div className="bg-dotted" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 1. Hero Section */}
      <section className="container-editorial">
        <div className="landing-hero">
          <div>
            <div className="editorial-overline" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="var(--bg-coral)" />
              <span>Voice-Directed Browser Testing for Any Website</span>
            </div>

            <h1 className="landing-hero-headline">
              Say what to test.<br />
              Watch it run.<br />
              <span style={{ color: 'var(--bg-lavender-deep)' }}>See genuine proof.</span>
            </h1>

            <p className="landing-hero-subtext">
              Veriflow gives you 6–7 universal browser testing commands that work on <em>every</em> website—regardless of genre or category. Speak your intent with Wispr Flow, watch Playwright Chromium execute live, and get real assertion telemetry.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
              <button
                onClick={onOpenWorkspace}
                className="btn-editorial-pill"
                id="hero-btn-start-testing"
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
              >
                <span>Launch Workspace</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span>Works with any public URL</span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span>Wispr Flow Dictation · Headless Chromium Automation · Zero Synthetic Mocks</span>
            </div>
          </div>

          {/* Right Column: Character Sketch + Live Execution Frame */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '-2rem', zIndex: 2 }}>
              <VeriHero width={220} height={220} />
            </div>

            <div className="device-frame" id="hero-device-frame" style={{ width: '100%', maxWidth: '440px' }}>
              {/* Voice Input Bubble */}
              <div className="device-voice-bubble">
                <div style={{ color: 'var(--bg-lavender-deep)', transform: 'translateY(2px)' }}>
                  <Mic size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>
                    Dictated with Wispr Flow
                  </div>
                  <div className="device-voice-text">
                    "Verify page title and check console for zero errors"
                  </div>
                </div>
              </div>

              {/* Playwright Browser Output Card */}
              <div className="device-browser-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', color: '#a1a1aa' }}>
                    PLAYWRIGHT CHROMIUM · REAL BROWSER RUN
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                    ● 2 TESTS PASS
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.35rem 0' }}>
                  <div className="device-step-row">
                    <span style={{ fontWeight: 600, color: '#f4f4f5' }}>[CMD-TITLE] Page Title & Identity</span>
                    <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>0.8s</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#a1a1aa', paddingLeft: '0.75rem', borderLeft: '2px solid #34d399' }}>
                    <div>✓ navigate('https://example.com')</div>
                    <div>✓ expect(page).toHaveTitle('Example Domain')</div>
                  </div>

                  <div className="device-step-row" style={{ marginTop: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#f4f4f5' }}>[CMD-CONSOLE] Zero Console Errors</span>
                    <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>1.1s</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#a1a1aa', paddingLeft: '0.75rem', borderLeft: '2px solid #34d399' }}>
                    <div>✓ page.on('pageerror', ...)</div>
                    <div>✓ expect(consoleErrors.length).toBe(0)</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #27272a', fontSize: '0.72rem', color: '#71717a' }}>
                  <span>Target: https://example.com</span>
                  <span style={{ color: '#fafafa', fontWeight: 600 }}>Hard Proof Only</span>
                </div>
              </div>

              {/* Bottom Assurance Note */}
              <div className="device-footer-note">
                <ShieldCheck size={16} color="var(--bg-lavender-deep)" />
                <span>Genuine Playwright Assertions. Never faked.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bold Accent Statement Band */}
      <section style={{ backgroundColor: 'var(--bg-coral)', padding: '2.5rem 0', color: '#ffffff', margin: '1rem 0 3rem' }}>
        <div className="container-editorial coral-band-inner">
          <div className="coral-main-title">
            Simple to understand.<br />
            Universal on every website.
          </div>

          <div className="coral-side-note" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            Not every site is an online store with an "Add to Cart" button. Veriflow focuses on universal building blocks that exist across <em>all</em> web applications: titles, headings, navigation bars, search inputs, console health, and mobile viewports.
            <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', color: '#ffffff', opacity: 0.9 }}>
              ANY PUBLIC URL → VOICE INTENT → PLAYWRIGHT CHROMIUM PROOF
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three-Step Visual Walkthrough with Veri Sketches */}
      <section className="container-editorial walkthrough-section">
        <div className="editorial-overline">
          How It Works in 3 Simple Steps
        </div>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.5rem' }}>
          Testing made effortless for everyone.
        </h2>

        <div className="walkthrough-grid" style={{ marginTop: '2.5rem' }}>
          {/* Step 1 */}
          <div className="walkthrough-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
              <VeriUrl width={130} height={130} />
            </div>
            <span className="walkthrough-num">01</span>
            <h3 className="walkthrough-heading">Enter any website URL.</h3>
            <p className="walkthrough-desc">
              Type or paste any public destination URL—whether it's your own staging app, a documentation site, or a public service. The built-in security shield validates safe DNS resolution.
            </p>
          </div>

          {/* Step 2 */}
          <div className="walkthrough-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
              <VeriVoice width={130} height={130} />
            </div>
            <span className="walkthrough-num">02</span>
            <h3 className="walkthrough-heading">Speak or pick a command.</h3>
            <p className="walkthrough-desc">
              Dictate naturally using Wispr Flow or choose from the 7 universal commands. Veriflow instantly translates your words into an executable browser test plan.
            </p>
          </div>

          {/* Step 3 */}
          <div className="walkthrough-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
              <VeriInspect width={130} height={130} />
            </div>
            <span className="walkthrough-num">03</span>
            <h3 className="walkthrough-heading">Watch real Playwright proof.</h3>
            <p className="walkthrough-desc">
              Watch real Chromium frames render in the live browser preview. Inspect step-by-step millisecond timing, assertion diffs, and export comprehensive test reports.
            </p>
          </div>
        </div>
      </section>

      {/* 4. The 7 Universal Commands Showcase */}
      <section className="container-editorial" style={{ padding: '3rem 2rem 4rem' }}>
        <div
          style={{
            border: '1.5px solid var(--border-dark)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-retro)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div className="editorial-overline">Universal Test Commands</div>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
                7 Commands Testable on Every Website
              </h3>
            </div>
            <button onClick={onOpenWorkspace} className="btn-editorial-pill">
              <span>Try in Workspace</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
            {UNIVERSAL_COMMANDS.map((cmd) => (
              <div
                key={cmd.id}
                style={{
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-canvas)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
                className="hover-lift"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.82rem', color: 'var(--bg-lavender-deep)' }}>
                    {cmd.id}
                  </span>
                  <span className="editorial-tag">{cmd.category}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-ink)' }}>
                  {cmd.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                  {cmd.description}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Asserts: {cmd.defaultAssertion}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final CTA Banner with Veri Celebration */}
      <section className="container-editorial" style={{ marginBottom: '4rem' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-lavender-subtle)',
            border: '1.5px solid var(--border-dark)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 2.5rem',
            boxShadow: 'var(--shadow-retro)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <VeriSuccess width={100} height={100} />
            <div>
              <div className="editorial-overline" style={{ color: 'var(--bg-lavender-deep)' }}>
                Ready to Verify Any Site?
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.35rem', color: 'var(--text-ink)' }}>
                Launch the workspace and speak your test.
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-body)', marginTop: '0.35rem' }}>
                Test Example Domain, Hacker News, Wikipedia, or your own application in seconds.
              </div>
            </div>
          </div>

          <button onClick={onOpenWorkspace} className="btn-editorial-pill" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <span>Open Workspace</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="editorial-footer">
        <div className="container-editorial editorial-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-ink)' }}>
              Veriflow <span className="editorial-brand-badge">*</span>
            </div>
            <span>Universal Voice-Directed Browser Testing</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>Built with Wispr Flow & Playwright</span>
            <button
              onClick={onOpenWorkspace}
              style={{ color: 'var(--text-body)', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Open Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
