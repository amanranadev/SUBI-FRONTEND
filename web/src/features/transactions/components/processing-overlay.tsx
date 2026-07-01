"use client";

import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/lib/utils";
import {
  PROCESSING_STEP,
  STEP_STATE,
  type ProcessingStep,
  type StepState,
} from "../constants";
import {
  FileUp,
  FileSearch,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  X,
  StopCircle,
} from "lucide-react";

type ProcessingOverlayProps = {
  step: ProcessingStep;
  percent: number;
  message: string;
  error: string | null;
  onCancel: () => void;
  onRetry?: () => void;
};

const STEPS = [
  { key: PROCESSING_STEP.UPLOADING, label: "Upload", icon: FileUp },
  {
    key: PROCESSING_STEP.EXTRACTING,
    label: "Text Extraction",
    icon: FileSearch,
  },
  { key: PROCESSING_STEP.ANALYZING, label: "AI Analysis", icon: Sparkles },
] as const;

function getStepState(
  current: ProcessingStep,
  stepKey: ProcessingStep,
): StepState {
  const order = [
    PROCESSING_STEP.UPLOADING,
    PROCESSING_STEP.EXTRACTING,
    PROCESSING_STEP.ANALYZING,
  ];
  const currentIdx = order.indexOf(current as (typeof order)[number]);
  const stepIdx = order.indexOf(stepKey as (typeof order)[number]);

  if (current === PROCESSING_STEP.COMPLETE) return STEP_STATE.DONE;
  if (stepIdx < currentIdx) return STEP_STATE.DONE;
  if (stepIdx === currentIdx) return STEP_STATE.ACTIVE;
  return STEP_STATE.PENDING;
}

export function ProcessingOverlay({
  step,
  percent,
  message,
  error,
  onCancel,
  onRetry,
}: ProcessingOverlayProps) {
  const isError = step === PROCESSING_STEP.ERROR;
  return (
    <div className="w-full h-fit max-w-xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-500  ">
      <div className="flex flex-col items-center gap-6 text-center">
        {isError ? (
          <div className="size-20 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center">
            <XCircle className="size-10 text-red-500" />
          </div>
        ) : (
          <div
            className={cn(
              "size-20 rounded-[1.5rem] flex items-center justify-center",
              step === PROCESSING_STEP.COMPLETE
                ? "bg-green-500/10"
                : "bg-primary/10",
            )}
          >
            {step === PROCESSING_STEP.COMPLETE ? (
              <CheckCircle2 className="size-10 text-green-600" />
            ) : (
              <Sparkles className="size-10 text-primary animate-pulse" />
            )}
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter">
            {isError ? "Processing Failed" : "Processing Your Document"}
          </h2>
          <p
            className={cn(
              "text-base/6 font-medium max-w-md",
              isError ? "text-red-500" : "text-muted-foreground",
            )}
          >
            {message}
          </p>
        </div>
      </div>

      {!isError && (
        <div className="w-full space-y-6 mt-2">
          <Progress value={percent} className="h-4" />

          <div className="flex justify-between gap-4">
            {STEPS.map(({ key, label, icon: Icon }) => {
              const state = getStepState(step, key);
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    state === STEP_STATE.DONE && "text-green-600",
                    state === STEP_STATE.ACTIVE && "text-primary",
                    state === STEP_STATE.PENDING && "text-muted-foreground/40",
                  )}
                >
                  {state === STEP_STATE.DONE ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Icon
                      className={cn(
                        "size-4",
                        state === STEP_STATE.ACTIVE && "animate-pulse",
                      )}
                    />
                  )}
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        {isError && onRetry && (
          <Button onClick={onRetry}>
            <RotateCcw className="size-4" />
            Try Again
          </Button>
        )}
        <Button onClick={onCancel} variant="outline-danger">
          {!isError ? (
            <StopCircle className="size-4" />
          ) : (
            <X className="size-4" />
          )}
          {!isError ? "Stop Processing" : "Cancel"}
        </Button>
      </div>
    </div>
  );
}
