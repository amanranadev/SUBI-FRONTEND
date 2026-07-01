import type { Metadata } from "next";
import { PrivacyPolicyView } from "@/features/legal/views/privacy-policy-view";

export const metadata: Metadata = {
  title: "Privacy Notice | Subi",
  description:
    "How Subi Incorporated collects, uses, and discloses your personal information.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
