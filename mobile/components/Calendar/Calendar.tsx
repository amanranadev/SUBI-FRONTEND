import CheveronBack from "@/assets/icons/ChevronBack";
import ChevronDown from "@/assets/icons/ChevronDown";
import ChevronFront from "@/assets/icons/ChevronFront";
import { colors } from "@/constants/colors";
import { Picker } from "@react-native-picker/picker";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  events?: string[]; // Array of date strings in 'yyyy-MM-dd' format
  showEventDots?: boolean;
}

interface DayData {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  isPast: boolean;
  hasEvent: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  events = [],
  showEventDots = true,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [showPicker, setShowPicker] = useState(false);

  const screenHeight = Dimensions.get("window").height;

  // Generate month options
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      label: format(new Date(2024, i, 1), "MMMM"),
      value: i,
    }));
  }, []);

  // Generate year options (current year ± 10 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => {
      const year = currentYear - 10 + i;
      return {
        label: year.toString(),
        value: year,
      };
    });
  }, []);
  const calendarData = useMemo((): DayData[] => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const today = new Date();

    return days.map((date) => ({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: isSameMonth(date, currentMonth),
      isSelected: isSameDay(date, selectedDate),
      isToday: isSameDay(date, today),
      isPast: isBefore(date, today) && !isSameDay(date, today),
      hasEvent: events.includes(format(date, "yyyy-MM-dd")),
    }));
  }, [currentMonth, selectedDate, events]);

  const weeks = useMemo(() => {
    const weekGroups: DayData[][] = [];
    for (let i = 0; i < calendarData.length; i += 7) {
      weekGroups.push(calendarData.slice(i, i + 7));
    }
    return weekGroups;
  }, [calendarData]);

  // Generate day headers using date-fns
  const dayHeaders = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return format(day, "EEE").toUpperCase();
    });
  }, []);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDatePress = (date: Date) => {
    // Don't allow selection of past dates
    const today = new Date();
    if (isBefore(date, today) && !isSameDay(date, today)) {
      return;
    }
    onDateSelect?.(date);
  };

  const handleMonthYearPress = () => {
    setShowPicker(!showPicker);
  };

  const handleMonthChange = (monthIndex: number) => {
    setCurrentMonth(setMonth(currentMonth, monthIndex));
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth(setYear(currentMonth, year));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.monthYearButton}
          onPress={handleMonthYearPress}
        >
          <Text style={styles.monthYearText}>
            {format(currentMonth, "MMMM yyyy")}
          </Text>
          <View style={styles.chevronDown}>
            {showPicker ? (
              <ChevronDown height={12} width={8} />
            ) : (
              <ChevronFront height={12} width={8} />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.navigationArrows}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handlePreviousMonth}
          >
            <CheveronBack />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handleNextMonth}
          >
            <ChevronFront />
          </TouchableOpacity>
        </View>
      </View>
      {!showPicker ? (
        <>
          <View style={styles.dayHeaders}>
            {dayHeaders.map((day) => (
              <View key={day} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={styles.dayContainer}
                    onPress={() => handleDatePress(day.date)}
                    disabled={!day.isCurrentMonth || day.isPast}
                  >
                    <View
                      style={[
                        styles.dayButton,
                        day.isSelected && styles.selectedDayButton,
                        !day.isCurrentMonth && styles.otherMonthDay,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          day.isSelected && styles.selectedDayText,
                          !day.isCurrentMonth && styles.otherMonthText,
                          day.isPast && styles.pastDayText,
                        ]}
                      >
                        {day.dayNumber}
                      </Text>
                    </View>

                    {/* Event dot */}
                    {showEventDots && day.hasEvent && day.isCurrentMonth && (
                      <View style={styles.eventDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.pickerContainer}>
          <View style={styles.sideBySidePickers}>
            <View style={styles.pickerColumn}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={currentMonth.getMonth()}
                  onValueChange={handleMonthChange}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {monthOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      color={colors.gray[900]}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.pickerColumn}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={currentMonth.getFullYear()}
                  onValueChange={handleYearChange}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {yearOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      color={colors.gray[900]}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 13,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthYearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthYearText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    color: colors.gray[800],
    letterSpacing: 0.08,
  },
  chevronDown: {
    justifyContent: "center",
    alignItems: "center",
  },
  chevronText: {
    fontSize: 8,
    color: colors.gray[800],
  },
  navigationArrows: {
    flexDirection: "row",
    alignItems: "center",
    gap: 41,
  },
  arrowButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 16,
    color: colors.gray[800],
    fontWeight: "bold",
  },
  dayHeaders: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayHeader: {
    width: 40,
    alignItems: "center",
  },
  dayHeaderText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    color: colors.gray[500],
    letterSpacing: 0.07,
  },
  calendarGrid: {
    gap: 8,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDayButton: {
    backgroundColor: colors.primary[400],
    borderRadius: 20,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  dayText: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 18,
    color: colors.gray[800],
    letterSpacing: 0.09,
    textAlign: "center",
  },
  selectedDayText: {
    color: colors.white,
  },
  otherMonthText: {
    color: colors.gray[500],
  },
  pastDayText: {
    color: colors.gray[500],
  },
  eventDot: {
    position: "absolute",
    bottom: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[400],
  },
  pickerContainer: {
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  sideBySidePickers: {
    flexDirection: "row",
    gap: 16,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerWrapper: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  picker: {
    height: 200,
    backgroundColor: colors.white,
  },
  pickerItem: {
    color: colors.gray[900],
    fontSize: 16,
    fontFamily: "Inter",
  },
});

export default Calendar;
