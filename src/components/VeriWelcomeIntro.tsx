import React, { useState, useEffect } from 'react';
import { VeriWaving } from './CharacterSketches';
import { Sparkles, ArrowRight } from 'lucide-react';

interface VeriWelcomeIntroProps {
  onComplete: () => void;
}

export const VeriWelcomeIntro: React.FC<VeriWelcomeIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'entering' | 'greeting' | 'zooming' | 'done'>('entering');

  useEffect(() => {
    // 1. Enter and wave
    const timer1 = setTimeout(() => {
      setStage('greeting');
    }, 400);

    // 2. Auto-zoom to open site after friendly greeting
    const timer2 = setTimeout(() => {
      setStage('zooming');
    }, 2400);

    // 3. Complete and unmount
    const timer3 = setTimeout(() => {
      setStage('done');
      onComplete();
    }, 3100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const handleManualEnter = () => {
    setStage('zooming');
    setTimeout(() => {
      setStage('done');
      onComplete();
    }, 600);
  };

  if (stage === 'done') return null;

  return (
    <div
      className={`veri-welcome-overlay ${stage === 'zooming' ? 'veri-welcome-zooming' : ''}`}
      onClick={handleManualEnter}
      id="veri-welcome-modal"
    >
      <div className={`veri-welcome-stage ${stage === 'zooming' ? 'veri-stage-zooming' : ''}`}>
        {/* Animated Speech Bubble */}
        <div className={`veri-speech-bubble ${stage === 'greeting' || stage === 'zooming' ? 'visible' : ''}`}>
          <div className="veri-speech-bubble-tag">
            <Sparkles size={12} color="var(--bg-coral)" />
            <span>AI QA SCOUT</span>
          </div>
          <div className="veri-speech-bubble-title">
            Hi! I'm Veri 👋
          </div>
          <div className="veri-speech-bubble-sub">
            Welcome to <strong>Veriflow</strong>. Ready to test any website with your voice?
          </div>
          <div className="veri-speech-bubble-arrow"></div>
        </div>

        {/* Waving Veri Mascot */}
        <div className="veri-waving-wrapper">
          <VeriWaving width={260} height={260} />
        </div>

        {/* Action Button & Skip */}
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleManualEnter();
            }}
            className="btn-editorial-pill"
            style={{ padding: '0.65rem 1.6rem', fontSize: '0.95rem', boxShadow: 'var(--shadow-retro)' }}
            id="btn-enter-site"
          >
            <span>Let's Test!</span>
            <ArrowRight size={16} />
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            (Click anywhere to jump in)
          </span>
        </div>
      </div>
    </div>
  );
};
