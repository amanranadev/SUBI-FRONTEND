import Header from '@/components/Header/Header';
import { TaskDetailModal } from '@/components/TaskDetail';
import { colors } from '@/constants/colors';
import { useTaskDetailContext } from '@/contexts/TaskDetailContext';
import { useCalendar } from '@/hooks/useCalendar';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useTaskManagement } from '@/hooks/useTasks';
import { updateGoogleCalendarEvent } from '@/services/googleCalendarService';
import { useCalendarStore } from '@/stores/calendarStore';
import { Task } from '@/types/task';
import { formatDateForAPI, generateEventsFromTasks } from '@/utils/taskUtils';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { format, formatISO } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAY_NUMBER_HEIGHT = 28;
const MAX_VISIBLE_TASKS = 3;
const TODAY = formatISO(new Date(), { representation: 'date' }); // 'YYYY-MM-DD'

type TaskModalData = {
  id: string;
  taskId: string;
  title: string;
  description: string;
  information: string;
  address: string;
  date: string;
  time: string;
  location: string;
  isOverdue?: boolean;
};

/** Group tasks by YYYY-MM-DD key */
function groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
  const map: Record<string, Task[]> = {};
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = task.dueDate.slice(0, 10);
    if (!map[key]) map[key] = [];
    map[key].push(task);
  }
  return map;
}

const CalendarScreen = () => {
  const { tasks, updateTask } = useTaskManagement();
  const { setTaskDetailOpen } = useTaskDetailContext();
  const { isAppleCalendarConnected, isGoogleCalendarConnected } = useCalendarStore();
  const taskDetailModalRef = useRef<BottomSheetModal>(null);
  const calendarListRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState<TaskModalData | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    events: appleCalendarEvents,
    fetchMonthEvents: fetchAppleMonthEvents,
  } = useCalendar({ autoRefreshOnForeground: isAppleCalendarConnected });

  const {
    events: googleCalendarEvents,
    fetchMonthEvents: fetchGoogleMonthEvents,
    optimisticUpdateEvent,
  } = useGoogleCalendar({ autoRefreshOnForeground: isGoogleCalendarConnected });

  useFocusEffect(
    useCallback(() => {
      if (isAppleCalendarConnected) {
        fetchAppleMonthEvents();
      }
      if (isGoogleCalendarConnected) {
        fetchGoogleMonthEvents();
      }
    }, [fetchAppleMonthEvents, isAppleCalendarConnected, fetchGoogleMonthEvents, isGoogleCalendarConnected])
  );

  const calendarEventsAsTasks: Task[] = useMemo(() => {
    const apple = isAppleCalendarConnected
      ? appleCalendarEvents.map((event) => ({
        id: `calendar-${event.id}`,
        taskId: `calendar-${event.id}`,
        name: event.title,
        description: event.notes || "",
        dueDate: new Date(event.startDate).toISOString(),
        completed: false,
        status: "ON_TRACK" as const,
        transactionId: "",
        type: "TASK" as const,
        address: event.location || "",
        created_at: "",
        updated_at: "",
        isCalendarEvent: true,
      }))
      : [];

    const google = isGoogleCalendarConnected
      ? googleCalendarEvents.map((event) => {
        // Extract date/time directly from the string to avoid timezone conversion issues.
        // "2026-02-20T01:00:00+05:30" → "2026-02-20T01:00:00"
        // "2026-02-20" (all-day) → "2026-02-20"
        const dueDate = event.start.match(/^(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2})?)/)?.[1] || event.start;
        return {
          id: `gcal-${event.id}`,
          taskId: `gcal-${event.id}`,
          name: event.summary,
          description: event.description || "",
          dueDate,
          completed: false,
          status: "ON_TRACK" as const,
          transactionId: "",
          type: "TASK" as const,
          address: event.location || "",
          created_at: "",
          updated_at: "",
          isCalendarEvent: true,
        };
      })
      : [];

    return [...apple, ...google];
  }, [appleCalendarEvents, isAppleCalendarConnected, googleCalendarEvents, isGoogleCalendarConnected]);

  const handleCalendarLayout = useCallback((e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.layout;
    setWrapperSize({ width, height });
  }, []);

  const allTasks = useMemo(() => [...tasks, ...calendarEventsAsTasks], [tasks, calendarEventsAsTasks]);
  const tasksByDate = useMemo(() => groupTasksByDate(allTasks), [allTasks]);
  const events = useMemo(() => generateEventsFromTasks(allTasks), [allTasks]);

  const handleTaskPress = useCallback((task: Task) => {
    let formattedTime = '';
    try {
      if (task.dueDate) {
        formattedTime = format(new Date(task.dueDate), 'HH:mm');
      }
    } catch { /* ignore */ }

    const taskForModal: TaskModalData = {
      id: task.id,
      taskId: task.id,
      title: task.name,
      description: task.description || '',
      information: task.information || '',
      address: task.address || 'Property Address',
      date: task.dueDate || '',
      time: formattedTime,
      location: 'Property Location',
      isOverdue: task.status === 'PAST_DUE',
    };
    setSelectedTask(taskForModal);
    setTaskDetailOpen(true, task.id);
    taskDetailModalRef.current?.present();
  }, [setTaskDetailOpen]);

  const handleCloseTaskDetail = useCallback(() => {
    taskDetailModalRef.current?.dismiss();
    setTaskDetailOpen(false);
    setSelectedTask(null);
    setShowAllComments(false);
  }, [setTaskDetailOpen]);

  const isGoogleCalendarEvent = (task: TaskModalData | null) => task?.id?.startsWith("gcal-");
  const getGoogleEventId = (task: TaskModalData) => task.id.replace("gcal-", "");

  const handleDateChange = useCallback(async (date: Date) => {
    if (!selectedTask) return;
    if (isGoogleCalendarEvent(selectedTask)) {
      const newStart = new Date(date);
      const [h, m] = (selectedTask.time || "00:00").split(":").map(Number);
      newStart.setHours(h, m, 0, 0);
      const newEnd = new Date(newStart);
      newEnd.setHours(newEnd.getHours() + 1);

      // Optimistic update
      const prevDate = selectedTask.date;
      const rollback = optimisticUpdateEvent(getGoogleEventId(selectedTask), {
        start: format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
        end: format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      });
      setSelectedTask((prev) => prev ? { ...prev, date: formatDateForAPI(date) } : null);

      const success = await updateGoogleCalendarEvent(getGoogleEventId(selectedTask), {
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
      });
      if (!success) {
        rollback();
        setSelectedTask((prev) => prev ? { ...prev, date: prevDate } : null);
        Alert.alert("Error", "Failed to update date. Please try again.");
      }
    } else {
      updateTask({ taskId: selectedTask.id, updates: { dueDate: formatDateForAPI(date) } });
      setSelectedTask((prev) => prev ? { ...prev, date: formatDateForAPI(date) } : null);
    }
  }, [selectedTask, updateTask, optimisticUpdateEvent]);

  const handleTimeChange = useCallback(async (time: Date) => {
    if (!selectedTask) return;
    const dateStr = selectedTask.date;
    const base = new Date(dateStr.includes('T') ? dateStr.split('T')[0] + 'T00:00:00' : dateStr + 'T00:00:00');
    base.setHours(time.getHours());
    base.setMinutes(time.getMinutes());
    if (isGoogleCalendarEvent(selectedTask)) {
      const end = new Date(base);
      end.setHours(end.getHours() + 1);

      // Optimistic update
      const prevTime = selectedTask.time;
      const rollback = optimisticUpdateEvent(getGoogleEventId(selectedTask), {
        start: format(base, "yyyy-MM-dd'T'HH:mm:ss"),
        end: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
      });
      setSelectedTask((prev) => prev ? { ...prev, time: format(time, 'HH:mm') } : null);

      const success = await updateGoogleCalendarEvent(getGoogleEventId(selectedTask), {
        start: base.toISOString(),
        end: end.toISOString(),
      });
      if (!success) {
        rollback();
        setSelectedTask((prev) => prev ? { ...prev, time: prevTime } : null);
        Alert.alert("Error", "Failed to update time. Please try again.");
      }
    } else {
      updateTask({ taskId: selectedTask.id, updates: { dueDate: format(base, "yyyy-MM-dd'T'HH:mm:ss") } });
      setSelectedTask((prev) => prev ? { ...prev, time: format(base, 'HH:mm') } : null);
    }
  }, [selectedTask, updateTask, optimisticUpdateEvent]);

  const handleDescriptionSave = useCallback(async (description: string) => {
    if (!selectedTask) return;
    if (isGoogleCalendarEvent(selectedTask)) {
      // Optimistic update
      const prevDescription = selectedTask.description;
      const rollback = optimisticUpdateEvent(getGoogleEventId(selectedTask), { description });
      setSelectedTask((prev) => prev ? { ...prev, description } : null);

      const success = await updateGoogleCalendarEvent(getGoogleEventId(selectedTask), { description });
      if (!success) {
        rollback();
        setSelectedTask((prev) => prev ? { ...prev, description: prevDescription } : null);
        Alert.alert("Error", "Failed to update description. Please try again.");
      }
    } else {
      updateTask({ taskId: selectedTask.id, updates: { description } });
      setSelectedTask((prev) => prev ? { ...prev, description } : null);
    }
  }, [selectedTask, updateTask, optimisticUpdateEvent]);

  const handleInformationSave = useCallback((information: string) => {
    if (!selectedTask) return;
    if (isGoogleCalendarEvent(selectedTask)) {
      return; // Google Calendar events don't have an "information" field
    }
    updateTask({ taskId: selectedTask.id, updates: { information } });
    setSelectedTask((prev) => prev ? { ...prev, information } : null);
  }, [selectedTask, updateTask]);

  const handleNameChange = useCallback((name: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const taskId = selectedTask?.id;
    const isGcal = isGoogleCalendarEvent(selectedTask);
    timerRef.current = setTimeout(async () => {
      if (taskId) {
        if (isGcal) {
          const eventId = taskId.replace("gcal-", "");
          // Optimistic update
          const rollback = optimisticUpdateEvent(eventId, { summary: name });
          setSelectedTask((prev) => prev ? { ...prev, title: name } : null);

          const success = await updateGoogleCalendarEvent(eventId, { summary: name });
          if (!success) {
            rollback();
            Alert.alert("Error", "Failed to update name. Please try again.");
          }
        } else {
          updateTask({ taskId, updates: { name } });
          setSelectedTask((prev) => prev ? { ...prev, title: name } : null);
        }
      }
    }, 500);
  }, [selectedTask, updateTask, optimisticUpdateEvent]);

  const renderDay = ({ date, state }: { date?: DateData; state?: string }) => {
    const isToday = state === 'today';
    const isDisabled = state === 'disabled';
    const dateKey = date?.dateString || '';
    const dayTasks = tasksByDate[dateKey] || [];
    const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_TASKS);
    const remaining = dayTasks.length - MAX_VISIBLE_TASKS;

    return (
      <View style={styles.dayCellOuter}>
        <View style={[styles.dayCell, isDisabled && styles.dayCellDisabled]}>
          <View style={[styles.dayBadge, isToday && styles.todayBadge]}>
            <Text
              style={[
                styles.dayText,
                isDisabled && styles.disabledText,
                isToday && styles.todayText,
              ]}
            >
              {date?.day}
            </Text>
          </View>
          {visibleTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskChip}
              activeOpacity={0.7}
              onPress={() => handleTaskPress(task)}
            >
              <Text style={styles.taskChipText} numberOfLines={1}>
                {task.name}
              </Text>
            </TouchableOpacity>
          ))}
          {remaining > 0 && (
            <Text style={styles.moreText}>+{remaining} more</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <BottomSheetModalProvider>
        <Header title="Calendar" />
        <View style={styles.calendarWrapper} onLayout={handleCalendarLayout}>
          {wrapperSize.height > 0 && <CalendarList
            ref={calendarListRef}
            current={TODAY}
            horizontal
            pagingEnabled
            staticHeader
            animateScroll
            calendarHeight={wrapperSize.height}
            calendarWidth={wrapperSize.width}
            showSixWeeks
            hideExtraDays={false}
            theme={{
              calendarBackground: '#ffffff',
              monthTextColor: '#1a1a1a',
              textMonthFontSize: 18,
              textMonthFontWeight: '600' as const,
              arrowColor: '#333',
              textSectionTitleColor: '#999',
              textDayHeaderFontSize: 13,
              textDayHeaderFontWeight: '600' as const,
              'stylesheet.calendar.main': {
                monthView: { flex: 1, backgroundColor: '#ffffff' },
                week: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
                dayContainer: { flex: 1, alignItems: 'stretch' },
                emptyDayContainer: { flex: 1 },
              },
            }}
            dayComponent={renderDay}
          />}
        </View>

        <TaskDetailModal
          ref={taskDetailModalRef}
          task={selectedTask}
          showAllComments={showAllComments}
          onClose={handleCloseTaskDetail}
          onMenuPress={() => { }}
          onViewAllComments={() => setShowAllComments((prev) => !prev)}
          onCommentSubmit={() => { }}
          onDateChange={handleDateChange}
          onInformationSave={handleInformationSave}
          onDescriptionSave={handleDescriptionSave}
          onTimeChange={handleTimeChange}
          onNameChange={handleNameChange}
          events={events}
        />
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  calendarWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  dayCellOuter: {
    flex: 1,
  },
  dayCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
    paddingTop: 2,
    paddingHorizontal: 2,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    gap: 4,
  },
  dayCellDisabled: {
    backgroundColor: '#fafafa',
  },
  dayBadge: {
    width: DAY_NUMBER_HEIGHT,
    height: DAY_NUMBER_HEIGHT,
    borderRadius: DAY_NUMBER_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  todayBadge: {
    backgroundColor: colors.primary[500],
    borderRadius: 999
  },
  dayText: {
    fontSize: 13,
    color: '#333',
  },
  disabledText: {
    color: '#ccc',
  },
  todayText: {
    color: '#fff',
    fontWeight: '700',
  },
  taskChip: {
    borderColor: colors.primary[500],
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginBottom: 2,
    alignSelf: 'stretch',
  },
  taskChipText: {
    fontSize: 12,
    color: colors.primary[500],
    fontWeight: '600',
  },
  moreText: {
    fontSize: 10,
    color: colors.gray[500],
    marginTop: 1,
  },
});
