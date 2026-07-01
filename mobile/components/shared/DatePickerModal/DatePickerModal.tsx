import { colors } from "@/constants/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  value,
  minimumDate,
  maximumDate,
  onConfirm,
  onCancel,
}) => {
  const [tempDate, setTempDate] = useState<Date>(value);

  // Reset temp date when modal opens with new value
  useEffect(() => {
    if (visible) {
      setTempDate(value);
    }
  }, [visible, value]);

  if (Platform.OS === "android") {
    if (!visible) return null;

    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onChange={(event, selectedDate) => {
          if (event.type === "dismissed") {
            onCancel();
          } else if (event.type === "set" && selectedDate) {
            onConfirm(selectedDate);
          }
        }}
      />
    );
  }

  // iOS Modal
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(tempDate)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            themeVariant="light"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setTempDate(selectedDate);
              }
            }}
            style={styles.picker}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    width: "100%",
  },
  cancelText: {
    fontSize: 17,
    color: colors.gray[600],
    fontWeight: "400",
  },
  doneText: {
    fontSize: 17,
    color: colors.primary[400],
    fontWeight: "600",
  },
  picker: {
    height: 216,
  },
});

export default DatePickerModal;
