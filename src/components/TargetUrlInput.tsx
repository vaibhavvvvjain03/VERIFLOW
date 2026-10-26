import React, { useState, useEffect } from 'react';
import { Globe, Shield, AlertTriangle, CheckCircle, Lock, Unlock } from 'lucide-react';
import { validateTargetUrlApi } from '../features/runs/runApi';
import { UrlValidationResult } from '../../server/urlSecurity';

interface TargetUrlInputProps {
  url: string;
  onChangeUrl: (url: string) => void;
  isRunning: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export const TargetUrlInput: React.FC<TargetUrlInputProps> = ({
  url,
  onChangeUrl,
  isRunning,
  onValidationChange,
}) => {
  const [validation, setValidation] = useState<UrlValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    if (!url.trim()) {
      setValidation(null);
      if (onValidationChange) onValidationChange(false);
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(() => {
      validateTargetUrlApi(url)
        .then((res: UrlValidationResult) => {
          if (active) {
            setValidation(res);
            setIsValidating(false);
            if (onValidationChange) onValidationChange(res.valid);
          }
        })
        .catch(() => {
          if (active) {
            setValidation({ valid: false, error: 'Could not contact backend URL safety validator' });
            setIsValidating(false);
            if (onValidationChange) onValidationChange(false);
          }
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [url]);

  const quickPresets = [
    { label: 'WeMakeDevs', url: 'https://www.wemakedevs.org' },
    { label: 'Example Domain', url: 'https://example.com' },
    { label: 'Hacker News', url: 'https://news.ycombinator.com' },
    { label: 'Wikipedia', url: 'https://en.wikipedia.org' },
    { label: 'httpbin', url: 'https://httpbin.org' },
    { label: 'Playwright Docs', url: 'https://playwright.dev' },
  ];

  return (
    <div
      style={{
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #86efac',
        borderRadius: 'var(--radius-md)',
        padding: '1.15rem 1.35rem',
        marginBottom: '1rem',
        boxShadow: '3px 3px 0px rgba(22, 101, 52, 0.22)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      id="target-url-container"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.65rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Globe size={14} color="#15803d" />
          </div>
          <label
            htmlFor="target-url-input"
            style={{ fontWeight: 800, fontSize: '0.88rem', color: '#14532d' }}
          >
            Target Website URL
          </label>
          <span style={{ fontSize: '0.74rem', color: '#166534' }}>
            (Enter any public website across any genre to test)
          </span>
        </div>

        <div
          style={{
            fontSize: '0.7rem',
            color: '#15803d',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            backgroundColor: '#dcfce7',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid #86efac',
          }}
        >
          SSRF SECURITY SHIELD ACTIVE
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 320px' }}>
          <input
            id="target-url-input"
            type="text"
            value={url}
            onChange={(e) => onChangeUrl(e.target.value)}
            disabled={isRunning}
            placeholder="e.g. https://example.com, https://news.ycombinator.com, https://playwright.dev"
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem 0.7rem 2.25rem',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-mono)',
              border: validation
                ? validation.valid
                  ? '1.5px solid #10b981'
                  : '1.5px solid #ef4444'
                : '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isRunning ? 'var(--bg-surface-alt)' : '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {url.startsWith('https://') ? (
              <span title="HTTPS Secure Transport">
                <Lock size={15} color="#10b981" />
              </span>
            ) : url.startsWith('http://') ? (
              <span title="HTTP Unencrypted Transport">
                <Unlock size={15} color="#f59e0b" />
              </span>
            ) : (
              <Globe size={15} color="var(--text-muted)" />
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {quickPresets.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => onChangeUrl(preset.url)}
              disabled={isRunning}
              style={{
                fontSize: '0.74rem',
                padding: '0.4rem 0.65rem',
                backgroundColor: url === preset.url ? '#dcfce7' : '#ffffff',
                border: url === preset.url ? '1.5px solid #16a34a' : '1px solid #bbf7d0',
                color: url === preset.url ? '#14532d' : '#166534',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                fontWeight: url === preset.url ? 800 : 600,
                transition: 'all 0.15s ease',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Validation Feedback */}
      {isValidating && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>Verifying URL safety and DNS destination...</span>
        </div>
      )}

      {validation && !isValidating && (
        <div style={{ marginTop: '0.65rem' }}>
          {validation.valid ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.78rem',
                color: '#166534',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
              id="url-valid-pill"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#16a34a" />
                <span>
                  <strong>Target Validated:</strong> {validation.normalizedUrl}
                </span>
                {validation.protocol === 'http:' && (
                  <span style={{ color: '#b45309', fontWeight: 600 }}> (Unencrypted HTTP)</span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#15803d' }}>
                Host: {validation.host} · Port: {validation.port}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.78rem',
                color: '#991b1b',
              }}
              id="url-error-pill"
            >
              <AlertTriangle size={15} color="#dc2626" />
              <span>
                <strong>Safety Policy Block:</strong> {validation.error}
              </span>
            </div>
          )}

          {validation.warning && (
            <div
              style={{
                marginTop: '0.35rem',
                fontSize: '0.72rem',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Shield size={12} color="#f59e0b" />
              <span>{validation.warning}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
