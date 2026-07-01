import { colors } from "@/constants/colors";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TimePickerModalProps {
  selectedTime: Date;
  onTimeSelect: (date: Date) => void;
  onClose?: () => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// Generate arrays for hours, minutes, and AM/PM
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const periods = ["AM", "PM"];

interface WheelPickerProps {
  data: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatItem?: (item: string | number) => string;
}

const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selectedIndex,
  onSelect,
  formatItem = (item) => String(item),
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Add padding items for scroll effect
  const paddedData = ["", "", ...data, "", ""];

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      if (index >= 0 && index < data.length && index !== selectedIndex) {
        onSelect(index);
      }
    },
    [data.length, onSelect, selectedIndex]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      if (index >= 0 && index < data.length) {
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: true,
        });
        onSelect(index);
      }
      setIsScrolling(false);
    },
    [data.length, onSelect]
  );

  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
  }, []);

  // Scroll to selected index on mount
  React.useEffect(() => {
    if (!isScrolling) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, [selectedIndex, isScrolling]);

  return (
    <View style={wheelStyles.container}>
      <View style={wheelStyles.selectionIndicator} />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBegin}
        scrollEventThrottle={16}
        contentContainerStyle={wheelStyles.scrollContent}
      >
        {paddedData.map((item, index) => {
          const actualIndex = index - 2;
          const isSelected = actualIndex === selectedIndex;
          const distance = Math.abs(actualIndex - selectedIndex);
          const opacity = item === "" ? 0 : distance === 0 ? 1 : distance === 1 ? 0.5 : 0.3;

          return (
            <View key={`${item}-${index}`} style={wheelStyles.item}>
              <Text
                style={[
                  wheelStyles.itemText,
                  isSelected && wheelStyles.selectedItemText,
                  { opacity },
                ]}
              >
                {item === "" ? "" : formatItem(item)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const wheelStyles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    width: 80,
    overflow: "hidden",
  },
  selectionIndicator: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: colors.gray[200],
    borderRadius: 8,
    zIndex: -1,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 20,
    color: colors.gray[600],
    fontFamily: "Inter",
  },
  selectedItemText: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.gray[900],
  },
});

export const TimePickerView = ({
  selectedTime,
  onTimeSelect,
  showHeader = true,
  style,
}: {
  selectedTime: Date;
  onTimeSelect: (date: Date) => void;
  showHeader?: boolean;
  style?: any;
}) => {
  if (Platform.OS === "android") {
    return (
      <View style={[styles.contentContainer, style]}>
        {showHeader && (
          <View style={styles.header}>
            <Text style={styles.title}>Select Time</Text>
          </View>
        )}
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            onChange={(_, date) => {
              if (date) {
                onTimeSelect(date);
              }
            }}
            style={styles.picker}
            textColor={colors.gray[900]}
            themeVariant="light"
          />
        </View>
      </View>
    );
  }

  // iOS custom wheel picker
  const currentHour = selectedTime.getHours();
  const currentMinute = selectedTime.getMinutes();
  const isPM = currentHour >= 12;
  const hour12 = currentHour % 12 || 12;

  const handleHourChange = (index: number) => {
    const newHour = hours[index];
    const newDate = new Date(selectedTime);
    if (isPM) {
      newDate.setHours(newHour === 12 ? 12 : newHour + 12);
    } else {
      newDate.setHours(newHour === 12 ? 0 : newHour);
    }
    onTimeSelect(newDate);
  };

  const handleMinuteChange = (index: number) => {
    const newDate = new Date(selectedTime);
    newDate.setMinutes(minutes[index]);
    onTimeSelect(newDate);
  };

  const handlePeriodChange = (index: number) => {
    const newDate = new Date(selectedTime);
    const currentHours = newDate.getHours();
    if (index === 0 && currentHours >= 12) {
      // Switch to AM
      newDate.setHours(currentHours - 12);
    } else if (index === 1 && currentHours < 12) {
      // Switch to PM
      newDate.setHours(currentHours + 12);
    }
    onTimeSelect(newDate);
  };

  return (
    <View style={[styles.contentContainer, style]}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Select Time</Text>
        </View>
      )}
      <View style={styles.customPickerContainer}>
        <WheelPicker
          data={hours}
          selectedIndex={hours.indexOf(hour12)}
          onSelect={handleHourChange}
          formatItem={(item) => String(item).padStart(2, "0")}
        />
        <Text style={styles.separator}>:</Text>
        <WheelPicker
          data={minutes}
          selectedIndex={currentMinute}
          onSelect={handleMinuteChange}
          formatItem={(item) => String(item).padStart(2, "0")}
        />
        <WheelPicker
          data={periods}
          selectedIndex={isPM ? 1 : 0}
          onSelect={handlePeriodChange}
        />
      </View>
    </View>
  );
};

interface TimePickerPopoverProps {
  isVisible: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<View | null>;
  selectedTime: Date;
  onTimeSelect: (date: Date) => void;
}

export const TimePickerPopover = ({
  isVisible,
  onClose,
  selectedTime,
  onTimeSelect,
}: Omit<TimePickerPopoverProps, "anchorRef">) => {
  const [localTime, setLocalTime] = useState(selectedTime);

  // Reset local time when modal opens
  React.useEffect(() => {
    if (isVisible) {
      setLocalTime(selectedTime);
    }
  }, [isVisible, selectedTime]);

  const handleTimeChange = (date: Date) => {
    setLocalTime(date);
  };

  const handleDone = () => {
    onTimeSelect(localTime);
    onClose();
  };

  if (Platform.OS === "android") {
    if (!isVisible) return null;
    return (
      <DateTimePicker
        value={selectedTime}
        mode="time"
        display="spinner"
        onChange={(event, date) => {
          onClose();
          if (date) {
            onTimeSelect(date);
          }
        }}
        textColor={colors.gray[900]}
        themeVariant="light"
      />
    );
  }

  // iOS: Custom modal with wheel picker
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.popover}>
          <View style={styles.popoverHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.popoverTitle}>Select Time</Text>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <TimePickerView
            selectedTime={localTime}
            onTimeSelect={handleTimeChange}
            showHeader={false}
            style={styles.popoverContent}
          />
        </View>
      </View>
    </Modal>
  );
};

const TimePickerModal = forwardRef<BottomSheetModal, TimePickerModalProps>(
  ({ selectedTime, onTimeSelect, onClose }, ref) => {
    const snapPoints = useMemo(() => ["45%"], []);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          onClose?.();
        }
      },
      [onClose]
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
        backgroundStyle={{ backgroundColor: colors.white }}
        handleIndicatorStyle={{ backgroundColor: colors.gray[300] }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <TimePickerView
            selectedTime={selectedTime}
            onTimeSelect={onTimeSelect}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

TimePickerModal.displayName = "TimePickerModal";

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray[800],
  },
  contentContainer: {
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  pickerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    height: Platform.OS === "ios" ? 180 : 150,
    width: Platform.OS === "ios" ? "100%" : 200,
  },
  customPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  separator: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.gray[900],
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popover: {
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: 320,
    overflow: "hidden",
  },
  popoverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  popoverTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.gray[900],
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary[400],
  },
  doneButton: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary[400],
  },
  popoverContent: {
    flex: 0,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
});

export default TimePickerModal;
