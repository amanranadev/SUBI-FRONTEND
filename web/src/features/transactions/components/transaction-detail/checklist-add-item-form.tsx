"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormInputField, FormSelectField, Label } from "@/shared/ui";
const NEW_CATEGORY_VALUE = "__new_category__";

const checklistAddItemSchema = z.object({
  itemName: z.string().trim().min(1, "Item name is required."),
  selectedCategory: z.string().min(1, "Category is required."),
  newCategoryName: z.string().optional(),
}).superRefine((values, context) => {
  if (
    values.selectedCategory === NEW_CATEGORY_VALUE &&
    !values.newCategoryName?.trim()
  ) {
    context.addIssue({
      path: ["newCategoryName"],
      code: z.ZodIssueCode.custom,
      message: "New category name is required.",
    });
  }
});

type ChecklistAddItemFormValues = z.infer<typeof checklistAddItemSchema>;

type ChecklistAddItemFormProps = {
  categoryOptions: string[];
  disabled?: boolean;
  onAddItem: (params: { groupLabel: string; itemName: string }) => Promise<boolean>;
};

export function ChecklistAddItemForm({
  categoryOptions,
  disabled = false,
  onAddItem,
}: ChecklistAddItemFormProps) {
  const normalizedCategoryOptions = React.useMemo(
    () => Array.from(new Set(categoryOptions.map((option) => option.trim()).filter(Boolean))),
    [categoryOptions],
  );
  const existingCategoryOptions = React.useMemo(
    () =>
      normalizedCategoryOptions.map((option) => ({
        value: option,
        label: option,
      })),
    [normalizedCategoryOptions],
  );
  const defaultCategoryValue =
    existingCategoryOptions[0]?.value ?? NEW_CATEGORY_VALUE;

  const form = useForm<ChecklistAddItemFormValues>({
    resolver: zodResolver(checklistAddItemSchema),
    defaultValues: {
      itemName: "",
      selectedCategory: defaultCategoryValue,
      newCategoryName: "",
    },
  });
  const selectedCategory = form.watch("selectedCategory");
  const shouldShowNewCategoryInput = selectedCategory === NEW_CATEGORY_VALUE;
  const selectableCategoryOptions = React.useMemo(
    () => [
      ...existingCategoryOptions,
      { value: NEW_CATEGORY_VALUE, label: "New category" },
    ],
    [existingCategoryOptions],
  );

  React.useEffect(() => {
    const currentSelection = form.getValues("selectedCategory");
    const selectionStillExists =
      currentSelection === NEW_CATEGORY_VALUE ||
      existingCategoryOptions.some((option) => option.value === currentSelection);

    if (selectionStillExists) return;
    form.setValue("selectedCategory", defaultCategoryValue, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [defaultCategoryValue, existingCategoryOptions, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const finalCategory =
      values.selectedCategory === NEW_CATEGORY_VALUE
        ? values.newCategoryName?.trim() ?? ""
        : values.selectedCategory.trim();

    if (!finalCategory) {
      return;
    }

    const created = await onAddItem({
      groupLabel: finalCategory,
      itemName: values.itemName.trim(),
    });

    if (created) {
      form.reset({
        itemName: "",
        selectedCategory:
          existingCategoryOptions.some((option) => option.value === finalCategory)
            ? finalCategory
            : NEW_CATEGORY_VALUE,
        newCategoryName:
          existingCategoryOptions.some((option) => option.value === finalCategory)
            ? ""
            : finalCategory,
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Label>Checklist item</Label>
          <Label>Category</Label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <FormInputField
            control={form.control}
            name="itemName"
            showLabel={false}
            placeholder="Enter item name"
            inputClassName="h-10 rounded-xl"
            disabled={disabled}
          />
          <FormSelectField
            control={form.control}
            name="selectedCategory"
            showLabel={false}
            placeholder="Select a category"
            options={selectableCategoryOptions}
            triggerClassName="h-10 rounded-xl"
          />
        </div>

        {shouldShowNewCategoryInput ? (
          <FormInputField
            control={form.control}
            name="newCategoryName"
            label="New category"
            placeholder="Enter category name"
            inputClassName="h-10 rounded-xl"
            disabled={disabled}
          />
        ) : null}

        <Button
          type="submit"
          variant="outline"
          className="h-10 !rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest"
          disabled={disabled}
        >
          <Plus className="size-3" />
          Add Item
        </Button>
      </form>
    </Form>
  );
}
