"use client";

import { useRef, type ChangeEvent } from "react";
import { Camera } from "lucide-react";

type ImageUploadProps = {
  src: string | null;
  fallback?: React.ReactNode;
  isBusy?: boolean;
  onFileChange: (file: File | null) => void;
  className?: string;
};

export function ImageUpload({
  src,
  fallback,
  isBusy = false,
  onFileChange,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (isBusy) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileChange(file);
  };

  return (
    <div className="relative group">
      <div className="h-40 w-40 rounded-[3.5rem] bg-primary/5 flex items-center justify-center border-4 border-white shadow-default overflow-hidden">
        {src ? (
          <img
            src={src}
            alt=""
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          fallback
        )}
      </div>

      <button
        type="button"
        className="absolute bottom-2 right-2 h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100 disabled:active:scale-100"
        onClick={handleClick}
        disabled={isBusy}
        aria-label="Upload image"
      >
        <Camera className="size-6" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isBusy}
      />
    </div>
  );
}
