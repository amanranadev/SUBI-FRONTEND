"use client";

import { format } from "date-fns";
import {
  ArrowUpRight,
  CalendarClock,
  ClipboardCheck,
  ListTodo,
  MapPin,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { Txt } from "@/shared/ui";
import type { CalendarEvent } from "@/features/calendar/types";

type CalendarEventDetailsDialogProps = {
  selectedEvent: CalendarEvent | null;
  onClose: () => void;
  onGoToTransaction: (transactionId: string) => void;
};

export function CalendarEventDetailsDialog({
  selectedEvent,
  onClose,
  onGoToTransaction,
}: CalendarEventDetailsDialogProps) {
  const itemKindLabel =
    selectedEvent?.kind === "checklist" ? "Checklist" : "Task";
  const ItemKindIcon =
    selectedEvent?.kind === "checklist" ? ClipboardCheck : ListTodo;

  return (
    <Modal
      title={selectedEvent?.title}
      open={Boolean(selectedEvent)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      footer={
        <Button
          variant="dark"
          onClick={() => {
            if (!selectedEvent) return;
            onGoToTransaction(selectedEvent.transactionId);
          }}
        >
          <ArrowUpRight className="size-4" />
          Go to transaction
        </Button>
      }
    >
      <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-5 space-y-4">
        <Txt
          as="p"
          size="xs"
          weight="bold"
          transform="upper"
          className="tracking-widest opacity-50"
        >
          Event Details
        </Txt>

        <div className="flex items-center gap-2">
          <ItemKindIcon className="size-4 opacity-50" />
          <Badge
            variant="outline"
            className="rounded-full border-black/10 bg-white/70 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          >
            {itemKindLabel}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="size-4 opacity-50" />
          <Txt as="p" size="sm" weight="bold" className="tracking-tight">
            {selectedEvent?.transactionAddress}
          </Txt>
        </div>

        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 opacity-50" />
          <Txt
            as="p"
            size="sm"
            weight="medium"
            className="tracking-tight opacity-80"
          >
            Due{" "}
            {selectedEvent ? format(selectedEvent.date, "MMM d, yyyy") : "-"}
          </Txt>
        </div>
      </div>
    </Modal>
  );
}
