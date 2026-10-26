import React, { useState, useEffect } from 'react';
import { Mic, Download, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { parseCommand } from '../features/commands/parseCommand';
import { ParsedCommand } from '../../shared/types';

interface CommandBarProps {
  onExecuteCommand: (command: ParsedCommand) => void;
  isRunning: boolean;
  onExportReport: () => void;
  targetUrl?: string;
  onChangeTargetUrl?: (url: string) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  onExecuteCommand,
  isRunning,
  onExportReport,
  targetUrl = 'https://www.wemakedevs.org',
}) => {
  const [inputText, setInputText] = useState('');
  const [parsed, setParsed] = useState<ParsedCommand | null>(null);

  useEffect(() => {
    if (inputText.trim()) {
      const result = parseCommand(inputText, [], targetUrl);
      setParsed(result);
    } else {
      setParsed(null);
    }
  }, [inputText, targetUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed) return;
    if (parsed.isValid) {
      onExecuteCommand(parsed);
      setInputText('');
    }
  };

  return (
    <div
      className="command-console"
      style={{
        padding: '0.9rem 1.25rem',
        marginBottom: '1rem',
        backgroundColor: '#faf5ff',
        border: '1.5px solid #c084fc',
        borderRadius: 'var(--radius-md)',
        boxShadow: '3px 3px 0px rgba(124, 58, 237, 0.22)',
      }}
    >
      <div className="command-console-top" style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="wispr-badge">
            <span className="wispr-pulse"></span>
            <span>WISPR FLOW VOICE CONSOLE</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Speak naturally with Wispr Flow or type your test query.
          </span>
        </div>

        <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} color="var(--bg-lavender-deep)" />
          <span>ZERO ARTIFICIAL INJECTION · 100% GENUINE PLAYWRIGHT</span>
        </div>
      </div>

      {/* Wispr Command Input Form */}
      <form onSubmit={handleSubmit} className="command-console-input-wrap">
        <Mic className="command-console-icon" size={18} />
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='Dictate with Wispr Flow (e.g. "Locate the No Hands challenge and verify Project Ideas section", "Verify page title", "Check console errors")'
          className="command-console-input"
          id="wispr-command-input"
          disabled={isRunning}
          autoFocus
        />
        <button
          type="submit"
          disabled={isRunning || !parsed?.isValid}
          className="btn-editorial-pill"
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          id="btn-submit-wispr"
        >
          <span>Run</span>
          <ArrowRight size={13} />
        </button>
      </form>

      {/* Parsed Plan Banner Feedback */}
      {parsed && (
        <div className="console-plan-box" id="command-plan-banner" style={{ marginTop: '0.65rem' }}>
          <div className="console-plan-text">
            <Sparkles size={16} color="var(--bg-lavender-deep)" />
            <span>
              <strong>Parsed Action Plan:</strong> {parsed.explanation}
            </span>
          </div>

          {parsed.isValid && (
            <button
              type="button"
              onClick={() => {
                onExecuteCommand(parsed);
                setInputText('');
              }}
              disabled={isRunning}
              className="btn-editorial-pill"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
              id="btn-execute-parsed-plan"
            >
              <span>Review & Execute</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      )}

      {/* Bottom Action Strip: Clean status & Export button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-hairline)',
          marginTop: '0.5rem',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Tip: Speak naturally with Wispr Flow or type a test scenario.
        </div>

        <button
          type="button"
          onClick={onExportReport}
          className="btn-editorial-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          id="btn-export-report"
          title="Export JSON and readable markdown verification report"
        >
          <Download size={13} />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
};
