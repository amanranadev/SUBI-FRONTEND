"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Settings,
  CreditCard,
  Calendar as CalendarIcon,
  CheckSquare,
  HelpCircle,
  Star,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/shared/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { CONTACTS_ROUTES } from "@/features/contacts/routes";
import { Button, Modal, SubiTextLogo, Txt } from "@/shared/ui";
import { WORKSPACE_ROUTES } from "@/features/workspace/routes";
import { TRANSACTIONS_ROUTES } from "@/features/transactions/routes";
import { CALENDAR_ROUTES } from "@/features/calendar/routes";
import { TASKS_ROUTES } from "@/features/tasks/routes";
import { SETTINGS_ROUTES } from "@/features/settings/routes";
import { useWorkspaceSidebarProfileBanner } from "@/features/workspace/hooks/use-workspace-sidebar-profile-banner";
import { useWorkspaceSidebarSubscriptionBanner } from "@/features/workspace/hooks/use-workspace-sidebar-subscription-banner";
import { useToast } from "@/shared/hooks/use-toast";
import { DOCUMENTS_ROUTES } from "@/features/documents/routes";
import { useWorkspace } from "@/features/workspace/context";

const VIEWS = {
  HOME: "home",
  TRANSACTIONS: "transactions",
  DOCUMENTS: "documents",
  CALENDAR: "calendar",
  TASKS: "tasks",
  SETTINGS: "settings",
  PROFILE: "profile",
  CONTACTS: "contacts",
} as const;

function getCurrentView(pathname: string) {
  if (pathname.startsWith(TRANSACTIONS_ROUTES.ROOT)) return VIEWS.TRANSACTIONS;
  if (pathname.startsWith(DOCUMENTS_ROUTES.ROOT)) return VIEWS.DOCUMENTS;
  if (pathname.startsWith(CALENDAR_ROUTES.ROOT)) return VIEWS.CALENDAR;
  if (pathname.startsWith(CONTACTS_ROUTES.ROOT)) return VIEWS.CONTACTS;
  if (pathname.startsWith(TASKS_ROUTES.ROOT)) return VIEWS.TASKS;
  if (pathname.startsWith(SETTINGS_ROUTES.ROOT)) return VIEWS.SETTINGS;
  return VIEWS.HOME;
}

const sidebarStyles = {
  root: "bg-sidebar border-r-0 sidebar-shadow h-svh flex flex-col",
  header:
    "shrink-0 pt-6 [@media(max-height:720px)]:pt-3 [@media(max-height:720px)]:gap-1 group-data-[collapsible=icon]:px-2",
  headerContent: "flex w-full items-center justify-between",
  headerContentLogoOpen: "max-w-full opacity-100 transition-all duration-300",
  headerContentLogoClosed:
    "max-w-0 overflow-hidden opacity-0 transition-all duration-300",
  content: "px-2 flex-1",
  footer:
    "px-3 pb-4 [@media(max-height:720px)]:pb-2 gap-2 [@media(max-height:720px)]:gap-1 shrink-0",
  menu: "gap-1 [@media(max-height:720px)]:gap-0.5",
  groupLabel:
    "px-4 text-[10px] [@media(max-height:720px)]:text-[9px] uppercase tracking-widest font-bold opacity-30 mb-2 [@media(max-height:720px)]:mb-1",
  menuItem:
    "h-11 [@media(max-height:720px)]:h-9 rounded-2xl px-4 [@media(max-height:720px)]:px-3 group-data-[collapsible=icon]:justify-center",
  menuItemSpan:
    "text-sm [@media(max-height:720px)]:text-xs font-medium group-data-[collapsible=icon]:hidden",
};

export function AppSidebar() {
  const { user } = useAuth();
  const { selectedTeamId, availableTeams } = useWorkspace();
  const { toast } = useToast();
  const pathname = usePathname();
  const { open: isOpen } = useSidebar();
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
  const currentView = getCurrentView(pathname);

  const { shouldShowCompleteProfileBanner, completionPercentage } =
    useWorkspaceSidebarProfileBanner({
      userId: user?.id,
      isSuperadmin: user?.isSuperadmin,
    });
  const {
    shouldLockWorkspace,
    shouldShowSubscriptionBanner,
    subscriptionBannerMessage,
  } = useWorkspaceSidebarSubscriptionBanner({
    user,
    selectedTeamId,
    enabled: availableTeams.length === 0 || Boolean(selectedTeamId),
  });
  const getProtectedWorkspaceHref = React.useCallback(
    (href: string) => (shouldLockWorkspace ? SETTINGS_ROUTES.BILLING : href),
    [shouldLockWorkspace],
  );
  const getProtectedWorkspaceTooltip = React.useCallback(
    (label: string) => (shouldLockWorkspace ? `${label} (locked)` : label),
    [shouldLockWorkspace],
  );

  return (
    <Sidebar collapsible="icon" className={sidebarStyles.root}>
      <SidebarHeader className={sidebarStyles.header}>
        <div className={sidebarStyles.headerContent}>
          <div
            className={cn(
              sidebarStyles.headerContent,
              "px-2 [@media(max-height:720px)]:px-1",
            )}
          >
            <Link
              href={WORKSPACE_ROUTES.HOME}
              className={cn(
                isOpen
                  ? sidebarStyles.headerContentLogoOpen
                  : sidebarStyles.headerContentLogoClosed,
                "origin-left [@media(max-height:720px)]:scale-90",
              )}
            >
              <SubiTextLogo />
            </Link>
            {/* <button
              type="button"
              onClick={toggleSidebar}
              className="text-foreground/60 transition-colors hover:text-foreground"
              aria-label="Toggle sidebar"
            >
              <Menu className="size-5 [@media(max-height:720px)]:size-4" />
            </button> */}
          </div>
        </div>
        {/* <div className="mt-4 [@media(max-height:720px)]:mt-2 px-1 overflow-hidden group-data-[collapsible=icon]:px-0">
          <AvatarDropdown
            name={fullName}
            email={email}
            picture={user?.avatar ?? user?.picture ?? null}
            isOpen={isOpen}
            onLogout={logout}
            avatarClassName={
              !isOpen
                ? "w-7 h-7"
                : "h-10 w-10 [@media(max-height:720px)]:h-8 [@media(max-height:720px)]:w-8"
            }
          />
        </div> */}
      </SidebarHeader>

      <SidebarContent className="px-2 mt-auto mb-auto h-fit flex-none [@media(max-height:720px)]:overflow-hidden [@media(max-height:720px)]:px-1.5">
        <SidebarGroup className="[@media(max-height:720px)]:p-1">
          <SidebarGroupLabel className={cn(sidebarStyles.groupLabel)}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={sidebarStyles.menu}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={getProtectedWorkspaceTooltip("Home")}
                  isActive={currentView === VIEWS.HOME}
                  className={cn(sidebarStyles.menuItem)}
                  asChild
                >
                  <Link href={getProtectedWorkspaceHref(WORKSPACE_ROUTES.HOME)}>
                    <Home className="!size-5" />
                    <span className={cn(sidebarStyles.menuItemSpan)}>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="[@media(max-height:720px)]:p-1">
          <SidebarGroupLabel className={cn(sidebarStyles.groupLabel)}>
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={sidebarStyles.menu}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={getProtectedWorkspaceTooltip("Transactions")}
                  isActive={currentView === VIEWS.TRANSACTIONS}
                  className={cn(sidebarStyles.menuItem)}
                  asChild
                >
                  <Link
                    href={getProtectedWorkspaceHref(TRANSACTIONS_ROUTES.ROOT)}
                  >
                    <CreditCard className="!size-5" />
                    <span className={cn(sidebarStyles.menuItemSpan)}>
                      Transactions
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={getWorkspaceTooltip("Documents")}
                  isActive={currentView === VIEWS.DOCUMENTS}
                  className={cn(sidebarStyles.menuItem)}
                  asChild
                >
                  <Link href={getWorkspaceHref(DOCUMENTS_ROUTES.ROOT)}>
                    <FolderOpen className="!size-5" />
                    <span className={cn(sidebarStyles.menuItemSpan)}>
                      Documents
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={getProtectedWorkspaceTooltip("Calendar")}
                  isActive={currentView === VIEWS.CALENDAR}
                  className={cn(sidebarStyles.menuItem)}
                  asChild
                >
                  <Link href={getProtectedWorkspaceHref(CALENDAR_ROUTES.ROOT)}>
                    <CalendarIcon className="!size-5" />
                    <span className={cn(sidebarStyles.menuItemSpan)}>
                      Calendar
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={getWorkspaceTooltip("Contacts")}
                  isActive={currentView === VIEWS.CONTACTS}
                  className={cn(sidebarStyles.menuItem)}
                  asChild
                >
                  <Link href={getWorkspaceHref(CONTACTS_ROUTES.ROOT)}>
                    <Users className="!size-5" />
                    <span className={cn(sidebarStyles.menuItemSpan)}>
                      Contacts
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={getProtectedWorkspaceTooltip("Tasks")}
                  isActive={currentView === VIEWS.TASKS}
                  className={cn(sidebarStyles.menuItem)}
                  asChild
                >
                  <Link href={getProtectedWorkspaceHref(TASKS_ROUTES.ROOT)}>
                    <CheckSquare className="!size-5" />
                    <span className={cn(sidebarStyles.menuItemSpan)}>
                      Tasks
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {shouldShowCompleteProfileBanner ? (
          <div className="mt-4 [@media(max-height:720px)]:mt-2 px-1 overflow-hidden [@media(max-height:720px)]:hidden group-data-[collapsible=icon]:px-0">
            <SidebarMenuButton className="h-auto rounded-2xl p-0" asChild>
              <Link
                href={WORKSPACE_ROUTES.COMPLETE_PROFILE}
                className="w-full rounded-2xl border border-yellow-300/50 bg-yellow-50/70 p-3 hover:bg-yellow-100/70 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Star className="size-4 text-yellow-600 mt-0.5 shrink-0" />
                  <div className="space-y-0.5 group-data-[collapsible=icon]:hidden">
                    <span className="block text-xs font-bold text-yellow-800">
                      Complete your profile
                    </span>
                    <span className="block text-xs text-yellow-700/80">
                      {completionPercentage}% complete
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </div>
        ) : null}
      </SidebarContent>

      <SidebarFooter className={sidebarStyles.footer}>
        {shouldShowSubscriptionBanner ? (
          <div className="px-1 overflow-hidden [@media(max-height:720px)]:hidden group-data-[collapsible=icon]:px-0">
            <SidebarMenuButton className="h-auto rounded-2xl p-0" asChild>
              <Link
                href={SETTINGS_ROUTES.BILLING}
                className="w-full rounded-2xl border border-sb bg-sb/10 p-2.5 hover:bg-sb/20 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <CreditCard className="size-4 text-sb mt-0.5 shrink-0" />
                  <div className="space-y-0.5 group-data-[collapsible=icon]:hidden">
                    <span className="block text-xs font-bold text-sb">
                      Subscription
                    </span>
                    <span className="block text-xs text-sb/90">
                      {subscriptionBannerMessage}
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </div>
        ) : null}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={currentView === VIEWS.SETTINGS}
              className={cn(sidebarStyles.menuItem)}
              asChild
            >
              <Link href={SETTINGS_ROUTES.PROFILE}>
                <Settings className="!size-5" />
                <span className={cn(sidebarStyles.menuItemSpan)}>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Support"
              className={cn(sidebarStyles.menuItem)}
              onClick={() => setIsSupportModalOpen(true)}
            >
              <HelpCircle className="!size-5" />
              <span className={cn(sidebarStyles.menuItemSpan)}>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <Modal
        open={isSupportModalOpen}
        onOpenChange={setIsSupportModalOpen}
        title="Need a hand?"
        description="We're here for anything-technical issues, billing questions, feature requests, or feedback. Just shoot us a message. Reach us anytime at hello@withmarian.com"
        contentClassName="rounded-[2.5rem] border-0 shadow-default p-8"
        footer={
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline-dark"
              onClick={() => setIsSupportModalOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText("hello@withmarian.com");
                toast({
                  title: "Email copied",
                  description: "Support email copied to clipboard.",
                });
              }}
            >
              Copy email address
            </Button>
          </div>
        }
      >
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HelpCircle className="size-5" />
            </div>
            <Txt as="p" size="sm" tone="muted">
              We usually respond quickly and can help with account, billing, and
              product questions.
            </Txt>
          </div>
        </div>
      </Modal>
    </Sidebar>
  );
}
