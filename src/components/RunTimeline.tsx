import React from 'react';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { StepEvent } from '../../shared/types';

interface RunTimelineProps {
  steps: StepEvent[];
  testName?: string;
}

export const RunTimeline: React.FC<RunTimelineProps> = ({ steps, testName }) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #bae6fd',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.85rem',
          backgroundColor: '#f0f9ff',
          borderBottom: '1px solid #bae6fd',
        }}
      >
        <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Activity size={16} color="#0284c7" />
          <span>Execution Telemetry {testName ? `— ${testName}` : ''}</span>
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
          {steps.length} {steps.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div style={{ padding: '0.85rem', maxHeight: '380px', overflowY: 'auto' }}>
        {steps.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }} id="timeline-empty-state">
            <Activity size={28} style={{ opacity: 0.35, margin: '0 auto 0.5rem', color: '#0284c7' }} />
            <div style={{ fontWeight: 800, color: 'var(--text-ink)', marginBottom: '0.2rem', fontSize: '0.85rem' }}>
              No Telemetry Recorded
            </div>
            <div style={{ fontSize: '0.78rem' }}>
              Run a test or dictate with Wispr Flow to stream real-time browser telemetry.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {steps.map((step) => {
              const isPass = step.status === 'passed';
              const isFail = step.status === 'failed';
              const isRunning = step.status === 'running';

              return (
                <div
                  key={step.stepId}
                  id={`timeline-step-${step.stepId}`}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: isFail ? '1px solid #fca5a5' : isPass ? '1px solid #86efac' : '1px solid #bae6fd',
                    backgroundColor: isFail ? '#fff1f2' : isPass ? '#f0fdf4' : '#f0f9ff',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ marginTop: '0.15rem' }}>
                    {isPass && <CheckCircle2 size={16} color="var(--status-pass)" />}
                    {isFail && <XCircle size={16} color="var(--status-fail)" />}
                    {isRunning && <Clock size={16} color="var(--status-running)" className="spin" />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-ink)' }}>
                        {step.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {step.durationMs}ms
                      </span>
                    </div>

                    {step.assertionDiff && (
                      <div
                        style={{
                          marginTop: '0.4rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: 'var(--radius-xs)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: '#991b1b',
                        }}
                      >
                        <div><strong>Assertion Mismatch:</strong></div>
                        <div>Expected: <code>{JSON.stringify(step.assertionDiff.expected)}</code></div>
                        <div>Actual: <code>{JSON.stringify(step.assertionDiff.actual)}</code></div>
                      </div>
                    )}

                    {step.error && (
                      <div style={{ color: 'var(--status-fail)', fontSize: '0.775rem', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                        {step.error}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
