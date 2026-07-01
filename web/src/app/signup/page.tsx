import { Suspense } from "react";
import { SignupView } from "@/features/auth/views/signup-view";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupView />
    </Suspense>
  );
}
