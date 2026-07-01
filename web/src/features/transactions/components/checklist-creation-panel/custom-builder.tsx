import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { BuilderCategory } from "./types";

type CustomBuilderProps = {
  builderData: BuilderCategory[];
  builderErrors: Record<string, string>;
  isSubmitting: boolean;
  canSaveTemplate: boolean;
  onCategoryChange: (categoryIndex: number, value: string) => void;
  onTaskChange: (categoryIndex: number, taskIndex: number, value: string) => void;
  onRemoveTask: (categoryIndex: number, taskIndex: number) => void;
  onAddTask: (categoryIndex: number) => void;
  onCancel: () => void;
  onAddCategory: () => void;
  onSave: () => void;
  onSaveAsTemplate: () => void;
};

export function CustomBuilder({
  builderData,
  builderErrors,
  isSubmitting,
  canSaveTemplate,
  onCategoryChange,
  onTaskChange,
  onRemoveTask,
  onAddTask,
  onCancel,
  onAddCategory,
  onSave,
  onSaveAsTemplate,
}: CustomBuilderProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        {builderData.map((category, categoryIndex) => (
          <div
            key={category.id}
            className="p-6 glass-card rounded-[2rem] [box-shadow:0_72px_148px_-74px_rgba(0,0,0,0.5),0_22px_48px_-30px_rgba(0,0,0,0.22)] space-y-4"
          >
            <Input
              placeholder="Category Name (e.g., Inspections)"
              value={category.label}
              onChange={(event) => onCategoryChange(categoryIndex, event.target.value)}
              className={cn(
                "h-10 rounded-xl bg-black/[0.02] border-black/5 font-bold text-sm",
                builderErrors[`category:${category.id}`] && "border-destructive",
              )}
            />
            {builderErrors[`category:${category.id}`] ? (
              <p className="text-xs font-medium text-destructive">
                {builderErrors[`category:${category.id}`]}
              </p>
            ) : null}
            <div className="space-y-2 pl-4">
              {category.subtasks.map((task, taskIndex) => (
                <div key={task.id} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Task Label"
                      value={task.label}
                      onChange={(event) =>
                        onTaskChange(categoryIndex, taskIndex, event.target.value)
                      }
                      className={cn(
                        "h-9 rounded-lg bg-white border-black/5 text-xs font-bold",
                        builderErrors[`task:${task.id}`] && "border-destructive",
                      )}
                    />
                    {builderErrors[`task:${task.id}`] ? (
                      <p className="mt-1 text-xs font-medium text-destructive">
                        {builderErrors[`task:${task.id}`]}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => onRemoveTask(categoryIndex, taskIndex)}
                    className="size-9 !rounded-lg text-destructive hover:bg-destructive/5"
                    disabled={isSubmitting}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => onAddTask(categoryIndex)}
                className="h-8 !rounded-lg text-[9px] font-bold uppercase tracking-widest gap-2"
                disabled={isSubmitting}
              >
                <Plus className="size-3" /> Add Item
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="relative z-10 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="!rounded-xl h-10 px-6 font-bold text-xs"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <div className="flex gap-3">
          {canSaveTemplate ? (
            <Button
              variant="outline-dark"
              onClick={onSaveAsTemplate}
              className="!rounded-xl h-10 px-6 font-bold text-xs"
              disabled={isSubmitting}
            >
              Save as Template
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={onAddCategory}
            className="!rounded-xl h-10 px-6 font-bold text-xs gap-2"
            disabled={isSubmitting}
          >
            <Plus className="size-4" /> New Category
          </Button>
          <Button
            onClick={onSave}
            className="!rounded-xl h-10 px-8 font-bold text-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Checklist"}
          </Button>
        </div>
      </div>
    </div>
  );
}
