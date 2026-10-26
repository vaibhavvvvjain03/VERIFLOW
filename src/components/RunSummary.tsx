import React from 'react';
import { RunSummary as IRunSummary } from '../../shared/types';

interface RunSummaryProps {
  summary: IRunSummary | null;
}

export const RunSummary: React.FC<RunSummaryProps> = ({ summary }) => {
  return (
    <div className="editorial-metrics-grid">
      <div className="editorial-metric-card" id="metric-total">
        <span className="editorial-overline">Total In Suite</span>
        <span className="editorial-metric-val">{summary?.total ?? 6}</span>
      </div>

      <div className="editorial-metric-card" id="metric-passed">
        <span className="editorial-overline" style={{ color: 'var(--status-pass)' }}>
          Passed
        </span>
        <span className="editorial-metric-val" style={{ color: 'var(--status-pass)' }}>
          {summary?.passed ?? 0}
        </span>
      </div>

      <div className="editorial-metric-card" id="metric-failed">
        <span
          className="editorial-overline"
          style={{ color: summary && summary.failed > 0 ? 'var(--status-fail)' : 'var(--text-muted)' }}
        >
          Failed
        </span>
        <span
          className="editorial-metric-val"
          style={{ color: summary && summary.failed > 0 ? 'var(--status-fail)' : 'var(--text-ink)' }}
        >
          {summary?.failed ?? 0}
        </span>
      </div>

      <div className="editorial-metric-card" id="metric-duration">
        <span className="editorial-overline">Run Duration</span>
        <span className="editorial-metric-val" style={{ fontFamily: 'var(--font-mono)' }}>
          {summary ? `${(summary.durationMs / 1000).toFixed(2)}s` : '0.00s'}
        </span>
      </div>
    </div>
  );
};
