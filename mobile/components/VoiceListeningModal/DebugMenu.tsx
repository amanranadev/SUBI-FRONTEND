import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/colors";
import {
  getDebugSettings,
  setVoiceRecordingEnabled,
} from "../../utils/debugSettings";

interface DebugMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const DebugMenu: React.FC<DebugMenuProps> = ({ visible, onClose }) => {
  const [voiceRecordingEnabled, setVoiceRecordingEnabledState] =
    useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getDebugSettings();
    setVoiceRecordingEnabledState(settings.enableVoiceRecording);
  };

  const handleToggleVoiceRecording = async (value: boolean) => {
    setVoiceRecordingEnabledState(value);
    await setVoiceRecordingEnabled(value);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.menu}>
          <Text style={styles.title}>Debug Settings</Text>

          <View style={styles.setting}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Speech to Text</Text>
              <Text style={styles.settingDescription}>
                Enable real speech recognition (transcribes speech to text)
              </Text>
            </View>
            <Switch
              value={voiceRecordingEnabled}
              onValueChange={handleToggleVoiceRecording}
              trackColor={{
                false: colors.gray[300],
                true: colors.primary[400],
              }}
              thumbColor={colors.white}
            />
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  title: {
    fontFamily: "Inter-SemiBold",
    fontSize: 20,
    lineHeight: 28,
    color: "#2b2827",
    marginBottom: 24,
  },
  setting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    lineHeight: 22,
    color: "#2b2827",
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    lineHeight: 16,
    color: "#867873",
  },
  closeButton: {
    backgroundColor: colors.primary[400],
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  closeButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    lineHeight: 22,
    color: colors.white,
  },
});
