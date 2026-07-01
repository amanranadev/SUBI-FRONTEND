import { z } from "zod";
import { apiClient } from "@/lib/api/client";
import {
  COMPLETE_PROFILE_USER_TYPE,
  type CompleteProfileUserType,
} from "@/features/complete-profile/constants";

const onboardingAgentSchema = z
  .object({
    id: z.coerce.string().optional(),
    agent_name: z.string().optional().nullable(),
    brokerage_name: z.string().optional().nullable(),
    name_of_team: z.string().optional().nullable(),
    managing_broker_name: z.string().optional().nullable(),
    managing_broker_phone: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    license: z.string().optional().nullable(),
    socials: z.string().optional().nullable(),
    avatar_url: z.string().optional().nullable(),
  })
  .nullable()
  .optional();

const onboardingTcSchema = z
  .object({
    id: z.coerce.string().optional(),
    company_name: z.string().optional().nullable(),
    name_of_individual: z.string().optional().nullable(),
    what_counties_serve: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    license: z.string().optional().nullable(),
    socials: z.string().optional().nullable(),
    avatar_url: z.string().optional().nullable(),
  })
  .nullable()
  .optional();

const onboardingProfilesResponseSchema = z.object({
  data: z
    .object({
      agent: onboardingAgentSchema,
      transaction_coordinator: onboardingTcSchema,
    })
    .optional()
    .default({}),
  user_type: z.string().optional().nullable(),
});

/** Rails may return `userType` (camelCase) at the root; normalize for Zod. */
function normalizeOnboardingProfilesPayload(data: unknown): unknown {
  if (!data || typeof data !== "object" || data === null) return data;
  const record = data as Record<string, unknown>;
  const fromApi = record.user_type ?? record.userType;
  if (fromApi != null && record.user_type == null) {
    return { ...record, user_type: String(fromApi) };
  }
  return data;
}

export type OnboardingProfilesResponse = z.infer<
  typeof onboardingProfilesResponseSchema
>;

export async function getOnboardingProfiles(): Promise<OnboardingProfilesResponse> {
  try {
    const response = await apiClient.get("/onboarding_profiles");
    return onboardingProfilesResponseSchema.parse(
      normalizeOnboardingProfilesPayload(response.data),
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response &&
      "status" in error.response &&
      error.response.status === 404
    ) {
      return onboardingProfilesResponseSchema.parse({
        data: {},
        user_type: null,
      });
    }
    throw error;
  }
}

export async function updateUserType(input: {
  userId: string;
  userType: CompleteProfileUserType;
  onboardingCompleted?: boolean;
  nickname?: string;
}) {
  const trimmedNickname = input.nickname?.trim() ?? "";

  const formData = new FormData();
  formData.append("user[user_type]", input.userType);
  formData.append("user[nickname]", trimmedNickname);
  formData.append(
    "user[onboarding_completed]",
    input.onboardingCompleted ? "true" : "false",
  );

  const response = await apiClient.put(`/users/${input.userId}`, formData);

  return response.data;
}

function appendString(formData: FormData, key: string, value?: string) {
  const parsed = (value ?? "").trim();
  if (!parsed) return;
  formData.append(key, parsed);
}

type SaveOnboardingProfilesInput = {
  userType: CompleteProfileUserType;
  avatarFile?: File | null;
  values: {
    phone: string;
    email: string;
    website: string;
    license: string;
    socials: string;
    agentName: string;
    brokerageName: string;
    nameOfTeam: string;
    managingBrokerName: string;
    managingBrokerPhone: string;
    companyName: string;
    nameOfIndividual: string;
    whatCountiesServe: string;
  };
};

export async function saveOnboardingProfiles(
  input: SaveOnboardingProfilesInput,
) {
  const formData = new FormData();

  formData.append("user_type", input.userType);

  const shouldSaveAgent =
    input.userType === COMPLETE_PROFILE_USER_TYPE.AGENT ||
    input.userType === COMPLETE_PROFILE_USER_TYPE.BOTH;
  const shouldSaveTc =
    input.userType === COMPLETE_PROFILE_USER_TYPE.TRANSACTION_COORDINATOR ||
    input.userType === COMPLETE_PROFILE_USER_TYPE.BOTH;

  if (shouldSaveAgent) {
    appendString(formData, "agent[agent_name]", input.values.agentName);
    appendString(formData, "agent[brokerage_name]", input.values.brokerageName);
    appendString(formData, "agent[name_of_team]", input.values.nameOfTeam);
    appendString(
      formData,
      "agent[managing_broker_name]",
      input.values.managingBrokerName,
    );
    appendString(
      formData,
      "agent[managing_broker_phone]",
      input.values.managingBrokerPhone,
    );
    appendString(formData, "agent[phone]", input.values.phone);
    appendString(formData, "agent[email]", input.values.email);
    appendString(formData, "agent[website]", input.values.website);
    appendString(formData, "agent[license]", input.values.license);
    appendString(formData, "agent[socials]", input.values.socials);
    if (input.avatarFile) {
      formData.append("agent[avatar]", input.avatarFile);
    }
  }

  if (shouldSaveTc) {
    appendString(
      formData,
      "transaction_coordinator[company_name]",
      input.values.companyName,
    );
    appendString(
      formData,
      "transaction_coordinator[name_of_individual]",
      input.values.nameOfIndividual,
    );
    appendString(
      formData,
      "transaction_coordinator[what_counties_serve]",
      input.values.whatCountiesServe,
    );
    appendString(
      formData,
      "transaction_coordinator[phone]",
      input.values.phone,
    );
    appendString(
      formData,
      "transaction_coordinator[email]",
      input.values.email,
    );
    appendString(
      formData,
      "transaction_coordinator[website]",
      input.values.website,
    );
    appendString(
      formData,
      "transaction_coordinator[license]",
      input.values.license,
    );
    appendString(
      formData,
      "transaction_coordinator[socials]",
      input.values.socials,
    );
    if (input.avatarFile) {
      formData.append("transaction_coordinator[avatar]", input.avatarFile);
    }
  }

  try {
    const createResponse = await apiClient.post(
      "/onboarding_profiles",
      formData,
    );
    return createResponse.data;
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response &&
      "status" in error.response &&
      error.response.status === 422
    ) {
      const updateResponse = await apiClient.put(
        "/onboarding_profiles",
        formData,
      );
      return updateResponse.data;
    }
    throw error;
  }
}
