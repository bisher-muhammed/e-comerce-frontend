"use client";

import { Check } from "lucide-react";
import { STEPS, type StepId } from "./types";

interface CheckoutStepperProps {
  currentStep: StepId;
  /** Steps the user has already completed and can safely jump back to. */
  completedSteps: StepId[];
  onStepClick?: (step: StepId) => void;
}

export function CheckoutStepper({
  currentStep,
  completedSteps,
  onStepClick,
}: CheckoutStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-10 flex items-center">
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isClickable = isCompleted && !!onStepClick;

        return (
          <div
            key={step.id}
            className={`flex items-center ${
              index === STEPS.length - 1 ? "" : "flex-1"
            }`}
          >
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step.id)}
              className="flex flex-col items-center gap-2"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-sm border text-xs font-medium transition-colors ${
                  isCompleted
                    ? "border-foreground bg-foreground text-background"
                    : isCurrent
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground"
                } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
              >
                {isCompleted ? <Check size={15} /> : index + 1}
              </span>

              <span
                className={`text-xs ${
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </button>

            {index !== STEPS.length - 1 && (
              <div
                className={`mx-3 h-px flex-1 ${
                  index < currentIndex ? "bg-foreground" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
