"use client";

import { useAgentTcForm } from "@/features/complete-profile/hooks/use-agent-tc-form";
import { ProfileSettingsThirdPartyIntegrationsConnectBox } from "@/features/settings/components/profile-settings-third-party-integrations-connect-box";
import { ProfileSettingsAvatarUpload } from "@/features/settings/components/profile-settings-avatar-upload";
import {
  Button,
  Form,
  FormInputField,
  FormPhoneField,
} from "@/shared/ui";

type CompleteProfileAgentTcStepProps = {
  userId: string | null;
  onSaved?: () => void;
};

const MAX_FIELD_LENGTH = 100;

function normalizeSingleSpacing(value: string) {
  return value.replace(/\s+/g, " ").replace(/^ /, "");
}

function normalizeEmailValue(value: string) {
  return value.replace(/\s+/g, "");
}

export function CompleteProfileAgentTcStep({
  userId,
  onSaved,
}: CompleteProfileAgentTcStepProps) {
  const { form, state, actions } = useAgentTcForm({ userId, onSaved });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div
          className="space-y-6"
          onKeyDown={actions.handleKeyDown}
        >
          <div className="flex justify-center">
            <ProfileSettingsAvatarUpload
              fullName={`${state.profileUser?.name ?? ""} ${state.profileUser?.lastName ?? ""}`.trim()}
              avatarPreview={state.avatarPreviewUrl ?? state.currentAvatar}
              onAvatarFileChange={actions.setAvatarFile}
              isBusy={state.isPending}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {state.isAgent ? (
              <FormInputField
                control={form.control}
                name="agentName"
                label="Agent Name"
                required
                placeholder="Enter agent name"
                normalizeValue={normalizeSingleSpacing}
                maxLength={MAX_FIELD_LENGTH}
              />
            ) : null}
            {state.isTc ? (
              <FormInputField
                control={form.control}
                name="nameOfIndividual"
                label="Name of Individual"
                required
                placeholder="Enter individual name"
                normalizeValue={normalizeSingleSpacing}
                maxLength={MAX_FIELD_LENGTH}
              />
            ) : null}
            <FormPhoneField
              control={form.control}
              name="phone"
              label="Phone Number"
              required
              placeholder="(555)-123-4567"
            />
            <FormInputField
              control={form.control}
              name="email"
              label="Email"
              required
              type="email"
              placeholder="Enter email"
              normalizeValue={normalizeEmailValue}
              maxLength={MAX_FIELD_LENGTH}
            />
            <FormInputField
              control={form.control}
              name="nickname"
              label="Nickname (Optional)"
              placeholder="Enter nickname"
              normalizeValue={normalizeSingleSpacing}
              maxLength={MAX_FIELD_LENGTH}
            />
            <FormInputField
              control={form.control}
              name="license"
              label="License"
              required
              placeholder="Enter license number"
              normalizeValue={normalizeSingleSpacing}
              maxLength={MAX_FIELD_LENGTH}
            />
            <FormInputField
              control={form.control}
              name="website"
              label="Website (Optional)"
              placeholder="Enter website"
              normalizeValue={normalizeSingleSpacing}
              maxLength={MAX_FIELD_LENGTH}
            />
            <FormInputField
              control={form.control}
              name="socials"
              label="Socials (Optional)"
              placeholder="Enter social profile"
              normalizeValue={normalizeSingleSpacing}
              maxLength={MAX_FIELD_LENGTH}
            />
          </div>

          {state.isTc ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormInputField
                control={form.control}
                name="companyName"
                label="Company Name"
                required
                placeholder="Enter company name"
                normalizeValue={normalizeSingleSpacing}
                maxLength={MAX_FIELD_LENGTH}
              />
              <FormInputField
                control={form.control}
                name="whatCountiesServe"
                label="What Counties Serve (Optional)"
                placeholder="Enter counties served"
                normalizeValue={normalizeSingleSpacing}
                maxLength={MAX_FIELD_LENGTH}
              />
              <div
                className="md:col-span-2"
                data-agent-tc-nested-interactive-root
              >
                <ProfileSettingsThirdPartyIntegrationsConnectBox />
              </div>
            </div>
          ) : null}

          {state.shouldShowAgentWorkspaceFields ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormInputField
                control={form.control}
                name="brokerageName"
                label="Office / brokerage name (Optional)"
                placeholder="e.g. your firm or team brand"
                normalizeValue={normalizeSingleSpacing}
                maxLength={MAX_FIELD_LENGTH}
              />
              <FormInputField
                control={form.control}
                name="nameOfTeam"
                label="Name of Team (Optional)"
                placeholder="Enter team name"
                normalizeValue={normalizeSingleSpacing}
                maxLength={MAX_FIELD_LENGTH}
              />
              <FormInputField
                control={form.control}
                name="managingBrokerName"
                label="Supervising broker name (Optional)"
                placeholder="Broker's full name"
                normalizeValue={normalizeSingleSpacing}
                maxLength={MAX_FIELD_LENGTH}
              />
              <FormPhoneField
                control={form.control}
                name="managingBrokerPhone"
                label="Supervising broker phone (Optional)"
                placeholder="(555)-123-4567"
              />
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={state.isPending || state.isLoading}
              onClick={() => void actions.submitForm()}
            >
              {state.isPending ? "Saving..." : "Save and continue"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
