import React from 'react';
import { CheckCircle2, XCircle, Clock, ListChecks } from 'lucide-react';
import { TEST_CATALOG, TestId, TestResult } from '../../shared/types';

interface TestCatalogProps {
  selectedTestId: TestId | null;
  onSelectTest: (id: TestId) => void;
  checkedTestIds: TestId[];
  onToggleCheckedTest: (id: TestId) => void;
  results: Record<TestId, TestResult> | null;
  runningTestId?: TestId;
}

export const TestCatalog: React.FC<TestCatalogProps> = ({
  selectedTestId,
  onSelectTest,
  checkedTestIds,
  onToggleCheckedTest,
  results,
  runningTestId,
}) => {
  return (
    <div className="editorial-card">
      <div className="editorial-card-header">
        <h2 className="editorial-card-title">
          <ListChecks size={20} color="var(--bg-lavender-deep)" />
          <span>Test Catalog ({TEST_CATALOG.length})</span>
        </h2>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          TARGET: <code>Universal Public URL</code>
        </div>
      </div>

      <div>
        {TEST_CATALOG.map((test) => {
          const result = results ? results[test.id] : undefined;
          const isSelected = selectedTestId === test.id;
          const isChecked = checkedTestIds.includes(test.id);
          const isRunning = runningTestId === test.id || result?.status === 'running';
          const isFailed = result?.status === 'failed';
          const isInfraError = result?.status === 'infrastructure_error';
          const isSkipped = result?.status === 'skipped';
          const isQueued = result?.status === 'queued';

          let statusBadge = (
            <span className="status-pill status-pill-idle" id={`status-${test.id}`}>
              ○ IDLE
            </span>
          );

          if (isRunning) {
            statusBadge = (
              <span className="status-pill status-pill-running" id={`status-${test.id}`}>
                <Clock size={12} className="spin" /> RUNNING
              </span>
            );
          } else if (isQueued) {
            statusBadge = (
              <span className="status-pill status-pill-idle" id={`status-${test.id}`} style={{ backgroundColor: '#f4f4f5' }}>
                ⧗ QUEUED
              </span>
            );
          } else if (result?.status === 'passed') {
            statusBadge = (
              <span className="status-pill status-pill-pass" id={`status-${test.id}`}>
                <CheckCircle2 size={12} /> PASS
              </span>
            );
          } else if (isFailed) {
            statusBadge = (
              <span className="status-pill status-pill-fail" id={`status-${test.id}`}>
                <XCircle size={12} /> FAIL
              </span>
            );
          } else if (isInfraError) {
            statusBadge = (
              <span className="status-pill status-pill-fail" id={`status-${test.id}`} style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                ⚠ ERROR
              </span>
            );
          } else if (isSkipped) {
            statusBadge = (
              <span className="status-pill status-pill-idle" id={`status-${test.id}`}>
                ⊘ SKIPPED
              </span>
            );
          }

          return (
            <div
              key={test.id}
              onClick={() => onSelectTest(test.id)}
              className={`editorial-test-row ${isSelected ? 'active' : ''} ${isFailed ? 'failed-row' : ''}`}
              id={`test-row-${test.id}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleCheckedTest(test.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  id={`checkbox-${test.id}`}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: 'var(--text-ink)',
                  }}
                />

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    backgroundColor: isFailed ? '#fee2e2' : 'var(--bg-surface-alt)',
                    color: isFailed ? 'var(--status-fail)' : 'var(--text-ink)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-dark)',
                  }}
                >
                  {test.id}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-ink)' }}>
                      {test.name}
                    </span>
                    <span className="editorial-tag">{test.tag}</span>
                  </div>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {test.description}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {result?.durationMs ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {result.durationMs}ms
                  </span>
                ) : null}
                {statusBadge}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
