"use client";

import type { BaseSyntheticEvent } from "react";
import { BadgeCheck, Briefcase, User, Globe } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import {
  Button,
  Card,
  Form,
  FormInputField,
  FormPhoneField,
  Txt,
} from "@/shared/ui";
import type { ProfileSettingsValues } from "@/features/settings/types";

type ProfileSettingsFormCardProps = {
  form: UseFormReturn<ProfileSettingsValues>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  isBusy: boolean;
  isLoadingProfile: boolean;
};

export function ProfileSettingsFormCard({
  form,
  onSubmit,
  isBusy,
  isLoadingProfile,
}: ProfileSettingsFormCardProps) {
  return (
    <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10">
      <div className="space-y-8">
        <div className="space-y-1">
          <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
            Personal information
          </Txt>
        </div>

        <Form {...form}>
          <form className="space-y-8" onSubmit={onSubmit} noValidate>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormInputField
                control={form.control}
                name="firstName"
                label="First name"
                placeholder="Enter your first name"
                required
                disabled={isBusy || isLoadingProfile}
                start={<User className="size-5 text-foreground/50" />}
              />
              <FormInputField
                control={form.control}
                name="lastName"
                label="Last name"
                placeholder="Enter your last name"
                disabled={isBusy || isLoadingProfile}
                start={<User className="size-5 text-foreground/50" />}
              />
              <FormInputField
                control={form.control}
                name="nickname"
                label="Nickname"
                placeholder="Enter your nickname"
                disabled={isBusy || isLoadingProfile}
                start={<User className="size-5 text-foreground/50" />}
              />
            </div>

            <div className="space-y-4 pt-2">
              <Txt as="h3" size="xl" weight="bold">
                Professional details
              </Txt>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormInputField
                  control={form.control}
                  name="licenseNumber"
                  label="License number"
                  placeholder="Enter your license number"
                  disabled={isBusy || isLoadingProfile}
                  start={<BadgeCheck className="size-5 text-foreground/50" />}
                />
                <FormInputField
                  control={form.control}
                  name="brokerageName"
                  label="Office / brokerage name"
                  placeholder="e.g. your firm or team brand"
                  disabled={isBusy || isLoadingProfile}
                  start={<Briefcase className="size-5 text-foreground/50" />}
                />
                <div className="md:col-span-2 space-y-1 pt-1">
                  <Txt as="p" size="sm" weight="medium">
                    Supervising broker (optional)
                  </Txt>
                </div>
                <FormInputField
                  control={form.control}
                  name="managingBrokerName"
                  label="Supervising broker name"
                  placeholder="Broker's full name"
                  disabled={isBusy || isLoadingProfile}
                  start={<User className="size-5 text-foreground/50" />}
                />
                <FormPhoneField
                  control={form.control}
                  name="managingBrokerPhone"
                  label="Supervising broker phone"
                  placeholder="(555)-123-4567"
                  disabled={isBusy || isLoadingProfile}
                />
                <FormInputField
                  control={form.control}
                  name="website"
                  label="Website"
                  placeholder="https://your-site.com"
                  disabled={isBusy || isLoadingProfile}
                  start={<Globe className="size-5 text-foreground/50" />}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-black/5 pt-6">
              <Button
                type="submit"
                disabled={isBusy || isLoadingProfile}
                className="h-16 px-16 rounded-[2rem] text-xl font-bold shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
              >
                {isBusy ? "Saving..." : "Save profile changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
}
