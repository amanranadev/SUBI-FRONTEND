"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ToggleGroup } from "@/shared/ui/toggle-group";
import type { TaskListFilterPayload } from "../types/task-filters";
import { TasksFilterPopover } from "./tasks-filter-popover";

interface TasksToolbarProps {
  isSearchOpen: boolean;
  searchInputValue: string;
  taskFilterMode: "active" | "completed";
  listFilters: TaskListFilterPayload;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onSearchDebouncedChange: (value: string) => void;
  onToggleSearch: () => void;
  onFilterModeChange: (value: "active" | "completed") => void;
  onApplyListFilters: (next: TaskListFilterPayload) => void;
}

export function TasksToolbar({
  isSearchOpen,
  searchInputValue,
  taskFilterMode,
  listFilters,
  hasActiveFilters,
  onSearchChange,
  onSearchDebouncedChange,
  onToggleSearch,
  onFilterModeChange,
  onApplyListFilters,
}: TasksToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 py-2.5">
      {isSearchOpen ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            value={searchInputValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onDebouncedChange={(value) => onSearchDebouncedChange(value.trim())}
            debounceMs={400}
            placeholder="Search tasks"
            className="h-10 w-full rounded-2xl sm:w-72"
            showClearButton
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full opacity-40 hover:opacity-100"
            onClick={onToggleSearch}
          >
            <Plus className="size-4 rotate-45" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full opacity-40 hover:opacity-100"
          onClick={onToggleSearch}
        >
          <Search className="size-5" />
        </Button>
      )}
      <TasksFilterPopover
        taskFilterMode={taskFilterMode}
        applied={listFilters}
        hasActiveFilters={hasActiveFilters}
        onApply={onApplyListFilters}
      />
      <ToggleGroup
        variant="rounded"
        items={[
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
        ]}
        value={taskFilterMode}
        onChange={(val) => onFilterModeChange(val as "active" | "completed")}
      />
    </div>
  );
}
