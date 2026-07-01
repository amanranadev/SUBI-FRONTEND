import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WeekCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  events?: string[]; // Array of date strings in 'yyyy-MM-dd' format
  showEventDots?: boolean;
  showTodayButton?: boolean;
  handleToday: () => void;
}

interface DayData {
  date: Date;
  day: string;
  dayNumber: number;
  isSelected: boolean;
  hasEvent: boolean;
  isPast: boolean;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  events = [],
  showEventDots = true,
  showTodayButton = true,
  handleToday,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(selectedDate, { weekStartsOn: 0 })
  );

  // Generate week data using date-fns
  const currentWeek = useMemo((): DayData[] => {
    const weekStart = currentWeekStart;
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const today = new Date();

    return days.map((date) => ({
      date,
      day: format(date, "EE")[0],
      dayNumber: date.getDate(),
      isSelected: isSameDay(date, selectedDate),
      hasEvent: events.includes(format(date, "yyyy-MM-dd")),
      isPast: isBefore(date, today) && !isSameDay(date, today),
    }));
  }, [currentWeekStart, selectedDate, events]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleDayPress = (dayIndex: number) => {
    const selectedDay = currentWeek[dayIndex];
    // Don't allow selection of past dates
    if (selectedDay.isPast) {
      return;
    }
    onDateSelect?.(selectedDay.date);
  };

  return (
    <View style={styles.container}>
      {/* Date Picker Header */}
      <View style={styles.datePicker}>
        <TouchableOpacity onPress={handlePreviousWeek} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#2B2827" />
        </TouchableOpacity>

        {showTodayButton && (
          <TouchableOpacity onPress={handleToday}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleNextWeek} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#2B2827" />
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaderRow}>
        {currentWeek.map((day, index) => (
          <View key={`header-${index}`} style={styles.dayHeaderCell}>
            <Text style={styles.dayLabel}>{day.day}</Text>
          </View>
        ))}
      </View>

      {/* Day Circles */}
      <View style={styles.dayList}>
        {currentWeek.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dayContainer}
            onPress={() => handleDayPress(index)}
            disabled={day.isPast}
          >
            <View
              style={[
                styles.dayCircle,
                day.isSelected && styles.selectedDayCircle,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  day.isSelected && styles.selectedDayNumber,
                  day.isPast && styles.pastDayNumber,
                ]}
              >
                {day.dayNumber}
              </Text>
              {showEventDots && day.hasEvent && <View style={styles.eventDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 109,
    alignSelf: "center",
  },
  navButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  todayText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: colors.gray[800],
    letterSpacing: 0.08,
  },
  dayHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  dayHeaderCell: {
    width: 36,
    alignItems: "center",
  },
  dayList: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  dayContainer: {
    alignItems: "center",
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[100],
  },
  selectedDayCircle: {
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  dayLabel: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: colors.gray[700],
    letterSpacing: 0.06,
    textAlign: "center",
  },
  dayNumber: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    color: colors.gray[800],
    letterSpacing: 0.07,
    textAlign: "center",
  },
  selectedDayNumber: {
    color: colors.gray[800],
  },
  pastDayNumber: {
    color: colors.gray[500],
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 100,
    backgroundColor: colors.primary[400],
  },
});

export default WeekCalendar;
