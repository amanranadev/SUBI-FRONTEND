import AsyncStorage from "@react-native-async-storage/async-storage";

const DEBUG_SETTINGS_KEY = "@debug_settings";

interface DebugSettings {
  enableVoiceRecording: boolean;
}

const defaultSettings: DebugSettings = {
  enableVoiceRecording: false,
};

export const getDebugSettings = async (): Promise<DebugSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(DEBUG_SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error loading debug settings:", error);
    return defaultSettings;
  }
};

export const updateDebugSettings = async (
  updates: Partial<DebugSettings>
): Promise<void> => {
  try {
    const currentSettings = await getDebugSettings();
    const newSettings = { ...currentSettings, ...updates };
    await AsyncStorage.setItem(DEBUG_SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.error("Error updating debug settings:", error);
  }
};

export const setVoiceRecordingEnabled = async (enabled: boolean) => {
  await updateDebugSettings({ enableVoiceRecording: enabled });
};

export const isVoiceRecordingEnabled = async (): Promise<boolean> => {
  const settings = await getDebugSettings();
  return settings.enableVoiceRecording;
};
