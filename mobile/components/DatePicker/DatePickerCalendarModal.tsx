import { format, isValid } from "date-fns";
import React, { memo, useCallback, useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

import { datePickerTokens } from "./tokens";
import { toCalendarDateString } from "./formatDateValue";

const { colors, radius, spacing } = datePickerTokens;

export interface DatePickerCalendarModalProps {
  visible: boolean;
  value?: Date;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

function buildCalendarTheme() {
  return {
    calendarBackground: colors.surfaceModal,
    monthTextColor: colors.calendarMonthText,
    textMonthFontSize: 16,
    textMonthFontWeight: "600" as const,
    arrowColor: colors.calendarArrow,
    textSectionTitleColor: colors.calendarHeaderText,
    textDayHeaderFontSize: 12,
    textDayHeaderFontWeight: "500" as const,
    dayTextColor: colors.calendarDayText,
    textDisabledColor: colors.calendarDisabledText,
    todayTextColor: colors.calendarToday,
    selectedDayBackgroundColor: colors.calendarSelected,
    selectedDayTextColor: colors.surfaceModal,
  };
}

export const DatePickerCalendarModal = memo(function DatePickerCalendarModal({
  visible,
  value,
  minDate,
  maxDate,
  onSelect,
  onClose,
}: DatePickerCalendarModalProps) {
  const selectedDateString = toCalendarDateString(value);

  const markedDates = useMemo(() => {
    if (!selectedDateString) {
      return undefined;
    }
    return {
      [selectedDateString]: {
        selected: true,
        selectedColor: colors.calendarSelected,
      },
    };
  }, [selectedDateString]);

  const minDateString = useMemo(
    () => (minDate && isValid(minDate) ? format(minDate, "yyyy-MM-dd") : undefined),
    [minDate],
  );

  const maxDateString = useMemo(
    () => (maxDate && isValid(maxDate) ? format(maxDate, "yyyy-MM-dd") : undefined),
    [maxDate],
  );

  const handleDayPress = useCallback(
    (day: DateData) => {
      onSelect(new Date(day.year, day.month - 1, day.day));
    },
    [onSelect],
  );

  const calendarTheme = useMemo(() => buildCalendarTheme(), []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close calendar"
      >
        <Pressable
          style={styles.container}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.calendarWrapper}>
            <Calendar
              current={selectedDateString}
              onDayPress={handleDayPress}
              markedDates={markedDates}
              minDate={minDateString}
              maxDate={maxDateString}
              enableSwipeMonths
              theme={calendarTheme}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.modalMargin,
  },
  container: {
    backgroundColor: colors.surfaceModal,
    borderRadius: radius.modalRadius,
    padding: spacing.modalPadding,
    overflow: "hidden",
  },
  calendarWrapper: {
    width: "100%",
  },
});
