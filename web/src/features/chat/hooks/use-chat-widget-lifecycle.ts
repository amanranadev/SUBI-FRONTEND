import * as React from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { useChat } from "./use-chat";
import { useChatWidgetContext } from "../context";

interface UseChatWidgetLifecycleProps {
  currentView?: "home" | "transactions" | "detail";
  transactionTitle?: string;
  transactionId?: string;
  uploadId?: string;
  chatHook: ReturnType<typeof useChat>;
}

export function useChatWidgetLifecycle({
  currentView,
  transactionTitle,
  transactionId,
  uploadId,
  chatHook,
}: UseChatWidgetLifecycleProps) {
  const {
    chatId,
    isInitializing,
    clearActiveChat,
    createNewChat,
    appendMessage,
    isLoading,
    sendMessage,
    chatListLoaded,
    isChatListLoading,
    loadChatList,
    messages,
    setInput,
  } = chatHook;

  const {
    isOpen,
    isClosing,
    handleOpen,
    handleClose,
    pendingMessage,
    pendingTransactionId,
    pendingTransactionTitle,
    clearPendingMessage,
  } = useChatWidgetContext();

  const { toast } = useToast();
  const [isRecording, setIsRecording] = React.useState(false);
  const [pendingAutoSend, setPendingAutoSend] = React.useState<string | null>(null);
  const [activeTransactionTitle, setActiveTransactionTitle] = React.useState<string | null>(null);
  const [hasShownContextualNotice, setHasShownContextualNotice] = React.useState(false);

  // Track the active transaction title from context
  React.useEffect(() => {
    if (pendingTransactionTitle) {
      setActiveTransactionTitle(pendingTransactionTitle);
    }
  }, [pendingTransactionTitle]);

  // Clear state when chat is closed
  React.useEffect(() => {
    if (!isOpen && !isClosing) {
      setActiveTransactionTitle(null);
      setHasShownContextualNotice(false);
    }
  }, [isOpen, isClosing]);

  const effectiveTransactionTitle = transactionTitle || activeTransactionTitle;

  // Handle opening chat with context and auto-send
  React.useEffect(() => {
    if (isOpen && pendingTransactionId && pendingMessage && !isInitializing) {
      const messageToSend = pendingMessage;
      const chatTitle = pendingTransactionTitle || undefined;
      setPendingAutoSend(messageToSend);
      clearPendingMessage();

      if (chatId) {
        clearActiveChat();
      }

      createNewChat({
        transaction_id: pendingTransactionId,
        title: chatTitle,
      });
    }
  }, [isOpen, pendingTransactionId, pendingTransactionTitle, pendingMessage, chatId, isInitializing, createNewChat, clearPendingMessage, clearActiveChat]);

  // Contextual notice logic
  React.useEffect(() => {
    if (!chatId || !pendingAutoSend || isInitializing) return;

    if (!hasShownContextualNotice && effectiveTransactionTitle) {
      setHasShownContextualNotice(true);
      appendMessage({
        id: `contextual-notice-${chatId}`,
        text: "I am now logging all conversations as they pertain to the open transaction. What questions do you have?!",
        isAi: true,
        timestamp: new Date(),
        isSpecial: true,
      });
      return;
    }

    if (!isLoading && (hasShownContextualNotice || !effectiveTransactionTitle)) {
      const messageToSend = pendingAutoSend;
      setPendingAutoSend(null);
      sendMessage(messageToSend);
    }
  }, [chatId, pendingAutoSend, isInitializing, isLoading, hasShownContextualNotice, effectiveTransactionTitle, appendMessage, sendMessage]);

  // Load chat list on open
  React.useEffect(() => {
    if (isOpen && !chatListLoaded && !isChatListLoading) {
      loadChatList(1);
    }
  }, [isOpen, chatListLoaded, isChatListLoading, loadChatList]);

  // Sync transaction ID changes
  const prevTransactionIdRef = React.useRef<string | undefined>(transactionId);
  React.useEffect(() => {
    const prevTransactionId = prevTransactionIdRef.current;
    prevTransactionIdRef.current = transactionId;

    if (
      isOpen &&
      chatId &&
      !isInitializing &&
      transactionId &&
      transactionId !== prevTransactionId
    ) {
      clearActiveChat();
      createNewChat({
        transaction_id: transactionId,
        upload_id: uploadId,
        title: transactionTitle,
      });
    }
  }, [isOpen, chatId, isInitializing, transactionId, transactionTitle, uploadId, clearActiveChat, createNewChat]);

  // Contextual notice for navigation
  React.useEffect(() => {
    if (pendingAutoSend) return;
    if (!isOpen || !chatId || currentView !== "detail" || hasShownContextualNotice) return;

    setHasShownContextualNotice(true);
    appendMessage({
      id: `contextual-notice-${currentView}`,
      text: "I am now logging all conversations as they pertain to the open transaction. What questions do you have?!",
      isAi: true,
      timestamp: new Date(),
      isSpecial: true,
    });
  }, [isOpen, chatId, currentView, hasShownContextualNotice, pendingAutoSend, appendMessage]);

  const handleDownloadConvo = () => {
    const content = messages
      .map((m) => `[${m.timestamp.toLocaleString()}] ${m.isAi ? "SUBI" : "You"}: ${m.text}`)
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `conversation-${transactionTitle ?? "chat"}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your conversation record is being downloaded.",
    });
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast({
        title: "Voice Assistant Active",
        description: "SUBI is listening to your transaction notes...",
      });
    } else {
      setIsRecording(false);
      toast({
        title: "Transcription Finished",
        description: "Voice memo has been added to the chat.",
      });
      setInput("Check the earnest money status for 4 Privet Drive.");
    }
  };

  return {
    effectiveTransactionTitle,
    isRecording,
    handleDownloadConvo,
    handleVoiceToggle,
    isOpen,
    isClosing,
    handleOpen,
    handleClose,
  };
}
