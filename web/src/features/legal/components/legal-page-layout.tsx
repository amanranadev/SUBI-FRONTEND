"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SubiTextLogo, Txt } from "@/shared/ui";

type LegalPageLayoutProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-card font-body font-normal text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-8">
          <Link href="/" aria-label="Subi home" className="block h-8 w-auto">
            <SubiTextLogo className="h-full w-auto" variant="full" />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium underline transition-all duration-300 hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 pb-16 sm:px-8 sm:py-12 sm:pb-20">
        <Txt
          as="h1"
          size="4xl"
          weight="regular"
          className="tracking-tight"
        >
          {title}
        </Txt>
        <Txt as="p" size="sm" tone="muted" className="mt-2">
          Last updated: {lastUpdated}
        </Txt>

        <div className="legal-content mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
          {children}
        </div>
      </main>
    </div>
  );
}
