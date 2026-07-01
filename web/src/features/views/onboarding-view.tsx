"use client"

import * as React from "react"
import {
  CheckCircle2,
  ChevronRight,
  User,
  Globe,
  Bell,
  CreditCard,
  Briefcase,
} from "lucide-react"
import { Progress } from "@/shared/ui/progress"
import { cn } from "@/lib/utils"
import { Txt } from "@/shared/ui"

interface OnboardingViewProps {
  onComplete: () => void
}

interface SetupTask {
  id: string
  title: string
  description: string
  icon: React.ElementType
  isCompleted: boolean
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [completedSteps, setCompletedSteps] = React.useState<string[]>([])

  const tasks: SetupTask[] = [
    {
      id: "profile",
      title: "Personal profile",
      description: "Add your license # and brokerage details",
      icon: User,
      isCompleted: completedSteps.includes("profile"),
    },
    {
      id: "persona",
      title: "Agent & TC - Preferred partners",
      description: "Select your role and workspace type",
      icon: Briefcase,
      isCompleted: completedSteps.includes("persona"),
    },
    {
      id: "integrations",
      title: "Calendar & Email Integration",
      description: "Sync with Google or Outlook",
      icon: Globe,
      isCompleted: completedSteps.includes("integrations"),
    },
    {
      id: "notifications",
      title: "Notifications & Preferences",
      description: "Configure your alert settings",
      icon: Bell,
      isCompleted: completedSteps.includes("notifications"),
    },
    {
      id: "subscription",
      title: "Subscription",
      description: "Manage your workstation plan",
      icon: CreditCard,
      isCompleted: completedSteps.includes("subscription"),
    },
  ]

  const progress = (completedSteps.length / tasks.length) * 100

  const handleTaskClick = (id: string) => {
    if (completedSteps.includes(id)) return

    const newCompleted = [...completedSteps, id]
    setCompletedSteps(newCompleted)

    if (newCompleted.length === tasks.length) {
      setTimeout(() => {
        onComplete()
      }, 800)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-1000 max-w-4xl mx-auto w-full">
      <div className="w-full space-y-8">
        <div className="space-y-3">
          <Txt as="h1" size="5xl" weight="bold" className="tracking-tighter">
            Almost there ✨
          </Txt>
          <Txt as="p" size="2xl" weight="medium" className="opacity-40">
            Complete your setup to unlock the workstation
          </Txt>
        </div>

        <div className="flex items-center justify-between gap-12 bg-black/[0.02] p-8 rounded-[3rem] border border-black/[0.03]">
          <div className="space-y-1">
            <Txt
              as="span"
              size="sm"
              weight="bold"
              transform="upper"
              className="tracking-widest opacity-60"
            >
              {tasks.length - completedSteps.length}{" "}
              {tasks.length - completedSteps.length === 1 ? "task" : "tasks"}{" "}
              remaining
            </Txt>
          </div>
          <div className="flex-1 flex items-center gap-6">
            <Progress value={progress} className="h-3 flex-1 bg-black/5" />
            <Txt
              as="span"
              size="xl"
              weight="bold"
              className="tracking-tighter whitespace-nowrap"
            >
              {Math.round(progress)}% Complete
            </Txt>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              className={cn(
                "group relative flex items-center justify-between p-8 rounded-[3rem] transition-all border shadow-default cursor-pointer",
                task.isCompleted
                  ? "bg-green-500/5 border-green-500/20 opacity-70"
                  : "bg-white border-black/5 hover:scale-[1.01] active:scale-95",
              )}
            >
              <div className="flex items-center gap-6">
                <div
                  className={cn(
                    "h-16 w-16 rounded-[1.75rem] flex items-center justify-center transition-all",
                    task.isCompleted
                      ? "bg-green-500/10 text-green-600"
                      : "bg-black/[0.03] text-foreground/40 group-hover:bg-primary/5 group-hover:text-primary",
                  )}
                >
                  <task.icon className="size-8" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <Txt
                    as="h3"
                    size="2xl"
                    weight="bold"
                    className={cn("tracking-tighter", task.isCompleted && "text-green-600")}
                  >
                    {task.title}
                  </Txt>
                  <Txt as="p" size="lg" weight="medium" className="opacity-40">
                    {task.description}
                  </Txt>
                </div>
              </div>

              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all",
                  task.isCompleted
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-black/10 group-hover:border-primary/40",
                )}
              >
                {task.isCompleted ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <ChevronRight className="size-6 opacity-30" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
