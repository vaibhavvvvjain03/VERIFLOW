import React, { useState } from 'react';
import { Sparkles, Play, Edit3, Trash2, Plus, ShieldAlert, X } from 'lucide-react';
import { TestPlan, PlanStep } from '../../shared/types';

interface PlanReviewBoxProps {
  plan: TestPlan;
  onExecutePlan: (approvedPlan: TestPlan) => void;
  onDismiss: () => void;
  isRunning: boolean;
}

export const PlanReviewBox: React.FC<PlanReviewBoxProps> = ({
  plan,
  onExecutePlan,
  onDismiss,
  isRunning,
}) => {
  const [editedPlan, setEditedPlan] = useState<TestPlan>(() => ({
    ...plan,
    steps: plan.steps.map((s) => ({ ...s })),
  }));
  const [confirmedDestructive, setConfirmedDestructive] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleUpdateStepDescription = (index: number, newDesc: string) => {
    setEditedPlan((prev) => {
      const updatedSteps = [...prev.steps];
      updatedSteps[index] = { ...updatedSteps[index], description: newDesc };
      return { ...prev, steps: updatedSteps };
    });
  };

  const handleRemoveStep = (index: number) => {
    setEditedPlan((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleAddAssertion = () => {
    const newStep: PlanStep = {
      id: `step-${Date.now()}-extra`,
      type: 'assertion',
      assertion: 'assert_visible',
      target: 'body',
      description: 'Assert that page body is visible',
      expectedOutcome: 'Page remains loaded and accessible.',
    };
    setEditedPlan((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const canExecute = !isRunning && (!editedPlan.requiresConfirmation || confirmedDestructive);

  return (
    <div
      style={{
        backgroundColor: '#fff7ed',
        border: '1.5px solid #fb923c',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.4rem',
        marginBottom: '1rem',
        boxShadow: '3px 3px 0px rgba(234, 88, 12, 0.22)',
      }}
      id="plan-review-box"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#ffedd5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} color="#ea580c" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#9a3412' }}>
              Structured Test Plan: {editedPlan.name}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#c2410c' }}>
              Target: <code style={{ fontFamily: 'var(--font-mono)' }}>{editedPlan.targetUrl}</code> · {editedPlan.steps.length} steps · Est. {editedPlan.estimatedDurationMs || 3000}ms
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              padding: '0.35rem 0.65rem',
              backgroundColor: isEditing ? 'var(--bg-lavender-subtle)' : '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              color: 'var(--text-main)',
            }}
          >
            <Edit3 size={12} />
            <span>{isEditing ? 'Done Editing' : 'Edit Steps'}</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            disabled={isRunning}
            style={{
              padding: '0.35rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
            title="Dismiss plan"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Warnings & Notices */}
      {editedPlan.warning && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.8rem',
            color: '#92400e',
            marginBottom: '1rem',
          }}
        >
          <ShieldAlert size={16} color="#d97706" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
          <span>{editedPlan.warning}</span>
        </div>
      )}

      {/* Step Sequence Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {editedPlan.steps.map((step, idx) => (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                minWidth: '20px',
              }}
            >
              {idx + 1}.
            </span>

            <span
              style={{
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.7rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                backgroundColor: step.type === 'assertion' ? '#ecfdf5' : 'var(--bg-lavender-subtle)',
                color: step.type === 'assertion' ? '#047857' : 'var(--bg-lavender-deep)',
              }}
            >
              {step.type === 'assertion' ? step.assertion : step.action}
            </span>

            {isEditing ? (
              <input
                type="text"
                value={step.description}
                onChange={(e) => handleUpdateStepDescription(idx, e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.82rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  outline: 'none',
                }}
              />
            ) : (
              <span style={{ flex: 1, color: 'var(--text-main)' }}>{step.description}</span>
            )}

            {step.expectedOutcome && !isEditing && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                ↳ {step.expectedOutcome}
              </span>
            )}

            {isEditing && (
              <button
                type="button"
                onClick={() => handleRemoveStep(idx)}
                style={{
                  padding: '0.2rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  cursor: 'pointer',
                }}
                title="Remove step"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <button
          type="button"
          onClick={handleAddAssertion}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            padding: '0.35rem 0.65rem',
            backgroundColor: '#ffffff',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            marginBottom: '1rem',
            color: 'var(--text-muted)',
          }}
        >
          <Plus size={12} />
          <span>Add Custom Assertion Step</span>
        </button>
      )}

      {/* Destructive Action Checkbox Confirmation (CMD-012) */}
      {editedPlan.requiresConfirmation && (
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="confirm-destructive-action"
            checked={confirmedDestructive}
            onChange={(e) => setConfirmedDestructive(e.target.checked)}
            style={{ accentColor: '#ef4444' }}
          />
          <label htmlFor="confirm-destructive-action" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b91c1c', cursor: 'pointer' }}>
            I confirm execution of this test plan acknowledging potential state-modifying actions.
          </label>
        </div>
      )}

      {/* Confirmation CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onDismiss}
          disabled={isRunning}
          className="btn-editorial-outline"
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => onExecutePlan(editedPlan)}
          disabled={!canExecute}
          className="btn-editorial-coral"
          style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          id="btn-confirm-and-run-plan"
        >
          <Play size={14} />
          <span>Confirm & Run Plan</span>
        </button>
      </div>
    </div>
  );
};
