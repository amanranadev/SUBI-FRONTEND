"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { startGoogleAuthFlow } from "@/features/auth/utils";
import { Button, type ButtonProps } from "@/shared/ui/button";

type GoogleAuthButtonProps = {
  returnTo?: string | null;
  disabled?: boolean;
  clearSession?: boolean;
  idleLabel?: string;
  loadingLabel?: string;
} & Pick<ButtonProps, "variant" | "size" | "className">;

export function GoogleAuthButton({
  returnTo,
  disabled = false,
  clearSession = true,
  idleLabel = "Continue with Google",
  loadingLabel = "Redirecting...",
  variant = "outline-dark",
  size = "lg",
  className,
}: GoogleAuthButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleClick = () => {
    setIsRedirecting(true);
    startGoogleAuthFlow(returnTo, clearSession);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || isRedirecting}
      onClick={handleClick}
      className={className}
    >
      <FcGoogle className="size-4" />
      {isRedirecting ? loadingLabel : idleLabel}
    </Button>
  );
}
