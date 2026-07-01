"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "../hooks/use-chat";
import { useChatScroll } from "../hooks/use-chat-scroll";
import { ChatWidgetHeader } from "./chat-widget-header";
import { ChatHistoryList } from "./chat-history-list";
import { SubiTextLogo } from "@/shared/ui";
import { useChatWidgetLifecycle } from "../hooks/use-chat-widget-lifecycle";
import { ChatActiveView } from "./chat-active-view";

interface ChatWidgetProps {
  currentView?: "home" | "transactions" | "detail";
  onViewChange?: (view: "home" | "transactions" | "detail") => void;
  transactionTitle?: string;
  transactionId?: string;
  uploadId?: string;
}

export function ChatWidget({
  currentView,
  onViewChange,
  transactionTitle,
  transactionId,
  uploadId,
}: ChatWidgetProps) {
  const chatHook = useChat();
  const {
    chatId,
    messages,
    isLoading,
    isInitializing,
    streamingText,
    chatList,
    isChatListLoading,
    hasMoreChats,
    createNewChat,
    clearActiveChat,
    loadMoreChats,
    openChat,
    deleteChat,
  } = chatHook;

  const lifecycle = useChatWidgetLifecycle({
    currentView,
    transactionTitle,
    transactionId,
    uploadId,
    chatHook,
  });

  const displayMessagesForScroll = React.useMemo(() => {
    if (!streamingText) return messages;
    return [
      ...messages,
      {
        id: "scroll-sync",
        text: streamingText,
        isAi: true,
        timestamp: new Date(),
      },
    ];
  }, [messages, streamingText]);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollToTop } = useChatScroll(scrollRef, [
    displayMessagesForScroll,
    isLoading,
    lifecycle.isOpen,
    lifecycle.isClosing,
  ]);

  const handleNewChat = React.useCallback(async () => {
    clearActiveChat();
    await createNewChat({
      transaction_id: transactionId,
      upload_id: uploadId,
      title: transactionTitle,
    });
  }, [
    clearActiveChat,
    createNewChat,
    transactionId,
    transactionTitle,
    uploadId,
  ]);

  const handleSelectChat = React.useCallback(
    async (id: string) => {
      await openChat(id);
    },
    [openChat],
  );

  const handleAskAboutSomethingElse = () => {
    onViewChange?.("home");
    clearActiveChat();
  };

  const showHistoryList = !chatId && !isInitializing;

  return (
    <>
      {(lifecycle.isOpen || lifecycle.isClosing) && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none fixed inset-0 z-40 bg-black/5 transition-opacity",
            lifecycle.isClosing
              ? "animate-out fade-out duration-700"
              : "animate-in fade-in duration-300",
          )}
        />
      )}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-6 sm:bottom-12 sm:right-12">
        {lifecycle.isOpen || lifecycle.isClosing ? (
          <div
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "glass-card heavy-shadow flex h-[75vh] max-h-[75svh] w-[min(620px,calc(100vw-3rem))] flex-col overflow-hidden rounded-[3rem] border-white/60 fill-mode-forwards sm:rounded-[4rem]",
              lifecycle.isClosing
                ? "animate-out fade-out slide-out-to-bottom-12 zoom-out-95 duration-700"
                : "animate-in slide-in-from-bottom-12 fade-in duration-700",
            )}
          >
            <ChatWidgetHeader
              currentView={currentView}
              transactionTitle={lifecycle.effectiveTransactionTitle ?? undefined}
              contextUploadId={chatHook.contextUploadId}
              onClose={lifecycle.handleClose}
              onNewChat={handleNewChat}
              onBackToList={chatId ? clearActiveChat : undefined}
            />

            {showHistoryList ? (
              <ChatHistoryList
                chats={chatList}
                isLoading={isChatListLoading}
                hasMore={hasMoreChats}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onDeleteChat={deleteChat}
                onLoadMore={loadMoreChats}
              />
            ) : (
              <ChatActiveView
                chatHook={chatHook}
                scrollRef={scrollRef}
                isRecording={lifecycle.isRecording}
                onVoiceToggle={lifecycle.handleVoiceToggle}
                onAskAboutSomethingElse={handleAskAboutSomethingElse}
                onDownloadConvo={lifecycle.handleDownloadConvo}
                onScrollToTop={scrollToTop}
                transactionId={transactionId}
                streamingText={streamingText}
              />
            )}
          </div>
        ) : (
          <Button
            onClick={() => lifecycle.handleOpen()}
            className="h-20 w-20 !rounded-[2rem] bg-primary shadow-[0_40px_80px_-15px_rgba(0,0,0,0.45)] transition-all hover:scale-110 active:scale-90"
          >
            <SubiTextLogo variant="s-only" fill="white" size={36} />
          </Button>
        )}
      </div>
    </>
  );
}
