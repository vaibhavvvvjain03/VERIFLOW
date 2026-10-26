import React from 'react';
import { ArrowRight } from 'lucide-react';
import { RunStatus } from '../../shared/types';
import { VeriBrandLogo } from './CharacterSketches';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  runStatus: RunStatus;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate, runStatus }) => {
  return (
    <header className="editorial-header">
      <div className="container-editorial editorial-header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            id="brand-logo-link"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            <VeriBrandLogo size={36} />
          </a>
        </div>

        <nav className="editorial-nav">
          <button
            onClick={() => onNavigate('/')}
            className={`editorial-nav-link ${currentRoute === '/' ? 'active' : ''}`}
            id="nav-link-overview"
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('/workspace')}
            className={`editorial-nav-link ${currentRoute === '/workspace' ? 'active' : ''}`}
            id="nav-link-workspace"
          >
            Testing Workspace
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Status Badge */}
          <div
            className={`status-pill ${
              runStatus === 'running'
                ? 'status-pill-running'
                : runStatus === 'passed'
                ? 'status-pill-pass'
                : runStatus === 'failed'
                ? 'status-pill-fail'
                : 'status-pill-idle'
            }`}
            id="global-status-badge"
          >
            {runStatus === 'running' && '● RUNNING'}
            {runStatus === 'passed' && '✓ ALL PASS'}
            {runStatus === 'failed' && '✕ FAILURES'}
            {runStatus === 'idle' && '○ IDLE'}
            {runStatus === 'error' && '⚠ ERROR'}
            {runStatus === 'queued' && '… QUEUED'}
          </div>

          {currentRoute !== '/workspace' && (
            <button
              onClick={() => onNavigate('/workspace')}
              className="btn-editorial-pill"
              id="header-open-workspace-btn"
            >
              <span>Open Workspace</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
