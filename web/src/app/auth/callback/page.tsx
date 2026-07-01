import { Suspense } from "react";
import { OAuthCallbackView } from "@/features/auth/views/oauth-callback-view";

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackView />
    </Suspense>
  );
}
