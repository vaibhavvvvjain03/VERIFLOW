import React from 'react';
import { FileSearch, CheckCircle2, XCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { TestResult, TestCatalogItem } from '../../shared/types';

interface EvidencePanelProps {
  selectedCatalogItem: TestCatalogItem | null;
  result?: TestResult;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  selectedCatalogItem,
  result,
}) => {
  if (!selectedCatalogItem) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #fecdd3',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.65rem 0.85rem',
            backgroundColor: '#fff1f2',
            borderBottom: '1px solid #fecdd3',
          }}
        >
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#be123c', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileSearch size={16} color="#e11d48" />
            <span>Evidence Inspector</span>
          </h2>
        </div>
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileSearch size={28} style={{ opacity: 0.35, margin: '0 auto 0.5rem', color: '#e11d48' }} />
          <p style={{ fontSize: '0.82rem' }}>Select a test from the catalog to inspect assertions and artifacts.</p>
        </div>
      </div>
    );
  }

  const isPass = result?.status === 'passed';
  const isFail = result?.status === 'failed';
  const isInfraError = result?.status === 'infrastructure_error';
  const isSkipped = result?.status === 'skipped';
  const isQueued = result?.status === 'queued';
  const isRunning = result?.status === 'running';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #fecdd3',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
      id="evidence-panel"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.85rem',
          backgroundColor: '#fff1f2',
          borderBottom: '1px solid #fecdd3',
        }}
      >
        <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#be123c', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileSearch size={16} color="#e11d48" />
          <span>Evidence: {selectedCatalogItem.id}</span>
        </h2>

        {isPass && (
          <span className="status-pill status-pill-pass">
            <CheckCircle2 size={13} /> Verified
          </span>
        )}
        {isFail && (
          <span className="status-pill status-pill-fail">
            <XCircle size={13} /> Failed
          </span>
        )}
        {isInfraError && (
          <span className="status-pill status-pill-fail" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
            <AlertTriangle size={13} /> Infra Error
          </span>
        )}
        {isSkipped && (
          <span className="status-pill status-pill-idle">
            Skipped
          </span>
        )}
        {isQueued && (
          <span className="status-pill status-pill-idle" style={{ backgroundColor: '#f4f4f5' }}>
            Queued
          </span>
        )}
        {isRunning && (
          <span className="status-pill status-pill-running">
            Running...
          </span>
        )}
        {!result && (
          <span className="status-pill status-pill-idle">
            Not Run Yet
          </span>
        )}
      </div>

      <div className="evidence-content">
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-ink)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            {selectedCatalogItem.name}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
            {selectedCatalogItem.description}
          </p>
        </div>

        {/* Expected Contract Callout */}
        <div
          style={{
            backgroundColor: 'var(--bg-lavender-subtle)',
            border: '1.5px solid var(--border-dark)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            fontSize: '0.85rem',
          }}
        >
          <div className="editorial-overline" style={{ color: 'var(--bg-lavender-deep)', marginBottom: '0.25rem' }}>
            Expected Contract Assertion
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-ink)' }}>
            {selectedCatalogItem.expectedBehavior}
          </div>
        </div>

        {result ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas)' }}>
                <span className="editorial-overline">Execution Status</span>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', marginTop: '0.2rem', color: isPass ? 'var(--status-pass)' : 'var(--status-fail)' }}>
                  {result.status}
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas)' }}>
                <span className="editorial-overline">Duration</span>
                <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  {result.durationMs}ms
                </div>
              </div>
            </div>

            {/* Error & Assertion Failure Diff */}
            {result.error && (
              <div className="evidence-diff-box" id="evidence-error-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--status-fail)', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={16} />
                  <span>Playwright Assertion Failure</span>
                </div>
                <pre
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.775rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: '#9f1239',
                    lineHeight: 1.5,
                  }}
                >
                  {result.error}
                </pre>
              </div>
            )}

            {/* Captured Screenshot Artifact */}
            {result.screenshotUrl && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={16} color="var(--bg-lavender-deep)" />
                  <span>Failure Screenshot Artifact</span>
                </div>
                <div className="evidence-screenshot-box">
                  <img
                    src={result.screenshotUrl}
                    alt={`Failure screenshot for ${selectedCatalogItem.id}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    id="failure-screenshot-img"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            This test has not run yet in the current session. Run it from the workspace or trigger with Wispr Flow.
          </div>
        )}
      </div>
    </div>
  );
};
