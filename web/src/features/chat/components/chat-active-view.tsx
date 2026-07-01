"use client";

import * as React from "react";
import { ChatMessages } from "./chat-messages";
import { ChatWidgetInput } from "./chat-widget-input";
import { useChat } from "../hooks/use-chat";

interface ChatActiveViewProps {
  chatHook: ReturnType<typeof useChat>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isRecording: boolean;
  onVoiceToggle: () => void;
  onAskAboutSomethingElse: () => void;
  onDownloadConvo: () => void;
  onScrollToTop: () => void;
  transactionId?: string;
  streamingText: string | null;
}

export function ChatActiveView({
  chatHook,
  scrollRef,
  isRecording,
  onVoiceToggle,
  onAskAboutSomethingElse,
  onDownloadConvo,
  onScrollToTop,
  transactionId,
  streamingText,
}: ChatActiveViewProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    isInitializing,
    pendingDrafts,
    pendingTemplateSelections,
    pendingTemplatePreviews,
    hasMoreMessages,
    isLoadingMore,
    sendMessage,
    loadOlderMessages,
    sendDraft,
    editDraft,
    cancelDraft,
    pendingDependencies,
    confirmDependency,
    dismissDependency,
    resolveCircularDependency,
    pendingRemovals,
    confirmRemoval,
    dismissRemoval,
    applyTemplateSelection,
    dismissTemplateSelection,
    createNewTemplateFromSelection,
    deleteTemplateFromSelection,
    saveTemplatePreview,
    dismissTemplatePreview,
    pendingCadetFills,
    retryCadetFill,
    pendingCadetActions,
    retryCadetAction,
  } = chatHook;

  const displayMessages = React.useMemo(() => {
    if (!streamingText) return messages;
    return [
      ...messages,
      {
        id: "streaming-in-progress",
        text: streamingText,
        isAi: true,
        timestamp: new Date(),
      },
    ];
  }, [messages, streamingText]);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    sendMessage();
  };

  return (
    <>
      <ChatMessages
        messages={displayMessages}
        isLoading={isLoading && !streamingText}
        isLoadingMore={isLoadingMore}
        hasMoreMessages={hasMoreMessages}
        scrollRef={scrollRef}
        onLoadMore={loadOlderMessages}
        onAskAboutSomethingElse={onAskAboutSomethingElse}
        onReviewConversation={onScrollToTop}
        onDownloadConvo={onDownloadConvo}
        pendingDrafts={pendingDrafts}
        pendingTemplateSelections={pendingTemplateSelections}
        onApplyTemplateSelection={applyTemplateSelection}
        onDeleteTemplateFromSelection={deleteTemplateFromSelection}
        onCreateNewTemplateFromSelection={createNewTemplateFromSelection}
        onDismissTemplateSelection={dismissTemplateSelection}
        pendingTemplatePreviews={pendingTemplatePreviews}
        onSaveTemplatePreview={saveTemplatePreview}
        onDismissTemplatePreview={dismissTemplatePreview}
        onSendDraft={sendDraft}
        onEditDraft={editDraft}
        onCancelDraft={cancelDraft}
        pendingDependencies={pendingDependencies}
        onConfirmDependency={confirmDependency}
        onDismissDependency={dismissDependency}
        onResolveCircular={resolveCircularDependency}
        pendingRemovals={pendingRemovals}
        onConfirmRemoval={confirmRemoval}
        onDismissRemoval={dismissRemoval}
        pendingCadetFills={pendingCadetFills}
        onRetryCadetFill={retryCadetFill}
        pendingCadetActions={pendingCadetActions}
        onRetryCadetAction={retryCadetAction}
        transactionId={transactionId}
      />

      {isInitializing ? (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          Connecting to SUBI...
        </div>
      ) : (
        <ChatWidgetInput
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          isRecording={isRecording}
          onVoiceToggle={onVoiceToggle}
        />
      )}
    </>
  );
}
