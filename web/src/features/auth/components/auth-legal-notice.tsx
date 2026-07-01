import Link from "next/link";
import { Txt } from "@/shared/ui";

const LEGAL_LINK_CLASS =
  "font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80";

type AuthLegalNoticeProps = {
  /** Login uses agree-by-continuing copy; signup uses compact links (checkbox handles consent). */
  variant: "login" | "signup";
};

export function AuthLegalNotice({ variant }: AuthLegalNoticeProps) {
  return (
    <div
      className="mt-8 flex flex-col items-center gap-2 border-t border-border/40 pt-6"
      role="contentinfo"
      aria-label="Legal policies"
    >
      <div className="mx-auto max-w-sm text-center">
        {variant === "login" ? (
          <Txt as="p" size="xs" tone="muted" className="leading-relaxed">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK_CLASS}
            >
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK_CLASS}
            >
              Privacy Policy
            </Link>
            .
          </Txt>
        ) : (
          <Txt as="p" size="xs" tone="muted" className="leading-relaxed">
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK_CLASS}
            >
              Terms of Use
            </Link>
            <span className="text-muted-foreground/60" aria-hidden>
              {" "}
              ·{" "}
            </span>
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK_CLASS}
            >
              Privacy Policy
            </Link>
          </Txt>
        )}
      </div>
    </div>
  );
}
