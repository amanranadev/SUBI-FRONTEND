import { useChatStore } from "@/stores/chatStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function VoiceModeRedirect() {
  const router = useRouter();
  const { setVoiceModeOpen } = useChatStore();

  useEffect(() => {
    setVoiceModeOpen(true);
    router.replace("/chat");
  }, [router, setVoiceModeOpen]);

  return null;
}
