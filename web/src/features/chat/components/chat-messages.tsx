"use client";

import * as React from "react";
import { MessageSquareText, History, Download, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { DraftCard } from "./draft-card";
import { TemplateSelectionCard } from "./template-selection-card";
import { TemplatePreviewCard } from "./template-preview-card";
import { TaskDependencyCard } from "./task-dependency-card";
import { TaskDependencyRemovalCard } from "./task-dependency-removal-card";
import type {
  Message,
  MessageDraft,
  TaskDependencyClarification,
  TaskDependencyRemoval,
  TemplateSelectionRequest,
  EmailTemplatePreview,
} from "../types";
import type { EditDraftPayload } from "../api/draft-service";
import type { EmailTemplateSource } from "@/features/settings/api/email-template-service";
import {
  assistantDraftMessageLikelyMatchesDraft,
  isAssistantDraftReviewMessage,
  isInternalCommandPayloadMessage,
  redactTechnicalIds,
} from "../chat-message-sanitizer";
import { CadetFillStatusCard } from "@/features/cadet/components/cadet-fill-status-card";
import { CadetActionStatusCard } from "@/features/cadet/components/cadet-action-status-card";
import type { CadetFillRequest, CadetActionRequest } from "@/features/cadet/types";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onAskAboutSomethingElse: () => void;
  onReviewConversation: () => void;
  onDownloadConvo: () => void;
  onLoadMore?: () => void;
  pendingDrafts?: MessageDraft[];
  pendingTemplateSelections?: TemplateSelectionRequest[];
  onApplyTemplateSelection?: (requestId: string, templateId: string) => Promise<void>;
  onDeleteTemplateFromSelection?: (requestId: string, templateId: string) => Promise<void>;
  onCreateNewTemplateFromSelection?: (requestId: string) => Promise<void>;
  onDismissTemplateSelection?: (requestId: string) => void;
  pendingTemplatePreviews?: EmailTemplatePreview[];
  onSaveTemplatePreview?: (
    previewId: string,
    payload: { name: string; content: string; description?: string; source?: EmailTemplateSource },
  ) => Promise<void>;
  onDismissTemplatePreview?: (previewId: string) => void;
  onSendDraft?: (id: string) => Promise<void>;
  onEditDraft?: (id: string, payload: EditDraftPayload) => Promise<void>;
  onCancelDraft?: (id: string) => Promise<void>;
  pendingDependencies?: TaskDependencyClarification[];
  onConfirmDependency?: (depId: string, childTaskId: string, parentTaskId: string, daysAfterParent: number) => Promise<void>;
  onDismissDependency?: (id: string) => void;
  onResolveCircular?: (
    depId: string,
    childTaskId: string,
    parentTaskId: string,
    daysAfterParent: number,
    conflictingChildTaskId: string,
  ) => void;
  pendingRemovals?: TaskDependencyRemoval[];
  onConfirmRemoval?: (removalId: string, childTaskId: string) => Promise<void>;
  onDismissRemoval?: (id: string) => void;
  pendingCadetFills?: CadetFillRequest[];
  onRetryCadetFill?: (requestId: string) => void;
  pendingCadetActions?: CadetActionRequest[];
  onRetryCadetAction?: (requestId: string) => void;
  transactionId?: string;
}

export function ChatMessages({
  messages,
  isLoading,
  isLoadingMore = false,
  hasMoreMessages = false,
  scrollRef,
  onAskAboutSomethingElse,
  onReviewConversation,
  onDownloadConvo,
  onLoadMore,
  pendingDrafts = [],
  pendingTemplateSelections = [],
  onApplyTemplateSelection,
  onDeleteTemplateFromSelection,
  onCreateNewTemplateFromSelection,
  onDismissTemplateSelection,
  pendingTemplatePreviews = [],
  onSaveTemplatePreview,
  onDismissTemplatePreview,
  onSendDraft,
  onEditDraft,
  onCancelDraft,
  pendingDependencies = [],
  onConfirmDependency,
  onDismissDependency,
  onResolveCircular,
  pendingRemovals = [],
  onConfirmRemoval,
  onDismissRemoval,
  pendingCadetFills = [],
  onRetryCadetFill,
  pendingCadetActions = [],
  onRetryCadetAction,
  transactionId,
}: ChatMessagesProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const prevScrollHeightRef = React.useRef<number>(0)
  const isRestoringScrollRef = React.useRef(false)

  React.useLayoutEffect(() => {
    if (!isRestoringScrollRef.current) return
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    )
    if (!viewport) return

    const newScrollHeight = viewport.scrollHeight
    const delta = newScrollHeight - prevScrollHeightRef.current
    if (delta > 0) {
      viewport.scrollTop += delta
    }
    isRestoringScrollRef.current = false
  }, [messages, pendingDrafts, scrollRef])

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMoreMessages) return

    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    )
    if (!viewport) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreMessages && !isLoadingMore && onLoadMore) {
          prevScrollHeightRef.current = viewport.scrollHeight
          isRestoringScrollRef.current = true
          onLoadMore()
        }
      },
      { root: viewport, rootMargin: "100px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMoreMessages, isLoadingMore, onLoadMore, scrollRef])

  return (
    <ScrollArea ref={scrollRef} className="min-h-0 flex-1">
      <div className="flex flex-col gap-1.5 p-6">
        {hasMoreMessages && <div ref={sentinelRef} className="h-1" />}

        {isLoadingMore && (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {pendingCadetFills.length > 0 ? (
          <div className="space-y-2 pb-2">
            {pendingCadetFills.map((request) => (
              <div key={request.id} className="py-1 px-1 message-in">
                <CadetFillStatusCard
                  request={request}
                  onRetry={
                    onRetryCadetFill
                      ? () => onRetryCadetFill(request.id)
                      : undefined
                  }
                  compact
                />
              </div>
            ))}
          </div>
        ) : null}

        {pendingCadetActions.length > 0 ? (
          <div className="space-y-2 pb-2">
            {pendingCadetActions.map((request) => (
              <div key={request.id} className="py-1 px-1 message-in">
                <CadetActionStatusCard
                  request={request}
                  onRetry={
                    onRetryCadetAction
                      ? () => onRetryCadetAction(request.id)
                      : undefined
                  }
                  compact
                />
              </div>
            ))}
          </div>
        ) : null}

        {(() => {
          const filteredMessages = messages.filter((msg) => {
            if (msg.hidden) return false;
            if (msg.text.trim().length === 0) return false;
            if (isInternalCommandPayloadMessage(msg.text)) return false;
            if (
              msg.isAi &&
              isAssistantDraftReviewMessage(msg.text) &&
              pendingDrafts.some((d) => assistantDraftMessageLikelyMatchesDraft(msg.text, d))
            ) {
              return false;
            }
            return true;
          });

          type TimelineItem =
            | { kind: "message"; data: Message; ts: number }
            | { kind: "draft"; data: MessageDraft; ts: number }

          const timeline: TimelineItem[] = [
            ...filteredMessages.map((msg) => ({ kind: "message" as const, data: msg, ts: msg.timestamp.getTime() })),
            ...pendingDrafts.map((draft) => ({ kind: "draft" as const, data: draft, ts: draft.timestamp.getTime() })),
          ].sort((a, b) => a.ts - b.ts);

          return timeline.map((item) => {
            if (item.kind === "message") {
              const msg = item.data;
              return (
                <div key={msg.id} className="space-y-1.5">
                  <ChatMessage
                    message={redactTechnicalIds(msg.text)}
                    isAi={msg.isAi}
                    timestamp={msg.timestamp}
                    compact
                  />
                  {msg.isSpecial && (
                    <SpecialMessageActions
                      onAskAboutSomethingElse={onAskAboutSomethingElse}
                      onReviewConversation={onReviewConversation}
                      onDownloadConvo={onDownloadConvo}
                    />
                  )}
                </div>
              );
            }
            const draft = item.data;
            return (
              <div key={draft.id} className="py-2 px-1 message-in">
                <DraftCard
                  draft={draft}
                  onSend={onSendDraft ?? (async () => { })}
                  onEdit={onEditDraft}
                  onCancel={onCancelDraft ?? (async () => { })}
                  compact
                />
              </div>
            );
          });
        })()}

        {pendingTemplateSelections.map((request) => (
          <div key={request.id} className="py-2 px-1 message-in">
            <TemplateSelectionCard
              request={request}
              onSelect={onApplyTemplateSelection ?? (async () => { })}
              onDeleteTemplate={onDeleteTemplateFromSelection ?? (async () => { })}
              onCreateNewTemplate={onCreateNewTemplateFromSelection ?? (async () => { })}
              onDismiss={onDismissTemplateSelection ?? (() => { })}
            />
          </div>
        ))}

        {pendingTemplatePreviews.map((preview) => (
          <div key={preview.id} className="py-2 px-1 message-in">
            <TemplatePreviewCard
              preview={preview}
              onSave={onSaveTemplatePreview ?? (async () => { })}
              onDismiss={onDismissTemplatePreview ?? (() => { })}
            />
          </div>
        ))}

        {pendingDependencies.map((dep) => (
          <div key={dep.id} className="py-2 px-1 message-in">
            <TaskDependencyCard
              dependency={dep}
              transactionId={transactionId}
              onConfirm={onConfirmDependency ?? (async () => { })}
              onDismiss={onDismissDependency ?? (() => { })}
              onResolveCircular={onResolveCircular ?? (() => { })}
              compact
            />
          </div>
        ))}

        {pendingRemovals.map((removal) => (
          <div key={removal.id} className="py-2 px-1 message-in">
            <TaskDependencyRemovalCard
              removal={removal}
              onConfirm={onConfirmRemoval ?? (async () => { })}
              onDismiss={onDismissRemoval ?? (() => { })}
              compact
            />
          </div>
        ))}

        {isLoading && (
          <div className="animate-pulse flex flex-row gap-2 p-3">
            <div className="h-8 w-32 rounded-[2rem] bg-primary/10" />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function SpecialMessageActions({
  onAskAboutSomethingElse,
  onReviewConversation,
  onDownloadConvo,
}: {
  onAskAboutSomethingElse: () => void;
  onReviewConversation: () => void;
  onDownloadConvo: () => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-left-4 flex flex-col items-start gap-1.5 pl-10 delay-300 duration-1000">
      <div className="flex flex-row flex-wrap justify-start gap-1.5">
        <Button
          onClick={onAskAboutSomethingElse}
          variant="outline-dark"
          className="group h-7 gap-1.5 rounded-xl border-black/10 px-3 text-[8.5px] font-bold transition-all hover:bg-black/5"
        >
          <MessageSquareText className="size-2.5 opacity-40 transition-opacity group-hover:opacity-100" />
          Something else
        </Button>
        <Button
          onClick={onReviewConversation}
          variant="outline-dark"
          className="group h-7 gap-1.5 rounded-xl border-black/10 px-3 text-[8.5px] font-bold transition-all hover:bg-black/5"
        >
          <History className="size-2.5 opacity-40 transition-opacity group-hover:opacity-100" />
          Review convo
        </Button>
        <Button
          onClick={onDownloadConvo}
          variant="outline-dark"
          className="group h-7 gap-1.5 rounded-xl border-primary/20 px-3 text-[8.5px] font-bold text-primary transition-all hover:bg-black/5"
        >
          <Download className="size-2.5 opacity-60 transition-opacity group-hover:opacity-100" />
          Download
        </Button>
      </div>
    </div>
  );
}
