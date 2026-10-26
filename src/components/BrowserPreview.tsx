import React, { useState } from 'react';
import { Monitor, RefreshCw, Maximize2, X } from 'lucide-react';
import { RunRecord } from '../../shared/types';

interface BrowserPreviewProps {
  currentRun: RunRecord | null;
  isRunning: boolean;
}

export const BrowserPreview: React.FC<BrowserPreviewProps> = ({ currentRun, isRunning }) => {
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const previewFrames = currentRun?.previewFrames || [];
  const latestFrameUrl = currentRun?.latestPreviewUrl || (previewFrames.length > 0 ? previewFrames[previewFrames.length - 1].imageUrl : null);
  const activeFrame = selectedFrame || latestFrameUrl;

  const currentStep = currentRun?.results
    ? Object.values(currentRun.results)[0]?.steps?.slice(-1)[0]
    : undefined;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-subtle)',
        marginBottom: '1.75rem',
      }}
      id="browser-preview-panel"
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          backgroundColor: '#fbfbfe',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Monitor size={17} color="var(--bg-lavender-deep)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Headless Browser Execution Preview
          </span>
          <span
            style={{
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              backgroundColor: isRunning
                ? '#fef3c7'
                : currentRun?.status === 'passed'
                ? '#dcfce7'
                : currentRun?.status === 'failed'
                ? '#fee2e2'
                : 'var(--bg-surface-alt)',
              color: isRunning
                ? '#b45309'
                : currentRun?.status === 'passed'
                ? '#15803d'
                : currentRun?.status === 'failed'
                ? '#b91c1c'
                : 'var(--text-muted)',
            }}
          >
            {isRunning ? '● RUNNING' : currentRun?.status?.toUpperCase() || 'IDLE'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Target:</span>
          <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 600 }}>
            {currentRun?.targetUrl || 'None'}
          </code>
        </div>
      </div>

      {/* Honest Preview Notice (PRE-006, PRE-007) */}
      <div
        style={{
          padding: '0.5rem 1.25rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '0.72rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span>
          <strong>Honest Execution Telemetry:</strong> Playwright executes in an isolated headless Chromium process. Frames reflect actual captured browser viewports per action/assertion milestone.
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {previewFrames.length} {previewFrames.length === 1 ? 'frame' : 'frames'} recorded
        </span>
      </div>

      {/* Viewport Display Area */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#0f172a',
          minHeight: '260px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {activeFrame ? (
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <img
              src={activeFrame}
              alt="Browser execution frame"
              onError={(e) => {
                const fallback = previewFrames[0]?.imageUrl;
                if (fallback && e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
              style={{
                maxWidth: '100%',
                maxHeight: '440px',
                objectFit: 'contain',
                display: 'block',
              }}
              id="active-preview-image"
            />

            {/* Expand / Maximize button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.35rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.7rem',
              }}
              title="View full resolution frame"
            >
              <Maximize2 size={13} />
              <span>Full View</span>
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
            {isRunning ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <RefreshCw size={24} className="spin-animation" color="var(--bg-lavender-subtle)" />
                <span style={{ fontSize: '0.85rem' }}>Automating headless Chromium... Awaiting milestone frame</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Monitor size={32} color="#475569" />
                <span style={{ fontSize: '0.85rem' }}>No active browser execution frame to display.</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Execute a test plan to inspect live browser milestones and failure evidence.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Current Active Step Badge */}
        {isRunning && currentStep && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#f8fafc',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span style={{ color: '#38bdf8' }}>▶</span>
            <span>{currentStep.label}</span>
          </div>
        )}
      </div>

      {/* Frame Scrubber / Gallery */}
      {previewFrames.length > 0 && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', flexShrink: 0 }}>
            Execution Timeline:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {previewFrames.map((frame, idx) => (
              <button
                key={frame.imageUrl + idx}
                type="button"
                onClick={() => setSelectedFrame(frame.imageUrl)}
                style={{
                  border: (selectedFrame === frame.imageUrl || (!selectedFrame && idx === previewFrames.length - 1))
                    ? '2px solid var(--bg-lavender-deep)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '2px',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
                title={frame.stepLabel}
              >
                <img
                  src={frame.imageUrl}
                  alt={`Step ${frame.stepIndex}`}
                  onError={(e) => {
                    const fallback = previewFrames[0]?.imageUrl;
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  style={{ width: '64px', height: '38px', objectFit: 'cover', borderRadius: '2px' }}
                />
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-muted)' }}>
                  Step {frame.stepIndex}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full-Screen Modal */}
      {isModalOpen && activeFrame && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '92vh',
              backgroundColor: '#0f172a',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #334155', color: '#f8fafc' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Browser Viewport Inspection</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={activeFrame}
              alt="High resolution frame"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
