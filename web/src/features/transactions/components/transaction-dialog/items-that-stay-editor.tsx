"use client";

import * as React from "react";
import {
  useWatch,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
  type UseFormGetValues,
  type UseFormSetValue,
} from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { itemsThatStayItemSchema } from "@/features/transactions/schemas/transaction-detail-edit-schema";
import type { ItemsThatStayFormSlice } from "@/features/transactions/types";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormInputField } from "@/shared/ui/form-input-field";
import { Label } from "@/shared/ui/label";

const FIELD_ITEMS: keyof ItemsThatStayFormSlice = "itemsThatStay";
const FIELD_DRAFT: keyof ItemsThatStayFormSlice = "itemsThatStayDraft";

type ItemsThatStayEditorProps<T extends FieldValues & ItemsThatStayFormSlice> = {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
  disabled?: boolean;
};

export function ItemsThatStayEditor<T extends FieldValues & ItemsThatStayFormSlice>({
  control,
  setValue,
  getValues,
  disabled = false,
}: ItemsThatStayEditorProps<T>) {
  const { setError, clearErrors, getFieldState, formState } = useFormContext<T>();
  const watched = useWatch({
    control,
    name: FIELD_ITEMS as Path<T>,
  });
  const list: string[] = Array.isArray(watched)
    ? (watched as string[])
    : [];
  const itemsError =
    getFieldState(FIELD_ITEMS as Path<T>, formState).error?.message ?? null;

  const addItem = React.useCallback(() => {
    const draft = String(getValues(FIELD_DRAFT as Path<T>) ?? "").trim();
    if (!draft) return;

    const parsedItem = itemsThatStayItemSchema.safeParse(draft);
    if (!parsedItem.success) {
      setError(FIELD_ITEMS as Path<T>, {
        type: "manual",
        message: parsedItem.error.issues[0]?.message ?? "Invalid item.",
      });
      return;
    }

    const current = (getValues(FIELD_ITEMS as Path<T>) ?? []) as string[];
    if (current.includes(draft)) {
      setError(FIELD_ITEMS as Path<T>, {
        type: "manual",
        message: "Item already added.",
      });
      setValue(FIELD_DRAFT as Path<T>, "" as never, { shouldDirty: true });
      return;
    }
    clearErrors(FIELD_ITEMS as Path<T>);
    setValue(FIELD_ITEMS as Path<T>, [...current, draft] as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(FIELD_DRAFT as Path<T>, "" as never, { shouldDirty: true });
  }, [clearErrors, getValues, setError, setValue]);

  const removeItem = React.useCallback(
    (item: string) => {
      const current = (getValues(FIELD_ITEMS as Path<T>) ?? []) as string[];
      setValue(
        FIELD_ITEMS as Path<T>,
        current.filter((existing) => existing !== item) as never,
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [getValues, setValue],
  );

  return (
    <div className="space-y-4 px-1">
      <Label className="text-sm font-bold uppercase tracking-widest opacity-40">
        Items that stay
      </Label>
      <div className="flex flex-wrap items-start gap-3">
        <FormInputField
          control={control}
          name={FIELD_DRAFT as Path<T>}
          label="Add item"
          showMessage={false}
          optional
          placeholder="Add item that stays"
          disabled={disabled}
          className="min-w-[200px] flex-1 space-y-2"
          inputClassName="h-11 rounded-2xl border-black/[0.08]"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
        />
        <Button
          type="button"
          variant="outline-dark"
          className="h-11 rounded-2xl font-bold mt-auto"
          disabled={disabled}
          onClick={addItem}
        >
          Add
        </Button>
      </div>
      {list.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => (
            <div
              key={item}
              className="flex min-w-0 items-center gap-3 rounded-2xl border border-black/[0.03] bg-white p-3"
            >
              <Checkbox
                checked
                disabled={disabled}
                onCheckedChange={(checked) => {
                  if (checked) return;
                  removeItem(item);
                }}
                className="rounded-md"
              />
              <span
                className="min-w-0 flex-1 truncate text-sm font-bold capitalize"
                title={item}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-1 py-2 text-sm italic text-muted-foreground">
          <AlertCircle className="size-3 shrink-0 opacity-50" />
          No items added yet.
        </p>
      )}
      {itemsError ? (
        <p className="flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3 shrink-0" />
          {itemsError}
        </p>
      ) : null}
    </div>
  );
}
