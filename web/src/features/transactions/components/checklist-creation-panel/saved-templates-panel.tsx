import * as React from "react";
import type { ChecklistTemplateRecord } from "@/features/transactions/api/checklist-service";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Txt } from "@/shared/ui";
import { splitChecklistTaskName } from "@/features/transactions/utils/checklist-name";

type SavedTemplatesPanelProps = {
  templates: ChecklistTemplateRecord[];
  isLoading: boolean;
  isApplying: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onApply: (templateId: string) => void;
  onBack: () => void;
};

export function SavedTemplatesPanel({
  templates,
  isLoading,
  isApplying,
  search,
  onSearchChange,
  onApply,
  onBack,
}: SavedTemplatesPanelProps) {
  const [expandedTemplateId, setExpandedTemplateId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search template name, checklist, description..."
        className="h-10 rounded-xl bg-white border-black/5 text-sm font-medium"
      />

      <div className="space-y-3">
        {isLoading ? (
          <div className="glass-card rounded-[1.5rem] px-5 py-6 [box-shadow:0_20px_40px_-24px_rgba(0,0,0,0.3),0_8px_18px_-12px_rgba(0,0,0,0.18)]">
            <Txt as="p" size="sm" tone="muted">
              Loading templates...
            </Txt>
          </div>
        ) : templates.length === 0 ? (
          <div className="glass-card rounded-[1.5rem] px-5 py-6 [box-shadow:0_20px_40px_-24px_rgba(0,0,0,0.3),0_8px_18px_-12px_rgba(0,0,0,0.18)]">
            <Txt as="p" size="sm" tone="muted">
              No saved checklist templates found.
            </Txt>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="glass-card rounded-[1.5rem] p-5 border border-black/5 [box-shadow:0_20px_40px_-24px_rgba(0,0,0,0.3),0_8px_18px_-12px_rgba(0,0,0,0.18)]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold tracking-tight">
                    {template.templateName ?? template.name}
                  </p>
                  <p className="text-xs font-medium opacity-60">
                    {template.checklistName ?? template.name}
                  </p>
                  {template.description ? (
                    <p className="text-xs opacity-50">{template.description}</p>
                  ) : null}
                  <p className="text-[11px] font-semibold opacity-40">
                    {template.tasks.length} item{template.tasks.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl px-4 text-xs font-bold"
                    disabled={isApplying}
                    onClick={() =>
                      setExpandedTemplateId((prev) =>
                        prev === template.id ? null : template.id,
                      )
                    }
                  >
                    {expandedTemplateId === template.id ? "Hide checklist" : "View checklist"}
                  </Button>
                  <Button
                    className="h-9 rounded-xl px-4 text-xs font-bold"
                    disabled={isApplying}
                    onClick={() => onApply(template.id)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
              {expandedTemplateId === template.id ? (
                <div className="mt-4 space-y-3 rounded-xl border border-black/5 bg-white/70 p-4">
                  {groupTemplateTasks(template).map((group) => (
                    <div key={group.label} className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">
                        {group.label}
                      </p>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <p
                            key={item.id}
                            className="rounded-lg border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-foreground/80"
                          >
                            {item.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <Button
        variant="ghost"
        onClick={onBack}
        className="w-full text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-white"
        disabled={isApplying}
      >
        Back to selection
      </Button>
    </div>
  );
}

function groupTemplateTasks(template: ChecklistTemplateRecord): Array<{
  label: string;
  items: Array<{ id: string; name: string }>;
}> {
  const groups = new Map<string, Array<{ id: string; name: string }>>();

  template.tasks.forEach((task) => {
    const parsed = splitChecklistTaskName(task.name ?? "");
    const groupLabel =
      parsed.category ??
      (task.label?.trim() ? task.label.trim() : null) ??
      "Checklist Items";
    const taskLabel = parsed.taskName || task.name || "Checklist Item";

    const existing = groups.get(groupLabel) ?? [];
    existing.push({
      id: task.id,
      name: taskLabel,
    });
    groups.set(groupLabel, existing);
  });

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}
