import * as React from "react";
import { Bug, Copy, Info, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea, Txt } from "@/shared/ui";
import { documentService } from "@/features/transactions/api/document-service";
import type { TransactionFormData } from "@/features/transactions/types";
import { toast } from "@/shared/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Modal } from "@/shared/ui/modal";

type ReviewHeaderProps = {
  sourceFileId?: string | null;
  getFormData?: () => TransactionFormData;
};

type ActiveModal = "ai-result" | "extracted-text" | "report-issue" | null;

export function ReviewHeader({ sourceFileId, getFormData }: ReviewHeaderProps) {
  const [activeModal, setActiveModal] = React.useState<ActiveModal>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCompactInfoOpen, setIsCompactInfoOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [reportDescription, setReportDescription] = React.useState("");
  const [statusData, setStatusData] = React.useState<Awaited<
    ReturnType<typeof documentService.getStatus>
  > | null>(null);

  const ensureSourceFile = React.useCallback(() => {
    if (sourceFileId) return true;
    toast({
      title: "Source file unavailable",
      description:
        "We could not identify the uploaded file for this draft. Please reprocess or reopen the draft.",
      variant: "destructive",
    });
    return false;
  }, [sourceFileId]);

  const copyToClipboard = React.useCallback(async (value: unknown) => {
    const text =
      typeof value === "string" ? value : JSON.stringify(value, null, 2);
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  }, []);

  const fetchStatusAndOpen = React.useCallback(
    async (modal: Exclude<ActiveModal, "report-issue">) => {
      if (!ensureSourceFile() || !sourceFileId) return;
      setIsLoading(true);
      setError(null);

      try {
        const status = await documentService.getStatus(sourceFileId);
        setStatusData(status);
        setActiveModal(modal);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load file diagnostics.";
        setError(message);
        setActiveModal(modal);
      } finally {
        setIsLoading(false);
      }
    },
    [ensureSourceFile, sourceFileId],
  );

  const handleSubmitReport = React.useCallback(async () => {
    if (!reportDescription.trim()) {
      setError("Please describe the issue before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        sourceFileId: sourceFileId ?? null,
        description: reportDescription.trim(),
        createdAt: new Date().toISOString(),
        formData: getFormData ? getFormData() : null,
        aiResult: statusData?.transaction_data ?? null,
        extractedText: statusData?.extracted_text ?? null,
      };

      await copyToClipboard(payload);

      const subject = encodeURIComponent(
        `Transaction Review Issue${sourceFileId ? ` - File ${sourceFileId}` : ""}`,
      );
      const body = encodeURIComponent(
        [
          "Hi SUBI team,",
          "",
          reportDescription.trim(),
          "",
          "Diagnostic payload was copied to clipboard.",
          "Please paste it below this line before sending:",
          "",
          "---",
          "",
        ].join("\n"),
      );

      window.location.href = `mailto:hello@oksubi.com?subject=${subject}&body=${body}`;
      setActiveModal(null);
      setReportDescription("");
      toast({
        title: "Report prepared",
        description:
          "Your issue details were copied and email composer opened.",
      });
    } catch {
      setError("Could not prepare issue report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    copyToClipboard,
    getFormData,
    reportDescription,
    sourceFileId,
    statusData?.extracted_text,
    statusData?.transaction_data,
  ]);

  return (
    <div className="flex flex-col gap-6 [@media(max-height:720px)]:gap-2">
      <div className="flex items-center gap-3">
        <Txt
          as="span"
          size="4xl"
          weight="bold"
          className="tracking-tighter [@media(max-height:720px)]:text-2xl/7"
        >
          All Done! 👍
        </Txt>
      </div>

      <div className="space-y-2 [@media(max-height:720px)]:space-y-1">
        <div className="relative flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tighter opacity-80 [@media(max-height:720px)]:text-sm/5">
            Review and edit the information extracted from your document
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden [@media(max-height:720px)]:inline-flex size-6 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
            onClick={() => setIsCompactInfoOpen((prev) => !prev)}
            aria-label={isCompactInfoOpen ? "Hide tips" : "Show tips"}
          >
            <Info className="size-3.5" />
          </Button>
        </div>
        <p
          className={cn(
            "text-muted-foreground font-medium text-lg leading-tight opacity-60",
            !isCompactInfoOpen && "[@media(max-height:720px)]:hidden",
          )}
        >
          Our AI did the heavy lifting, but it may not be perfect. Please
          double-check each section below to make sure everything looks
          right.
        </p>
      </div>

      <div className="flex gap-3 [@media(max-height:720px)]:gap-2">
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => fetchStatusAndOpen("ai-result")}
          className="!rounded-2xl h-11 px-6 font-bold gap-2 [@media(max-height:720px)]:h-8 [@media(max-height:720px)]:text-xs"
        >
          <Sparkles className="size-4" />
          {isLoading && activeModal === "ai-result"
            ? "Loading..."
            : "AI Result"}
        </Button>
        <Button
          variant="outline"
          className="!rounded-2xl h-11 px-6 font-bold gap-2 [@media(max-height:720px)]:h-8 [@media(max-height:720px)]:text-xs"
          onClick={() => {
            setError(null);
            setActiveModal("report-issue");
          }}
        >
          <Bug className="size-4" />
          Report Issue
        </Button>
      </div>

      <Modal
        open={activeModal === "ai-result"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        hideHeader
        contentClassName="max-h-[80vh] max-w-4xl overflow-auto [@media(max-height:720px)]:max-h-[86dvh]"
      >
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Sparkles className="size-4 text-violet-600" />
              AI Result
            </h2>
            <p className="text-sm text-muted-foreground">
              Parsed AI result for the source file used in this review.
            </p>
          </div>
          {error ? (
            <Txt tone="destructive" size="sm">
              {error}
            </Txt>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(statusData?.transaction_data ?? statusData)
                  }
                >
                  <Copy className="size-4" />
                  Copy JSON
                </Button>
              </div>
              <pre className="max-h-[52vh] overflow-auto rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-xs">
                {JSON.stringify(
                  statusData?.transaction_data ?? statusData,
                  null,
                  2,
                )}
              </pre>
            </div>
          )}
      </Modal>

      <Modal
        open={activeModal === "report-issue"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        hideHeader
        contentClassName="max-w-2xl [@media(max-height:720px)]:max-h-[86dvh] [@media(max-height:720px)]:overflow-auto"
      >
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Bug className="size-4 text-orange-600" />
              Report Issue
            </h2>
            <p className="text-sm text-muted-foreground">
              Describe what looks wrong. We will include diagnostics automatically.
            </p>
          </div>
          <div className="space-y-3">
            {error ? (
              <Txt tone="destructive" size="sm">
                {error}
              </Txt>
            ) : null}
            <Textarea
              value={reportDescription}
              onChange={(event) => setReportDescription(event.target.value)}
              placeholder="Example: Buyer phone was parsed into seller phone field..."
              className="[@media(max-height:720px)]:max-h-[38dvh] [@media(max-height:720px)]:min-h-32"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setActiveModal(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl"
                onClick={handleSubmitReport}
                disabled={isSubmitting || !reportDescription.trim()}
              >
                {isSubmitting ? "Preparing..." : "Send report"}
              </Button>
            </div>
          </div>
      </Modal>
    </div>
  );
}
