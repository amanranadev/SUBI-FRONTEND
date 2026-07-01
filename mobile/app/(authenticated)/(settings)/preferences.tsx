import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
//@ts-ignore
import { debounce } from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Header from "../../../components/Header/Header";
import { colors } from "../../../constants/colors";
import { useNotificationPreferenceManagement } from "../../../hooks/useNotificationPreferences";

type FrequencyOption = {
  label: string;
  value: string;
  put: string;
};

type NotificationPreference = {
  id: string;
  title: string;
  description: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  frequency: string;
};

function FrequencyPicker({
  value,
  options,
  disabled,
  onChange,
}: {
  value: string;
  options: FrequencyOption[];
  disabled?: boolean;
  onChange: (val: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const label = options.find((o) => o.value === value)?.label ?? "Select";

  return (
    <>
      <TouchableOpacity
        style={[pickerStyles.container, disabled && { opacity: 0.6 }]}
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={0.8}
      >
        <Text numberOfLines={1} style={pickerStyles.text}>
          {label}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.gray[600]} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={pickerStyles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={pickerStyles.modal}>
            <FlatList
              data={options}
              keyExtractor={(i) => i.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={pickerStyles.option}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={pickerStyles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: "#eee" }} />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function PreferencesSettings() {
  const { preferences, updatePreference } =
    useNotificationPreferenceManagement();
  const [localPrefs, setLocalPrefs] = useState<NotificationPreference[]>([]);
  const [updatingPrefId, setUpdatingPrefId] = useState<string | null>(null);

  console.log(preferences);
  const FREQUENCIES: FrequencyOption[] = useMemo(
    () => [
      { label: "Real time", value: "real_time", put: "realTime" },
      { label: "Daily digest", value: "daily_digest", put: "dailyDigest" },
      { label: "Weekly digest", value: "weekly_digest", put: "weeklyDigest" },
    ],
    []
  );

  const normalizeApiFreq = (val: string) => {
    if (!val) return FREQUENCIES[0];
    if (val === "realTime") return "real_time";
    if (val === "dailyDigest") return "daily_digest";
    if (val === "weeklyDigest") return "weekly_digest";
    return val;
  };

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(
        preferences
          .map((p: any) => ({
            ...p,
            frequency: normalizeApiFreq(p.frequency),
          }))
          .sort((a: NotificationPreference, b: NotificationPreference) =>
            a.title.localeCompare(b.title)
          )
      );
    }
  }, [preferences]);

  const getApiFrequency = (value: string) =>
    FREQUENCIES.find((f) => f.value === value)?.put ?? "realTime";

  const updateLocalPref = (
    id: string,
    updatedFields: Partial<NotificationPreference>
  ) => {
    setLocalPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const updateServerPref = useCallback(
    async (pref: NotificationPreference, showToast = true) => {
      setUpdatingPrefId(pref.id);
      try {
        updatePreference({
          preferenceId: pref.id,
          payload: {
            user_notification_preference: {
              email_enabled: pref.email_enabled,
              sms_enabled: pref.sms_enabled,
              in_app_enabled: pref.in_app_enabled,
              push_enabled: pref.push_enabled,
              frequency: getApiFrequency(pref.frequency),
            },
          },
        });

        if (showToast) {
          Toast.show({
            type: "frequencyUpdated",
            text1: "Preference updated",
            position: "bottom",
          });
        }
      } catch (err) {
        Toast.show({
          type: "taskSuccess",
          text1: "Could not update preference",
        });
      } finally {
        setUpdatingPrefId(null);
      }
    },
    [updatePreference, FREQUENCIES]
  );

  // debounced version for frequency changes
  const debouncedRef = useRef(
    debounce((pref: NotificationPreference, showToast = true) => {
      updateServerPref(pref, showToast);
    }, 550)
  );

  useEffect(() => {
    return () => {
      debouncedRef.current.cancel();
    };
  }, []);

  const handleToggle = async (
    pref: NotificationPreference,
    field: keyof Pick<
      NotificationPreference,
      "email_enabled" | "sms_enabled" | "in_app_enabled" | "push_enabled"
    >
  ) => {
    const updatedPref = { ...pref, [field]: !pref[field] };
    updateLocalPref(pref.id, updatedPref);
    await updateServerPref(updatedPref);
  };

  const handleFrequencyChange = (
    pref: NotificationPreference,
    newValue: string
  ) => {
    const updatedPref = { ...pref, frequency: newValue };
    updateLocalPref(pref.id, updatedPref);
    debouncedRef.current(updatedPref);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Header
          showMenuButton={false}
          leftComponent={
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[800]} />
            </TouchableOpacity>
          }
          title="Preferences"
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Notification preferences</Text>

          {localPrefs.map((pref) => {
            const isUpdating = updatingPrefId === pref.id;

            return (
              <View key={pref.id} style={styles.prefCard}>
                <View style={{ gap: 4, marginBottom: 10 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text style={styles.prefTitle}>{pref.title}</Text>
                    {isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color={colors.gray[600]}
                      />
                    )}
                  </View>
                  <Text style={styles.prefSubtitle}>{pref.description}</Text>
                </View>

                {[
                  { label: "Email", field: "email_enabled" },
                  { label: "SMS", field: "sms_enabled" },
                  { label: "In-App", field: "in_app_enabled" },
                  { label: "Push", field: "push_enabled" },
                ].map(({ label, field }) => (
                  <SettingsRow
                    key={field}
                    label={label}
                    value={
                      pref[field as keyof NotificationPreference] as boolean
                    }
                    onChange={() =>
                      handleToggle(
                        pref,
                        field as keyof Pick<
                          NotificationPreference,
                          | "email_enabled"
                          | "sms_enabled"
                          | "in_app_enabled"
                          | "push_enabled"
                        >
                      )
                    }
                    disabled={isUpdating}
                  />
                ))}

                <View style={styles.prefRow}>
                  <Text style={styles.prefLabel}>Frequency</Text>
                  <View style={styles.pickerWrapper}>
                    <FrequencyPicker
                      value={pref.frequency}
                      options={FREQUENCIES}
                      disabled={isUpdating}
                      onChange={(val) => handleFrequencyChange(pref, val)}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PreferencesSettings;

function SettingsRow({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} disabled={disabled} />
    </View>
  );
}

/* Styles */
const pickerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    width: "100%",
  },
  text: {
    fontSize: 14,
    color: colors.gray[800],
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "92%",
    maxHeight: "60%",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 8,
    overflow: "hidden",
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: colors.gray[800],
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  headerContainer: {
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    lineHeight: 20,
    color: "#867873",
    letterSpacing: -0.15,
    marginBottom: 6,
    marginTop: 8,
  },
  row: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 0.574,
    borderColor: "#ebe6e3",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "#2b2827",
    letterSpacing: -0.15,
  },
  prefCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 0.574,
    borderColor: "#ebe6e3",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  prefTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 15,
    lineHeight: 22,
    color: "#2b2827",
  },
  prefSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    lineHeight: 16,
    color: "#867873",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prefLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "#2b2827",
  },
  pickerWrapper: {
    width: 180,
  },
  picker: { height: 40, width: "100%" },
});
