"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import { ToggleGroup } from "@/shared/ui/toggle-group";
import { format } from "date-fns";
import {
  ExternalLink,
  History,
  Loader2,
  Mail,
  MessageSquare,
  Printer,
  Send,
} from "lucide-react";
import {
  getRecipient,
  parseSentAt,
  useCommunicationDetails,
} from "../../hooks/use-communication-details";
import { useTransactionCommunications } from "../../hooks/use-transaction-communications";

type TransactionDetailCommunicationTabProps = {
  transactionId: string;
  transactionAddress: string;
};

function CommunicationCardSkeleton() {
  return (
    <div className="glass-card rounded-[2rem] p-6 medium-drop-shadow space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-24 rounded-full ml-auto" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="flex justify-end pt-2">
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>
    </div>
  );
}

export function TransactionDetailCommunicationTab({
  transactionId,
  transactionAddress,
}: TransactionDetailCommunicationTabProps) {
  const { communications, isLoading, filter, hasMore, setFilter, loadMore } =
    useTransactionCommunications(transactionId);

  const { selectedLog, openLog, closeLog } = useCommunicationDetails();

  const isInitialLoad = isLoading && communications.length === 0;
  const isLoadingMore = isLoading && communications.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="flex items-center justify-between">
        <ToggleGroup
          variant="rounded"
          items={[
            { value: "all", label: "All Logs" },
            { value: "email", label: "Emails" },
            { value: "sms", label: "Texts" },
          ]}
          value={filter}
          onChange={(val) => setFilter(val as "all" | "email" | "sms")}
        />
      </div>

      <div className="space-y-4">
        {isInitialLoad ? (
          <>
            <CommunicationCardSkeleton />
            <CommunicationCardSkeleton />
            <CommunicationCardSkeleton />
          </>
        ) : communications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 border-2 border-dashed border-black/5 rounded-[3rem] bg-black/[0.01]">
            <Send className="size-10 opacity-10" />
            <p className="text-sm font-bold opacity-30 uppercase tracking-widest">
              No Communications Yet
            </p>
            <p className="text-xs opacity-30 max-w-xs text-center">
              Messages sent by SUBI for this transaction will appear here.
            </p>
          </div>
        ) : (
          communications.map((log) => (
            <div
              key={log.id}
              className="glass-card rounded-[2rem] p-6 medium-drop-shadow space-y-4 group hover:scale-[1.005] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "size-10 rounded-2xl flex items-center justify-center",
                      log.message_type === "email"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-green-500/10 text-green-600",
                    )}
                  >
                    {log.message_type === "email" ? (
                      <Mail className="size-5" />
                    ) : (
                      <MessageSquare className="size-5" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">
                        {log.message_type === "email" ? "email" : "text"} sent
                        to
                      </span>
                      <span className="text-xs font-bold">
                        {getRecipient(log)}
                      </span>
                    </div>
                    {log.subject && (
                      <h4 className="text-sm font-bold tracking-tight">
                        {log.subject}
                      </h4>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className="h-6 px-3 rounded-full text-[9px] font-bold uppercase tracking-widest text-green-600 bg-green-500/5 border-green-500/10"
                  >
                    SENT BY SUBI
                  </Badge>
                  <p className="text-[9px] font-bold opacity-30 uppercase mt-1">
                    {parseSentAt(log.sent_at)
                      ? format(parseSentAt(log.sent_at)!, "MMM dd, h:mm a")
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-black/[0.02] rounded-xl border border-black/[0.03]">
                <p className="text-sm font-medium opacity-70 leading-relaxed italic line-clamp-2">
                  &ldquo;{log.body}&rdquo;
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => openLog(log)}
                  className="h-8 px-4 !rounded-lg text-[9px] font-bold uppercase tracking-widest gap-2 opacity-40 group-hover:opacity-100 transition-all"
                >
                  View Full Record <ExternalLink className="size-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="h-10 px-6 !rounded-full text-[10px] font-bold uppercase tracking-widest gap-2"
          >
            {isLoadingMore ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <History className="size-4" />
            )}
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {!hasMore && communications.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 border-2 border-dashed border-black/5 rounded-[3rem] bg-black/[0.01]">
          <History className="size-10 opacity-10" />
          <p className="text-sm font-bold opacity-30 uppercase tracking-widest">
            End of Correspondence Logs
          </p>
        </div>
      )}

      <Modal
        open={!!selectedLog}
        onOpenChange={(open) => !open && closeLog()}
        hideHeader
        contentClassName="max-w-2xl border-0 heavy-shadow p-0 overflow-hidden"
        footerClassName="p-8 pt-0 flex gap-3"
        footer={
          selectedLog ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 !rounded-xl border-black/10 font-bold text-xs gap-2"
              >
                <Printer className="size-4" /> Print Record
              </Button>
              <Button
                type="button"
                className="flex-1 h-12 !rounded-xl font-bold text-xs gap-2"
              >
                <Send className="size-4" /> Resend Content
              </Button>
            </>
          ) : null
        }
      >
        {selectedLog && (
          <div className="flex flex-col h-full bg-background">
            <div className="p-8 border-b border-black/[0.03] bg-black/[0.01]">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "size-12 rounded-2xl flex items-center justify-center",
                    selectedLog.message_type === "email"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-green-500/10 text-green-600",
                  )}
                >
                  {selectedLog.message_type === "email" ? (
                    <Mail className="size-6" />
                  ) : (
                    <MessageSquare className="size-6" />
                  )}
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-0 font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full">
                  VERIFIED SENT
                </Badge>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tighter">
                  {selectedLog.message_type === "email"
                    ? "Email Correspondence"
                    : "SMS Text Message"}
                </h2>
                <p className="text-sm font-medium opacity-50">
                  Record of automated outreach sent by SUBI for{" "}
                  {transactionAddress}.
                </p>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">
                    Recipient
                  </p>
                  <p className="font-bold text-sm">
                    {getRecipient(selectedLog)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">
                    Sent At
                  </p>
                  <p className="font-bold text-sm">
                    {parseSentAt(selectedLog.sent_at)
                      ? format(
                          parseSentAt(selectedLog.sent_at)!,
                          "MMMM do, yyyy @ h:mm a",
                        )
                      : "—"}
                  </p>
                </div>
                {selectedLog.subject && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">
                      Subject Line
                    </p>
                    <p className="font-bold text-sm">{selectedLog.subject}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">
                  Message Body
                </p>
                <ScrollArea className="h-[250px] w-full rounded-2xl border border-black/[0.03] bg-black/[0.01] p-6">
                  <p className="text-sm font-medium opacity-70 leading-relaxed whitespace-pre-wrap">
                    {selectedLog.body}
                  </p>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
