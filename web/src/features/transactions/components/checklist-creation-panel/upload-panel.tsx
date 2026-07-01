import * as React from "react";
import { FileCode } from "lucide-react";
import { Button } from "@/shared/ui/button";

type UploadPanelProps = {
  csvError: string | null;
  isSubmitting: boolean;
  csvInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (file: File) => void;
  onDropFile: (event: React.DragEvent) => void;
  onBack: () => void;
};

export function UploadPanel({
  csvError,
  isSubmitting,
  csvInputRef,
  onFileSelect,
  onDropFile,
  onBack,
}: UploadPanelProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelect(file);
          event.target.value = "";
        }}
      />

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDropFile}
        onClick={() => csvInputRef.current?.click()}
        className="p-12 border-2 border-dashed border-black/10 rounded-[3rem] bg-black/[0.01] flex flex-col items-center justify-center text-center gap-6 cursor-pointer hover:border-primary/40 transition-colors"
      >
        <div className="size-20 rounded-[2rem] bg-black/5 flex items-center justify-center">
          <FileCode className="size-10 opacity-30" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tighter">Drop Checklist CSV</h3>
          <p className="text-sm font-medium opacity-40 max-w-sm mx-auto">
            Format your CSV with two columns: <span className="font-bold">Category</span> and{" "}
            <span className="font-bold">Task Name</span>.
          </p>
          <p className="text-xs font-bold text-primary">Click to browse or drag & drop</p>
        </div>
        {csvError ? <p className="text-sm font-medium text-destructive">{csvError}</p> : null}
      </div>
      <div className="flex justify-center">
        <a
          href="/sample-checklist.csv"
          download="sample-checklist.csv"
          onClick={(event) => event.stopPropagation()}
          className="text-xs font-bold text-primary hover:underline"
        >
          Download sample CSV template
        </a>
      </div>
      <Button
        variant="ghost"
        onClick={onBack}
        className="w-full text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-white"
        disabled={isSubmitting}
      >
        Back to selection
      </Button>
    </div>
  );
}
