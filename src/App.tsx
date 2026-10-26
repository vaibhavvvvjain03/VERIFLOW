import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { VeriWelcomeIntro } from './components/VeriWelcomeIntro';
import {
  RunRecord,
  RunStatus,
  ParsedCommand,
  TestPlan,
} from '../shared/types';
import {
  createPlanRun,
  fetchRun,
} from './features/runs/runApi';
import { generateMarkdownReport, downloadFile } from './features/runs/reportExport';

export const App: React.FC = () => {
  // If the page was refreshed (F5 / reload), always go to the main homepage '/'
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav && nav.type === 'reload') {
        window.history.replaceState({}, '', '/');
        return '/';
      }
    } catch {
      // fallback
    }
    return window.location.pathname || '/';
  });

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Show mascot landing intro on site entry / homepage
    return window.location.pathname === '/' || !window.location.pathname;
  });

  const [targetUrl, setTargetUrl] = useState<string>(() => {
    return localStorage.getItem('veriflow_target_url') || 'https://www.wemakedevs.org';
  });

  const [pendingPlan, setPendingPlan] = useState<TestPlan | null>(null);
  const [currentRun, setCurrentRun] = useState<RunRecord | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const pollingRef = useRef<number | null>(null);

  // Sync route with browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTargetUrlChange = (newUrl: string) => {
    setTargetUrl(newUrl);
    localStorage.setItem('veriflow_target_url', newUrl);
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    window.scrollTo(0, 0);
  };

  const handleExportReport = () => {
    if (!currentRun) {
      alert('No test run recorded to export. Execute a test run first.');
      return;
    }

    const reportData = {
      product: 'Veriflow Universal Browser Testing Platform',
      exportTimestamp: new Date().toISOString(),
      runId: currentRun.runId,
      status: currentRun.status,
      targetUrl: currentRun.targetUrl,
      summary: currentRun.summary,
      results: currentRun.results,
      plan: currentRun.plan || null,
    };

    // 1. Export JSON report
    downloadFile(
      JSON.stringify(reportData, null, 2),
      `veriflow-report-${currentRun.runId}.json`,
      'application/json'
    );

    // 2. Export Human-Readable Markdown report
    const markdownContent = generateMarkdownReport(currentRun);
    downloadFile(
      markdownContent,
      `veriflow-report-${currentRun.runId}.md`,
      'text/markdown'
    );
  };

  const startPlanRun = async (plan: TestPlan) => {
    if (isRunning) return;
    setIsRunning(true);
    setPendingPlan(null);

    try {
      const initialRecord = await createPlanRun(plan, targetUrl);
      setCurrentRun(initialRecord);

      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = window.setInterval(async () => {
        try {
          const updated = await fetchRun(initialRecord.runId);
          setCurrentRun(updated);

          if (
            updated.status === 'passed' ||
            updated.status === 'failed' ||
            updated.status === 'error'
          ) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            setIsRunning(false);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setIsRunning(false);
        }
      }, 500);
    } catch (err: unknown) {
      alert(`Failed to start plan run: ${err instanceof Error ? err.message : String(err)}`);
      setIsRunning(false);
    }
  };

  const handleExecuteCommand = async (command: ParsedCommand) => {
    if (command.action === 'export_report') {
      handleExportReport();
      return;
    }

    if (command.action === 'open_evidence') {
      return;
    }

    if (command.action === 'execute_plan' && command.plan) {
      setPendingPlan(command.plan);
      return;
    }
  };

  const runStatus: RunStatus = isRunning
    ? 'running'
    : currentRun
    ? currentRun.status
    : 'idle';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showIntro && <VeriWelcomeIntro onComplete={() => setShowIntro(false)} />}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        runStatus={runStatus}
      />

      <main style={{ flex: 1 }}>
        {currentRoute === '/workspace' ? (
          <DashboardPage
            currentRun={currentRun}
            onExecuteCommand={handleExecuteCommand}
            isRunning={isRunning}
            onExportReport={handleExportReport}
            targetUrl={targetUrl}
            onChangeTargetUrl={handleTargetUrlChange}
            pendingPlan={pendingPlan}
            onConfirmPlan={startPlanRun}
            onDismissPlan={() => setPendingPlan(null)}
          />
        ) : (
          <LandingPage onOpenWorkspace={() => navigateTo('/workspace')} />
        )}
      </main>
    </div>
  );
};
