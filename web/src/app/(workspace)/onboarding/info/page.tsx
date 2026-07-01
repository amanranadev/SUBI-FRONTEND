import { redirect } from "next/navigation"
import { WORKSPACE_ROUTES } from "@/features/workspace/routes"

export default function OnboardingInfoPage() {
  redirect(WORKSPACE_ROUTES.COMPLETE_PROFILE)
}

