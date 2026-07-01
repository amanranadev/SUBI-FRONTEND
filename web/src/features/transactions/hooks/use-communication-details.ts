import { useState } from "react";
import { parseISO } from "date-fns";
import type { CommunicationEntry } from "../api/communication-service";

export function getRecipient(log: CommunicationEntry) {
  return log.recipient_email ?? log.recipient_phone ?? log.recipient_name;
}

export function parseSentAt(sentAt: string | null | undefined): Date | null {
  if (!sentAt) return null;

  const iso = parseISO(sentAt);
  if (!isNaN(iso.getTime())) return iso;

  const num = Number(sentAt);
  if (!isNaN(num)) {
    return new Date(num < 1e12 ? num * 1000 : num);
  }

  const fallback = new Date(sentAt);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export function useCommunicationDetails() {
  const [selectedLog, setSelectedLog] = useState<CommunicationEntry | null>(null);

  const openLog = (log: CommunicationEntry) => setSelectedLog(log);
  const closeLog = () => setSelectedLog(null);

  return {
    selectedLog,
    openLog,
    closeLog,
  };
}
