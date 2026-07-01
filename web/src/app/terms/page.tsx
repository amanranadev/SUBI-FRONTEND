import type { Metadata } from "next";
import { TermsOfUseView } from "@/features/legal/views/terms-of-use-view";

export const metadata: Metadata = {
  title: "Terms of Use | Subi",
  description:
    "The terms and conditions that govern your use of the Subi platform and related services.",
};

export default function TermsOfUsePage() {
  return <TermsOfUseView />;
}
