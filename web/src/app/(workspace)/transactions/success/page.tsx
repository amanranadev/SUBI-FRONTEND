"use client";

import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import confettiGif from "@/shared/assets/img/confetti-animated.gif";
import { useWorkspace } from "@/features/workspace/context";
import { useChatWidgetContext } from "@/features/chat/context";
import { TRANSACTIONS_ROUTES } from "@/features/transactions/routes";
import { Button } from "@/shared/ui/button";
import { Txt } from "@/shared/ui";

function TransactionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { transactions } = useWorkspace();
  const { handleOpen: openChatWidget } = useChatWidgetContext();
  const [showConfetti, setShowConfetti] = useState(true);

  const transactionId = searchParams.get("transactionId");
  const transaction = useMemo(
    () => transactions.find((item) => item.id === transactionId) ?? null,
    [transactions, transactionId],
  );

  useEffect(() => {
    if (!transactionId || !transaction) return;

    const timer = window.setTimeout(() => {
      setShowConfetti(false);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [transactionId, transaction]);

  if (!transactionId || !transaction) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-4xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl rounded-[2.5rem] border border-black/5 bg-white p-8 text-center shadow-default">
          <Txt as="h1" size="2xl" weight="bold" className="tracking-tight">
            Transaction created
          </Txt>
          <Txt as="p" size="sm" className="mt-2 text-foreground/60">
            We could not load the success details. You can still view all
            transactions.
          </Txt>
          <Button
            onClick={() => router.push(TRANSACTIONS_ROUTES.ROOT)}
            className="mt-6 h-12 rounded-2xl px-6 font-bold"
          >
            Go to Transactions
          </Button>
        </div>
      </div>
    );
  }

  const detailHref = TRANSACTIONS_ROUTES.detail(transactionId);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-5xl items-center justify-center px-6 py-10">
      {showConfetti ? (
        <img
          src={confettiGif.src}
          alt=""
          aria-hidden
          className="pointer-events-none fixed inset-0 z-10 h-dvh w-screen object-cover opacity-30"
        />
      ) : null}

      <section className="relative z-10 w-full overflow-hidden rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-default sm:p-10">
        <div className="relative">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500/10 text-green-600">
            <CheckCircle2 className="size-9" />
          </div>

          <div className="mt-6 text-center">
            <Txt
              as="p"
              size="xs"
              weight="bold"
              transform="upper"
              className="tracking-widest text-foreground/50"
            >
              Transaction Ready
            </Txt>
            <Txt
              as="h1"
              size="3xl"
              weight="bold"
              className="mt-2 tracking-tight"
            >
              Your transaction was created successfully
            </Txt>
            <Txt
              as="p"
              size="xl"
              weight="medium"
              className="mt-3 text-foreground/65"
            >
              {transaction.address}
            </Txt>
          </div>

          <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            <Button asChild className="h-12 rounded-2xl font-bold">
              <Link href={detailHref}>
                View transaction
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              variant="outline-dark"
              className="h-12 rounded-2xl font-bold"
              onClick={() => {
                openChatWidget({
                  initialMessage: "draft and send an escrow email",
                  transactionId: transactionId ?? undefined,
                  transactionTitle: transaction.address,
                });
              }}
            >
              Send escrow email
              <Mail className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TransactionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <TransactionSuccessContent />
    </Suspense>
  );
}
