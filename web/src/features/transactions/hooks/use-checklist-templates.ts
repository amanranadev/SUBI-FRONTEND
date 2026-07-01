"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchChecklistTemplates,
  type ChecklistTemplate,
} from "@/features/transactions/api/checklist-service";

export const CHECKLIST_TEMPLATES_QUERY_KEY = [
  "transactions",
  "checklists",
] as const;

export function useChecklistTemplates() {
  return useQuery<ChecklistTemplate[]>({
    queryKey: CHECKLIST_TEMPLATES_QUERY_KEY,
    queryFn: fetchChecklistTemplates,
    staleTime: 30_000,
  });
}
