import React, { useState } from 'react';
import { CommandBar } from '../components/CommandBar';
import { TargetUrlInput } from '../components/TargetUrlInput';
import { PlanReviewBox } from '../components/PlanReviewBox';
import { BrowserPreview } from '../components/BrowserPreview';
import { RunTimeline } from '../components/RunTimeline';
import { EvidencePanel } from '../components/EvidencePanel';
import {
  UNIVERSAL_COMMANDS,
  RunRecord,
  ParsedCommand,
  StepEvent,
  TestPlan,
} from '../../shared/types';
import { Terminal, Compass, Play, Globe, Activity, Eye, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { VeriInspect, VeriSuccess, VeriEmpty } from '../components/CharacterSketches';
import { createUniversalPlan } from '../features/commands/universalPlans';

interface DashboardPageProps {
  currentRun: RunRecord | null;
  onExecuteCommand: (command: ParsedCommand) => void;
  isRunning: boolean;
  onExportReport: () => void;
  targetUrl: string;
  onChangeTargetUrl: (url: string) => void;
  pendingPlan: TestPlan | null;
  onConfirmPlan: (plan: TestPlan) => void;
  onDismissPlan: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentRun,
  onExecuteCommand,
  isRunning,
  onExportReport,
  targetUrl,
  onChangeTargetUrl,
  pendingPlan,
  onConfirmPlan,
  onDismissPlan,
}) => {
  const [selectedUniversalId, setSelectedUniversalId] = useState<string>('CMD-TITLE');
  const [leftTab, setLeftTab] = useState<'commands' | 'telemetry'>('commands');
  const [rightTab, setRightTab] = useState<'preview' | 'evidence'>('preview');

  const activePlanId = currentRun?.plan?.id;
  const effectiveSelectedId = activePlanId || selectedUniversalId;

  const currentTemplate = UNIVERSAL_COMMANDS.find((c) => c.id === effectiveSelectedId) || UNIVERSAL_COMMANDS[0];

  const selectedCatalogItem = {
    id: effectiveSelectedId,
    name: currentRun?.plan?.name || currentTemplate.name,
    description: currentRun?.plan?.description || currentTemplate.description,
    tag: currentTemplate.category,
    expectedBehavior: currentTemplate.defaultAssertion,
  };

  const selectedTestResult = currentRun?.results
    ? currentRun.results[effectiveSelectedId] || Object.values(currentRun.results)[0]
    : undefined;

  const activeSteps: StepEvent[] = selectedTestResult?.steps || [];

  const handleSelectUniversalCommand = (cmdId: string) => {
    setSelectedUniversalId(cmdId);
    const plan = createUniversalPlan(cmdId, targetUrl);
    if (plan) {
      onExecuteCommand({
        raw: cmdId,
        action: 'execute_plan',
        testIds: [cmdId],
        plan,
        explanation: `Universal Command: ${plan.name} on ${targetUrl}`,
        isValid: true,
      });
    }
  };

  const handleRunCommandDirect = (cmdId: string) => {
    setSelectedUniversalId(cmdId);
    setLeftTab('telemetry');
    const plan = createUniversalPlan(cmdId, targetUrl);
    if (plan) {
      onConfirmPlan(plan);
    }
  };

  return (
    <div className="bg-dotted" style={{ minHeight: 'calc(100vh - 70px)', padding: '1rem 0 2rem 0' }}>
      <div className="container-editorial" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* TOP HUD BAR: TARGET SELECTOR & STATUS */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          {/* Target URL Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-ink)' }}>
              <Globe size={16} color="var(--bg-lavender-deep)" />
              <span>Target Website:</span>
            </div>

            <code
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                backgroundColor: 'var(--bg-surface-alt)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-xs)',
                border: '1.5px solid var(--border-subtle)',
                color: 'var(--text-ink)',
                fontWeight: 700,
              }}
            >
              {targetUrl}
            </code>
          </div>

          {/* Right Status Badge & Runner Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.72rem',
                fontWeight: 800,
                backgroundColor: isRunning
                  ? '#eff6ff'
                  : currentRun?.status === 'passed'
                  ? '#f0fdf4'
                  : currentRun?.status === 'failed'
                  ? '#fef2f2'
                  : 'var(--bg-surface-alt)',
                color: isRunning
                  ? '#1d4ed8'
                  : currentRun?.status === 'passed'
                  ? '#15803d'
                  : currentRun?.status === 'failed'
                  ? '#b91c1c'
                  : 'var(--text-muted)',
                border: '1px solid currentColor',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                }}
              />
              {isRunning
                ? 'TEST RUNNING'
                : currentRun
                ? `RUN: ${currentRun.status.toUpperCase()}`
                : 'ENGINE IDLE'}
            </span>

            <span className="editorial-tag" style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}>
              <Terminal size={11} />
              PLAYWRIGHT CHROMIUM
            </span>
          </div>
        </div>

        {/* CENTRAL TARGET WEBSITE URL SELECTOR */}
        <TargetUrlInput
          url={targetUrl}
          onChangeUrl={onChangeTargetUrl}
          isRunning={isRunning}
        />

        {/* WISPR FLOW CONSOLE & QUICK DEMO STRIP */}
        <CommandBar
          onExecuteCommand={onExecuteCommand}
          isRunning={isRunning}
          onExportReport={onExportReport}
          targetUrl={targetUrl}
          onChangeTargetUrl={onChangeTargetUrl}
        />

        {/* PENDING PLAN MODAL / BOX */}
        {pendingPlan && (
          <div style={{ marginBottom: '1rem' }}>
            <PlanReviewBox
              plan={pendingPlan}
              onExecutePlan={(p) => {
                setLeftTab('telemetry');
                onConfirmPlan(p);
              }}
              onDismiss={onDismissPlan}
              isRunning={isRunning}
            />
          </div>
        )}

        {/* 2-COLUMN SYNCHRONIZED COCKPIT (One-Hand Ergonomics, zero vertical blowout) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(380px, 42%) minmax(450px, 58%)',
            gap: '1rem',
            alignItems: 'start',
          }}
          className="cockpit-grid"
        >
          {/* LEFT PANE: COMMAND & EXECUTION CENTER */}
          <div
            style={{
              backgroundColor: leftTab === 'commands' ? '#fffdfa' : '#f8fcff',
              border: leftTab === 'commands' ? '1.5px solid #fde68a' : '1.5px solid #7dd3fc',
              borderRadius: 'var(--radius-md)',
              boxShadow: leftTab === 'commands'
                ? '3px 3px 0px rgba(217, 119, 6, 0.22)'
                : '3px 3px 0px rgba(2, 132, 199, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Left Header Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                borderBottom: leftTab === 'commands' ? '1.5px solid #fde68a' : '1.5px solid #7dd3fc',
                backgroundColor: leftTab === 'commands' ? '#fffbeb' : '#f0f9ff',
              }}
            >
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setLeftTab('commands')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    fontWeight: leftTab === 'commands' ? 800 : 600,
                    border: leftTab === 'commands' ? '1.5px solid #d97706' : '1px solid transparent',
                    backgroundColor: leftTab === 'commands' ? '#ffffff' : 'transparent',
                    color: leftTab === 'commands' ? '#b45309' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  id="tab-universal-commands"
                >
                  <Compass size={13} color="#d97706" />
                  <span>Universal Commands (7)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeftTab('telemetry')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    fontWeight: leftTab === 'telemetry' ? 800 : 600,
                    border: leftTab === 'telemetry' ? '1.5px solid #0284c7' : '1px solid transparent',
                    backgroundColor: leftTab === 'telemetry' ? '#ffffff' : 'transparent',
                    color: leftTab === 'telemetry' ? '#0369a1' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  id="tab-execution-telemetry"
                >
                  <Activity size={13} color="#0284c7" />
                  <span>Execution Steps</span>
                  {activeSteps.length > 0 && (
                    <span
                      style={{
                        padding: '0.1rem 0.35rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                      }}
                    >
                      {activeSteps.length}
                    </span>
                  )}
                </button>
              </div>

              <div
                style={{
                  fontSize: '0.7rem',
                  color: leftTab === 'commands' ? '#b45309' : '#0369a1',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              >
                {leftTab === 'commands' ? '1-CLICK SUITE' : 'STREAMING TELEMETRY'}
              </div>
            </div>

            {/* Left Content Area */}
            <div style={{ padding: '0.85rem', maxHeight: '520px', overflowY: 'auto' }}>
              {leftTab === 'commands' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {UNIVERSAL_COMMANDS.map((cmd) => {
                    const isSelected = effectiveSelectedId === cmd.id;
                    const result = currentRun?.results ? currentRun.results[cmd.id] : undefined;

                    return (
                      <div
                        key={cmd.id}
                        onClick={() => handleSelectUniversalCommand(cmd.id)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1.5px solid #d97706' : '1px solid #fde68a',
                          backgroundColor: isSelected ? '#fef3c7' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                        }}
                        className="universal-command-item"
                        id={`chip-${cmd.id}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: isSelected ? '#b45309' : '#d97706',
                              }}
                            >
                              {cmd.id}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-ink)' }}>
                              {cmd.name}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {result && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  color: result.status === 'passed' ? '#16a34a' : '#dc2626',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                }}
                              >
                                {result.status === 'passed' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                {result.status.toUpperCase()}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRunCommandDirect(cmd.id);
                              }}
                              disabled={isRunning}
                              style={{
                                padding: '0.2rem 0.55rem',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                borderRadius: 'var(--radius-xs)',
                                backgroundColor: '#d97706',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              title={`Execute ${cmd.name} on ${targetUrl}`}
                              id={`btn-run-${cmd.id}`}
                            >
                              <Play size={9} />
                              <span>Run</span>
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {cmd.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Telemetry View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <RunTimeline
                    steps={activeSteps}
                    testName={`${selectedCatalogItem.id} — ${selectedCatalogItem.name}`}
                  />
                </div>
              )}
            </div>

            {/* Veri Mini Scout Footer in Left Pane */}
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderTop: leftTab === 'commands' ? '1px solid #fde68a' : '1px solid #7dd3fc',
                backgroundColor: leftTab === 'commands' ? '#fffbeb' : '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {isRunning ? (
                  <VeriInspect width={44} height={44} />
                ) : currentRun?.status === 'passed' ? (
                  <VeriSuccess width={44} height={44} />
                ) : (
                  <VeriEmpty width={44} height={44} />
                )}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                <strong style={{ color: 'var(--text-ink)' }}>Veri Scout:</strong>{' '}
                {isRunning
                  ? 'Executing Playwright actions in isolated Chromium context...'
                  : currentRun?.status === 'passed'
                  ? 'Test completed successfully with verified assertions!'
                  : currentRun?.status === 'failed'
                  ? 'Assertion or element failure observed. Inspect evidence on the right.'
                  : 'Select any command or speak into Wispr Flow to execute.'}
              </div>
            </div>
          </div>

          {/* RIGHT PANE: LIVE CHROMIUM PREVIEW & EVIDENCE */}
          <div
            style={{
              backgroundColor: rightTab === 'preview' ? '#ffffff' : '#fffafa',
              border: rightTab === 'preview' ? '2px solid #0f172a' : '1.5px solid #fca5a5',
              borderRadius: 'var(--radius-md)',
              boxShadow: rightTab === 'preview' ? '4px 4px 0px #0f172a' : '3px 3px 0px rgba(225, 29, 72, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Right Header: Metrics & View Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                borderBottom: rightTab === 'preview' ? '2px solid #0f172a' : '1.5px solid #fca5a5',
                backgroundColor: rightTab === 'preview' ? '#0f172a' : '#fff1f2',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              {/* Summary Stats Strip or Window Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem' }}>
                {rightTab === 'preview' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.4rem' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  </div>
                ) : null}

                <span style={{ color: rightTab === 'preview' ? '#94a3b8' : 'var(--text-muted)' }}>
                  Total: <strong style={{ color: rightTab === 'preview' ? '#ffffff' : 'var(--text-ink)' }}>{currentRun?.summary?.total || 0}</strong>
                </span>
                <span style={{ color: '#22c55e' }}>
                  Passed: <strong>{currentRun?.summary?.passed || 0}</strong>
                </span>
                <span style={{ color: '#ef4444' }}>
                  Failed: <strong>{currentRun?.summary?.failed || 0}</strong>
                </span>
                {currentRun?.summary?.durationMs ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: rightTab === 'preview' ? '#94a3b8' : 'var(--text-muted)',
                      fontSize: '0.72rem',
                    }}
                  >
                    {currentRun.summary.durationMs}ms
                  </span>
                ) : null}
              </div>

              {/* View Switcher: Live Chromium vs Evidence */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setRightTab('preview')}
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    fontWeight: rightTab === 'preview' ? 800 : 600,
                    border: rightTab === 'preview' ? '1px solid #38bdf8' : '1px solid transparent',
                    backgroundColor: rightTab === 'preview' ? '#1e293b' : 'transparent',
                    color: rightTab === 'preview' ? '#38bdf8' : rightTab === 'evidence' ? 'var(--text-muted)' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  id="tab-live-preview"
                >
                  <Eye size={13} color={rightTab === 'preview' ? '#38bdf8' : 'currentColor'} />
                  <span>Live Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightTab('evidence')}
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    fontWeight: rightTab === 'evidence' ? 800 : 600,
                    border: rightTab === 'evidence' ? '1.5px solid #e11d48' : '1px solid transparent',
                    backgroundColor: rightTab === 'evidence' ? '#ffffff' : 'transparent',
                    color: rightTab === 'evidence' ? '#be123c' : rightTab === 'preview' ? '#94a3b8' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  id="tab-evidence-panel"
                >
                  <ShieldCheck size={13} color={rightTab === 'evidence' ? '#e11d48' : 'currentColor'} />
                  <span>Evidence & Logs</span>
                </button>
              </div>
            </div>

            {/* Right Pane Body */}
            <div style={{ padding: '0.85rem', maxHeight: '580px', overflowY: 'auto' }}>
              {rightTab === 'preview' ? (
                <BrowserPreview currentRun={currentRun} isRunning={isRunning} />
              ) : (
                <EvidencePanel
                  selectedCatalogItem={selectedCatalogItem}
                  result={selectedTestResult}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
