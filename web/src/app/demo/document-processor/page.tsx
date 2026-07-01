"use client";

import { useDemoDocumentProcessing } from "@/features/demo-document-processor/hooks/use-demo-document-processing";
import { ProcessingOverlay } from "@/features/transactions/components/processing-overlay";
import { TransactionDialog } from "@/features/transactions/components/transaction-dialog";
import { PROCESSING_STEP } from "@/features/transactions/constants";
import { cn } from "@/lib/utils";
import { Txt } from "@/shared/ui";
import { FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type ChangeEvent } from "react";

const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

export default function DemoDocumentProcessorPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const processing = useDemoDocumentProcessing();

  const triggerFileInput = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (inputRef.current) inputRef.current.value = "";
      if (!file) return;

      setSourceFileName(file.name);
      await processing.processFile(file);
    },
    [processing],
  );

  const handleRetry = useCallback(() => {
    setIsDialogOpen(false);
    setSourceFileName(null);
    processing.reset();
    triggerFileInput();
  }, [processing, triggerFileInput]);

  const handleContinueWithAccount = useCallback(() => {
    router.push("/signup");
  }, [router]);

  const shouldShowOverlay =
    processing.isProcessing ||
    processing.progress.step === PROCESSING_STEP.ERROR;

  const canOpenReview =
    !processing.isProcessing &&
    processing.progress.step === PROCESSING_STEP.COMPLETE &&
    Boolean(processing.result);

  return (
    <div className="min-h-dvh w-full bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
        <div className="w-full max-w-2xl text-center">
          <Txt
            as="h1"
            className="text-3xl/10 font-bold tracking-tight text-foreground"
          >
            Document Processor
          </Txt>
          <Txt as="p" size="base" className="mt-3 text-muted-foreground">
            Upload a file to run real processing and inspect the transaction
            review preview.
          </Txt>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />

        {shouldShowOverlay ? (
          <ProcessingOverlay
            step={processing.progress.step}
            percent={processing.progress.percent}
            message={processing.progress.message}
            error={processing.error}
            onCancel={processing.cancel}
            onRetry={handleRetry}
          />
        ) : (
          <button
            type="button"
            onClick={triggerFileInput}
            className={cn(
              "group relative flex h-96 w-full max-w-2xl cursor-pointer flex-col items-center justify-center gap-10 rounded-[4rem] border-2 border-dashed border-muted-foreground/20 bg-transparent p-12 text-center transition-all hover:border-primary/40",
              "[@media(max-height:720px)]:h-[min(24rem,44dvh)] [@media(max-height:720px)]:p-4",
            )}
          >
            <div className="size-28 rounded-[3rem] bg-muted/50 transition-all group-hover:scale-110 group-hover:bg-primary/5 [@media(max-height:720px)]:size-20">
              <div className="flex size-full items-center justify-center">
                <FileUp className="size-12 text-muted-foreground transition-colors group-hover:text-primary [@media(max-height:720px)]:size-9" />
              </div>
            </div>
            <div className="space-y-3 [@media(max-height:720px)]:space-y-2">
              <Txt
                as="h2"
                className="text-3xl/9 font-bold tracking-tight text-foreground/85"
              >
                Drop a document here
              </Txt>
              <Txt as="p" size="lg" className="text-muted-foreground/75">
                PDF, DOC, DOCX or TXT up to 10MB
              </Txt>
            </div>
          </button>
        )}

        {canOpenReview && (
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="rounded-[2rem] bg-primary px-8 py-4 text-base/6 font-semibold text-primary-foreground shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            Open review preview
          </button>
        )}

        <TransactionDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleContinueWithAccount}
          initialData={processing.result}
          sourceFileId={sourceFileName}
          isSaving={false}
          discardButtonLabel="Close Preview"
          saveButtonLabel="Continue With Account"
          saveButtonLoadingLabel="Continuing..."
        />
      </div>
    </div>
  );
}
