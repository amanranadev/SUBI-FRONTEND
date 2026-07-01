import { Suspense } from "react";
import { LoginView } from "@/features/auth/views/login-view";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
