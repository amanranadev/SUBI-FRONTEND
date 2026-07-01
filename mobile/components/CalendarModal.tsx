import Calendar from "@/components/Calendar";
import { colors } from "@/constants/colors";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface CalendarModalProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: string[];
  onClose?: () => void;
}

const CalendarModal = forwardRef<BottomSheetModal, CalendarModalProps>(
  ({ selectedDate, onDateSelect, events, onClose }, ref) => {
    const snapPoints = useMemo(() => ["55%"], []);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1 && onClose) {
          onClose();
        }
      },
      [onClose]
    );

    const handleDateSelect = useCallback(
      (date: Date) => {
        onDateSelect(date);
        // Dismiss modal after date selection
        setTimeout(() => {
          if (ref && typeof ref === 'object' && ref.current) {
            ref.current.dismiss();
          }
        }, 100);
      },
      [onDateSelect, ref]
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.12}
          style={styles.backdrop}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView>
          <View style={styles.monthCalendarContainer}>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              events={events}
              showEventDots={true}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

CalendarModal.displayName = "CalendarModal";

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray[800],
  },
  monthCalendarContainer: {
    gap: 16,
  },
});

export default CalendarModal;
