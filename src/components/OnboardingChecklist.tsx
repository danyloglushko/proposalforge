"use client";

export interface OnboardingStep {
  key: string;
  label: string;
  description?: string;
  completed: boolean;
  href?: string;
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  onDismiss?: () => void;
}

export function OnboardingChecklist({ steps, onDismiss }: OnboardingChecklistProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const allDone = completedCount === total;

  if (allDone) return null;

  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-indigo-900">Get started</h3>
            <span className="text-xs text-indigo-600 font-medium">
              {completedCount}/{total} done
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-indigo-300 hover:text-indigo-500 text-lg leading-none shrink-0 mt-0.5"
            aria-label="Dismiss"
          >
            &times;
          </button>
        )}
      </div>

      {/* Steps */}
      <ul className="divide-y divide-gray-50">
        {steps.map((step) => {
          const content = (
            <div className="flex items-start gap-3 px-5 py-3.5">
              <span
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                  step.completed
                    ? "bg-indigo-500 text-white"
                    : "border-2 border-gray-200 text-transparent"
                }`}
              >
                ✓
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${step.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                  {step.label}
                </p>
                {step.description && !step.completed && (
                  <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                )}
              </div>
              {!step.completed && step.href && (
                <span className="text-xs text-indigo-500 font-medium shrink-0 mt-0.5">→</span>
              )}
            </div>
          );

          return (
            <li key={step.key} className={!step.completed && step.href ? "hover:bg-gray-50 transition-colors" : ""}>
              {!step.completed && step.href ? (
                <a href={step.href} className="block">
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
