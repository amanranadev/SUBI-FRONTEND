"use client";

import * as React from "react";
import { SendHorizontal, Mic } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatWidgetInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isRecording: boolean;
  onVoiceToggle: () => void;
}

export function ChatWidgetInput({
  input,
  onInputChange,
  onSend,
  isLoading,
  isRecording,
  onVoiceToggle,
}: ChatWidgetInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "inherit";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative z-10 shrink-0 p-8">
      <div className="relative flex-1 flex items-center rounded-[3.5rem] border border-black/[0.03] bg-white p-2 pr-2.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Subi..."
          rows={1}
          className="min-h-[50px] max-h-[120px] w-full resize-none border-0 bg-transparent px-6 py-4 text-[14px] leading-tight tracking-tighter placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
        />
        <div className="flex items-center gap-2 px-1">
          <Button
            onClick={onVoiceToggle}
            variant="ghost"
            size="icon"
            className={cn(
              "size-10 shrink-0 rounded-full transition-all",
              isRecording
                ? "animate-pulse bg-red-500 text-white"
                : "text-muted-foreground/60 hover:bg-black/5",
            )}
          >
            <Mic className="size-5" />
          </Button>
          <Button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="size-12 shrink-0 rounded-full bg-primary shadow-sm shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <SendHorizontal className="size-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
