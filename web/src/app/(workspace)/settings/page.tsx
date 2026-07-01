import { redirect } from "next/navigation"
import { SETTINGS_ROUTES } from "@/features/settings/routes"

type SettingsIndexPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function SettingsIndexPage({
  searchParams,
}: SettingsIndexPageProps) {
  const { error } = await searchParams
  const trimmed = error?.trim()
  const query = trimmed ? `?error=${encodeURIComponent(trimmed)}` : ""
  redirect(`${SETTINGS_ROUTES.PROFILE}${query}`)
}

