"use client";

import * as React from "react";
import { Input, type InputProps } from "@/shared/ui/input";

const DATE_MASK_DIGITS_LENGTH = 8;
const PHONE_MASK_DIGITS_LENGTH = 10;
const CURRENCY_DECIMAL_LENGTH = 2;

type MaskKind = "date" | "phone" | "currency";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function isValidMonthDay(month: number, day: number): boolean {
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

function toIsoFromDigits(digits: string): string {
  if (digits.length < DATE_MASK_DIGITS_LENGTH) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  }

  if (/^(19|20)\d{6}$/.test(digits)) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

  const year = digits.slice(4, 8);

  const monthFirst = Number.parseInt(digits.slice(0, 2), 10);
  const dayFirst = Number.parseInt(digits.slice(2, 4), 10);
  if (isValidMonthDay(monthFirst, dayFirst)) {
    return `${year}-${pad2(monthFirst)}-${pad2(dayFirst)}`;
  }

  const dayFirstMonth = Number.parseInt(digits.slice(2, 4), 10);
  const dayFirstDay = Number.parseInt(digits.slice(0, 2), 10);
  if (isValidMonthDay(dayFirstMonth, dayFirstDay)) {
    return `${year}-${pad2(dayFirstMonth)}-${pad2(dayFirstDay)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function toIsoFromDelimitedDate(value: string): string | null {
  const slashMatch = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (slashMatch) {
    const first = Number.parseInt(slashMatch[1], 10);
    const second = Number.parseInt(slashMatch[2], 10);
    const year = slashMatch[3];

    if (first > 12 && isValidMonthDay(second, first)) {
      return `${year}-${pad2(second)}-${pad2(first)}`;
    }

    if (isValidMonthDay(first, second)) {
      return `${year}-${pad2(first)}-${pad2(second)}`;
    }
  }

  const isoMatch = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (!isoMatch) return null;

  const year = isoMatch[1];
  const month = Number.parseInt(isoMatch[2], 10);
  const day = Number.parseInt(isoMatch[3], 10);

  if (!isValidMonthDay(month, day)) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function formatDateInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const fromDelimited = toIsoFromDelimitedDate(trimmed);
  if (fromDelimited) return fromDelimited;

  const digits = trimmed.replace(/\D/g, "").slice(0, DATE_MASK_DIGITS_LENGTH);
  if (!digits) return "";

  return toIsoFromDigits(digits);
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, PHONE_MASK_DIGITS_LENGTH);

  if (!digits) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)})-${digits.slice(3)}`;
  return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function toPhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_MASK_DIGITS_LENGTH);
}

export function formatCurrencyInput(value: string): string {
  if (!value) return "";

  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return "";

  const [rawInteger = "", rawDecimal = ""] = cleaned.split(".");
  const integerDigits = rawInteger.replace(/^0+(?=\d)/, "") || "0";
  const integer = Number.parseInt(integerDigits, 10);
  const formattedInteger = Number.isNaN(integer) ? "0" : integer.toLocaleString("en-US");
  const decimal = rawDecimal.replace(/\D/g, "").slice(0, CURRENCY_DECIMAL_LENGTH);

  return decimal.length > 0 ? `$${formattedInteger}.${decimal}` : `$${formattedInteger}`;
}

type MaskedInputProps = Omit<InputProps, "onChange" | "value"> & {
  value: string;
  mask: MaskKind;
  onValueChange?: (value: string) => void;
};

function formatByMask(mask: MaskKind, value: string): string {
  if (mask === "date") return formatDateInput(value);
  if (mask === "currency") return formatCurrencyInput(value);
  return formatPhoneInput(value);
}

export function MaskedInput({
  value,
  mask,
  onValueChange,
  onBlur,
  ...props
}: MaskedInputProps) {
  const displayValue = React.useMemo(() => formatByMask(mask, value), [mask, value]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = formatByMask(mask, event.target.value);
      onValueChange?.(maskedValue);
    },
    [mask, onValueChange],
  );

  return <Input {...props} value={displayValue} onChange={handleChange} onBlur={onBlur} />;
}
