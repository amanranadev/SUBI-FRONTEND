"use client";

import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/features/workspace/context";
import { ProcessingOverlay } from "@/features/transactions/components/processing-overlay";
import { DraftsSection } from "@/features/transactions/components/drafts-section";
import { PROCESSING_STEP } from "@/features/transactions/constants";
import { Txt } from "@/shared/ui";

export default function HomeWorkspacePage() {
  const {
    fileInputRef,
    isProcessingFile,
    processingProgress,
    processingError,
    handleFileSelect,
    handleOpenDialogFromDropzone,
    cancelProcessing,
    retryProcessing,
    drafts,
    isDraftsLoading,
    draftsHasMore,
    draftsLoadMore,
    draftsLoadingMore,
    draftsTotalCount,
    handleOpenDraft,
    handleDeleteDraft,
    isDeletingDraft,
  } = useWorkspace();

  const showProcessing =
    isProcessingFile || processingProgress.step === PROCESSING_STEP.ERROR;

  return (
    <div className="flex-1 min-h-full w-full overflow-hidden flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showProcessing ? (
        <ProcessingOverlay
          step={processingProgress.step}
          percent={processingProgress.percent}
          message={processingProgress.message}
          error={processingError}
          onCancel={cancelProcessing}
          onRetry={retryProcessing}
        />
      ) : (
        <div className="w-full flex flex-col items-center justify-center overflow-hidden [@media(max-height:720px)]:px-1.5 [@media(max-height:720px)]:pt-1">
          <div className="w-full max-w-2xl px-4 shrink-0 [@media(max-height:720px)]:px-0">
            <div
              onClick={handleOpenDialogFromDropzone}
              className={cn(
                "group relative rounded-[4rem] border-2 border-dashed",
                "flex flex-col items-center justify-center text-center gap-10",
                "transition-all cursor-pointer bg-transparent",
                "border-muted-foreground/20 hover:border-primary/40",
                "h-96 p-16 [@media(max-height:720px)]:h-[min(24rem,44dvh)] [@media(max-height:720px)]:p-4",
              )}
            >
              <div
                className={cn(
                  "rounded-[3rem] flex items-center justify-center",
                  "bg-muted/50 group-hover:scale-110 group-hover:bg-primary/5 transition-all",
                  "size-28 [@media(max-height:720px)]:size-20",
                )}
              >
                <FileUp
                  className={cn(
                    "text-muted-foreground group-hover:text-primary transition-colors",
                    "size-12 [@media(max-height:720px)]:size-9",
                  )}
                />
              </div>
              <div className="space-y-4 [@media(max-height:720px)]:space-y-2">
                <Txt
                  as="h2"
                  className={cn(
                    "font-bold tracking-tighter text-foreground/80 leading-tight",
                    "text-3xl [@media(max-height:720px)]:text-xl/7",
                  )}
                >
                  Drop a document here
                </Txt>
                <Txt
                  as="span"
                  size="lg"
                  weight="medium"
                  className="text-muted-foreground opacity-60 [@media(max-height:720px)]:text-sm/5"
                >
                  I&apos;ll process it and start a new file for you!
                </Txt>
              </div>
            </div>
          </div>

          {/* <div className="w-full max-w-2xl px-4 mt-6 pb-6 [@media(max-height:720px)]:px-0 [@media(max-height:720px)]:mt-1 [@media(max-height:720px)]:pb-1">
            <DraftsSection
              drafts={drafts}
              isLoading={isDraftsLoading}
              hasMore={draftsHasMore}
              onLoadMore={draftsLoadMore}
              isLoadingMore={draftsLoadingMore}
              totalCount={draftsTotalCount}
              onOpen={handleOpenDraft}
              onDelete={handleDeleteDraft}
              isDeleting={isDeletingDraft}
            />
          </div> */}
        </div>
      )}
    </div>
  );
}
