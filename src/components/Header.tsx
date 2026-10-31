import React from 'react';
import { ArrowRight, LayoutDashboard, Home } from 'lucide-react';
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
        <div className="header-brand-wrap">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            id="brand-logo-link"
            style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Veriflow Homepage"
          >
            <VeriBrandLogo size={32} />
          </a>
        </div>

        <nav className="editorial-nav" aria-label="Main Navigation">
          <button
            onClick={() => onNavigate('/')}
            className={`editorial-nav-link ${currentRoute === '/' ? 'active' : ''}`}
            id="nav-link-overview"
          >
            <Home size={14} className="nav-icon-mobile" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => onNavigate('/workspace')}
            className={`editorial-nav-link ${currentRoute === '/workspace' ? 'active' : ''}`}
            id="nav-link-workspace"
          >
            <LayoutDashboard size={14} className="nav-icon-mobile" />
            <span className="nav-text-desktop">Testing Workspace</span>
            <span className="nav-text-mobile">Workspace</span>
          </button>
        </nav>

        <div className="header-actions-wrap">
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
            {runStatus === 'passed' && '✓ PASS'}
            {runStatus === 'failed' && '✕ FAIL'}
            {runStatus === 'idle' && '○ IDLE'}
            {runStatus === 'error' && '⚠ ERROR'}
            {runStatus === 'queued' && '… QUEUED'}
          </div>

          {currentRoute !== '/workspace' && (
            <button
              onClick={() => onNavigate('/workspace')}
              className="btn-editorial-pill header-cta-desktop"
              id="header-open-workspace-btn"
            >
              <span>Workspace</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
