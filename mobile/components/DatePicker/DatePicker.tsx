import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text } from "react-native";

import { Icon } from "@/assets/icon-system";

import { DatePickerCalendarModal } from "./DatePickerCalendarModal";
import type { DatePickerProps } from "./DatePicker.types";
import {
  DEFAULT_DATE_FORMAT,
  formatDateValue,
  toCalendarDateString,
} from "./formatDateValue";
import { resolveDatePickerStyles } from "./resolveDatePickerStyles";

const DEFAULT_PLACEHOLDER = "Select Date";

export const DatePicker = memo(function DatePicker({
  value,
  placeholder = DEFAULT_PLACEHOLDER,
  onChange,
  disabled = false,
  minDate,
  maxDate,
  format: dateFormat = DEFAULT_DATE_FORMAT,
  accessibilityLabel,
  testID,
}: DatePickerProps) {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<Date | undefined>(value);

  const valueKey = toCalendarDateString(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [valueKey, value]);

  const formattedValue = useMemo(
    () => formatDateValue(selectedValue, dateFormat),
    [selectedValue, dateFormat],
  );

  const displayText = formattedValue ?? placeholder;
  const hasValue = Boolean(formattedValue);

  const metrics = useMemo(
    () => resolveDatePickerStyles({ disabled, hasValue }),
    [disabled, hasValue],
  );

  const resolvedAccessibilityLabel = useMemo(() => {
    if (accessibilityLabel) {
      return accessibilityLabel;
    }
    if (formattedValue) {
      return `Selected date, ${formattedValue}. Tap to change date.`;
    }
    return `${placeholder}. Tap to select a date.`;
  }, [accessibilityLabel, formattedValue, placeholder]);

  const handleOpenCalendar = useCallback(() => {
    if (disabled) {
      return;
    }
    setIsCalendarVisible(true);
  }, [disabled]);

  const handleCloseCalendar = useCallback(() => {
    setIsCalendarVisible(false);
  }, []);

  const handleSelectDate = useCallback(
    (date: Date) => {
      setSelectedValue(date);
      onChange?.(date);
      setIsCalendarVisible(false);
    },
    [onChange],
  );

  return (
    <>
      <Pressable
        onPress={handleOpenCalendar}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={resolvedAccessibilityLabel}
        accessibilityState={{ disabled }}
        testID={testID}
        style={metrics.container}
      >
        <Icon
          name="calendar"
          size={metrics.iconSize}
          color={metrics.iconColor}
          accessible={false}
        />
        <Text style={metrics.label}>{displayText}</Text>
      </Pressable>

      <DatePickerCalendarModal
        visible={isCalendarVisible}
        value={selectedValue}
        minDate={minDate}
        maxDate={maxDate}
        onSelect={handleSelectDate}
        onClose={handleCloseCalendar}
      />
    </>
  );
});
