import Voice from "@react-native-voice/voice";
import * as Audio from "expo-audio";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { NativeModules, Platform } from "react-native";

const isVoiceNativeModuleAvailable = (): boolean => {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android" && androidWakeWordUnsupported) return false;
  try {
    const VoiceModule = NativeModules?.Voice;
    if (VoiceModule == null) return false;
    return typeof VoiceModule.startSpeech === "function";
  } catch {
    return false;
  }
};

const isVoiceModuleError = (error: unknown): boolean =>
  error instanceof TypeError &&
  (String((error as Error).message).includes("startSpeech") ||
    String((error as Error).message).includes("null"));

const safeVoiceStart = async (): Promise<boolean> => {
  if (!isVoiceNativeModuleAvailable()) return false;
  try {
    await Voice.start("en-US");
    return true;
  } catch (e) {
    if (isVoiceModuleError(e)) return false;
    throw e;
  }
};

const safeVoiceStop = async (): Promise<void> => {
  if (!isVoiceNativeModuleAvailable()) return;
  try {
    await Voice.stop();
  } catch (e) {
    if (!isVoiceModuleError(e)) console.error("Error stopping Voice:", e);
  }
};

const safeVoiceDestroy = async (): Promise<void> => {
  if (!isVoiceNativeModuleAvailable()) return;
  try {
    await Voice.destroy();
  } catch (e) {
    if (!isVoiceModuleError(e)) console.error("Error destroying Voice:", e);
  }
};

const WAKE_PHRASE_VARIANTS = ["okay subi", "ok subi", "subi ok", "subi okay"];

let androidWakeWordUnsupported = false;

export function useWakeWordDetection(enabled: boolean = true) {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const isActiveRef = useRef(false);
  const lastDetectionRef = useRef<number>(0);
  const cooldownPeriod = 2000;
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const stopListening = useCallback(async () => {
    if (!isActiveRef.current) {
      return;
    }

    try {
      isActiveRef.current = false;
      setIsListening(false);
      await safeVoiceStop();
      await safeVoiceDestroy();
      console.log("Wake word detection: Stopped");
    } catch (error) {
      console.error("Error stopping wake word detection:", error);
    }
  }, []);

  const handleWakeWordDetected = useCallback(async () => {
    try {
      await stopListening();
      router.push("/home");
    } catch (error) {
      console.error("Error handling wake word:", error);
    }
  }, [stopListening]);

  const checkForWakePhrase = useCallback(
    (transcript: string) => {
      const now = Date.now();
      if (now - lastDetectionRef.current < cooldownPeriod) {
        return;
      }

      const hasWakePhrase = WAKE_PHRASE_VARIANTS.some((variant) =>
        transcript.includes(variant)
      );

      if (hasWakePhrase) {
        lastDetectionRef.current = now;
        handleWakeWordDetected();
      }
    },
    [handleWakeWordDetected]
  );

  const startListening = useCallback(async () => {
    if (isActiveRef.current) {
      return;
    }

    if (Platform.OS === "android" && androidWakeWordUnsupported) {
      return;
    }

    try {
      const { status } = await Audio.requestRecordingPermissionsAsync();
      if (status !== "granted") {
        console.warn(
          "Microphone permission not granted for wake word detection"
        );
        setHasPermission(false);
        return;
      }

      if (!isVoiceNativeModuleAvailable()) {
        if (Platform.OS === "android") {
          androidWakeWordUnsupported = true;
          if (__DEV__) {
            console.warn(
              "Wake word detection: @react-native-voice/voice native module not available on Android. Wake word is disabled for this session."
            );
          }
        }
        return;
      }

      setHasPermission(true);
      isActiveRef.current = true;
      setIsListening(true);

      Voice.onSpeechStart = () => {
        console.log("Wake word detection: Speech recognition started");
      };

      Voice.onSpeechResults = (e: any) => {
        if (e.value && e.value.length > 0) {
          const transcript = e.value[0].toLowerCase().trim();
          console.log("Wake word detection: Heard:", transcript);
          checkForWakePhrase(transcript);
        }
      };

      Voice.onSpeechError = (e: any) => {
        // Error code "7" = no speech detected (expected when waiting for wake word)
        // Error code "5" = client side error (often happens during restart)
        const ignoredCodes = ["5", "7"];
        if (!ignoredCodes.includes(e.error?.code)) {
          console.warn("Wake word detection error:", e.error?.code, e.error?.message);
        }
        if (e.error?.code !== "7") {
          setTimeout(async () => {
            if (enabledRef.current && isActiveRef.current) {
              await safeVoiceStop();
              await new Promise((resolve) => setTimeout(resolve, 200));
              if (enabledRef.current && isActiveRef.current) {
                await safeVoiceStart();
              }
            }
          }, 200);
        }
      };

      Voice.onSpeechEnd = () => {
        setTimeout(async () => {
          if (enabledRef.current && isActiveRef.current) {
            await safeVoiceStop();
            await new Promise((resolve) => setTimeout(resolve, 200));
            if (enabledRef.current && isActiveRef.current) {
              await safeVoiceStart();
            }
          }
        }, 200);
      };

      const started = await safeVoiceStart();
      if (!started) {
        if (Platform.OS === "android") {
          androidWakeWordUnsupported = true;
        }
        isActiveRef.current = false;
        setIsListening(false);
        return;
      }
      console.log("Wake word detection: Started listening for 'Ok Subi'");
    } catch (error) {
      if (isVoiceModuleError(error)) {
        if (Platform.OS === "android") {
          androidWakeWordUnsupported = true;
        }
        isActiveRef.current = false;
        setIsListening(false);
        setHasPermission(false);
        if (__DEV__ && Platform.OS === "android") {
          console.warn(
            "Wake word detection: @react-native-voice/voice native module not available on Android. Wake word is disabled for this session."
          );
        }
        return;
      }
      console.error("Error starting wake word detection:", error);
      isActiveRef.current = false;
      setIsListening(false);
      setHasPermission(false);
      if (enabledRef.current) {
        setTimeout(() => startListening(), 2000);
      }
    }
  }, [checkForWakePhrase]);

  useEffect(() => {
    if (!enabled) {
      stopListening();
      return;
    }

    if (Platform.OS === "android" && androidWakeWordUnsupported) {
      return;
    }

    startListening();

    return () => {
      stopListening();
    };
  }, [enabled, startListening, stopListening]);

  return {
    isListening,
    hasPermission,
  };
}
