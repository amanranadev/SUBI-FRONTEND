import { redirect } from "next/navigation"
import { WORKSPACE_ROUTES } from "@/features/workspace/routes"
import { isProfileCompleteServer } from "@/features/settings/api/server-profile-completion"

export default async function RootPage() {
  const complete = await isProfileCompleteServer()
  redirect(complete ? WORKSPACE_ROUTES.HOME : WORKSPACE_ROUTES.COMPLETE_PROFILE)
}
