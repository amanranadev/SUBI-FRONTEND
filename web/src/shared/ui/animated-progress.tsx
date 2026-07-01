"use client";

import * as React from "react";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/lib/utils";

type AnimatedProgressProps = {
  value: number;
  className?: string;
  striped?: boolean;
};

export function AnimatedProgress({
  value,
  className,
  striped = true,
}: AnimatedProgressProps) {
  const [progressValue, setProgressValue] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgressValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Progress
      value={progressValue}
      className={cn(className)}
      striped={striped}
    />
  );
}
