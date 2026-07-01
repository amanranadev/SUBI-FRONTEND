import React, { createContext, ReactNode, useContext, useState } from "react";

interface TaskDetailContextType {
  isTaskDetailOpen: boolean;
  taskId: string | null;
  isCalendarEvent: boolean;
  setTaskDetailOpen: (isOpen: boolean, taskId?: string, isCalendarEvent?: boolean) => void;
}

const TaskDetailContext = createContext<TaskDetailContextType | undefined>(
  undefined
);

export const TaskDetailProvider = ({ children }: { children: ReactNode }) => {
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isCalendarEvent, setIsCalendarEvent] = useState(false);

  const setTaskDetailOpen = (isOpen: boolean, taskId?: string, isCalendarEvent?: boolean) => {
    setIsTaskDetailOpen(isOpen);
    setTaskId(taskId || null);
    setIsCalendarEvent(isCalendarEvent || false);
  };

  return (
    <TaskDetailContext.Provider
      value={{ isTaskDetailOpen, taskId, isCalendarEvent, setTaskDetailOpen }}
    >
      {children}
    </TaskDetailContext.Provider>
  );
};

export const useTaskDetailContext = () => {
  const context = useContext(TaskDetailContext);
  if (!context) {
    throw new Error(
      "useTaskDetailContext must be used within TaskDetailProvider"
    );
  }
  return context;
};
