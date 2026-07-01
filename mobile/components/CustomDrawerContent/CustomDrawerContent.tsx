import { colors } from "@/constants/colors";
import { useChats, useDeleteChat } from "@/hooks/useChats";
import { useChatStore } from "@/stores/chatStore";
import { UserChat } from "@/types/chat";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatItemProps {
  chat: UserChat;
  onPress: (chat: UserChat) => void;
  onDelete: (chat: UserChat) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, onPress, onDelete }) => {
  const timeAgo = formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true });

  return (
    <TouchableOpacity style={styles.chatItem} onPress={() => onPress(chat)}>
      <View style={styles.chatInfo}>
        <Text style={styles.chatTitle} numberOfLines={1}>
          {chat.title}
        </Text>
        <Text style={styles.chatTime}>{timeAgo}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(chat)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.gray[500]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const router = useRouter();
  const { setVoiceModeOpen, clearVoiceMessages, setPendingMessage, setPendingTransactionId } =
    useChatStore();
  const { data, isLoading } = useChats();
  const { mutate: deleteChat } = useDeleteChat();
  const chats: UserChat[] = Array.isArray(data) ? data : (data as any)?.user_chats || [];

  const handleCalendarPress = () => {
    // Close drawer and navigate to home with openTasks param
    // Use timestamp to ensure param changes each time (triggers useEffect)
    props.navigation.closeDrawer();
    router.replace({ pathname: '/calendar', params: {} });
  };

  const handleChatPress = (chat: UserChat) => {
    // Close drawer and navigate to chat
    props.navigation.closeDrawer();
    router.replace({ pathname: '/chat', params: { chatId: chat.id } });
  };

  const handleDeleteChat = (chat: UserChat) => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete "${chat.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteChat(chat.id),
        },
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* Home */}
      <DrawerItem
        label="Home"
        onPress={() => {
          props.navigation.closeDrawer();
          router.replace({ pathname: '/home', params: { closeTasks: Date.now().toString() } });
        }}
        labelStyle={styles.drawerLabel}
      />

      {/* Calendar - Opens tasks drawer on home */}
      <DrawerItem
        label="Calendar"
        onPress={handleCalendarPress}
        labelStyle={styles.drawerLabel}
      />

      {/* Transactions */}
      <DrawerItem
        label="Transactions"
        onPress={() => {
          props.navigation.closeDrawer();
          router.replace('/transactions');
        }}
        labelStyle={styles.drawerLabel}
      />

      {/* Settings */}
      <DrawerItem
        label="Settings"
        onPress={() => {
          props.navigation.closeDrawer();
          router.replace('/settings');
        }}
        labelStyle={styles.drawerLabel}
      />

      {/* Logout */}
      <DrawerItem
        label="Logout"
        onPress={() => {
          props.navigation.closeDrawer();
          router.replace('/logout');
        }}
        labelStyle={styles.drawerLabel}
      />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Chat History Section */}
      <View style={styles.chatSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chats</Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => {
              props.navigation.closeDrawer();
              setVoiceModeOpen(false);
              clearVoiceMessages("__voice_default__");
              setPendingMessage(null);
              setPendingTransactionId(null);
              router.replace({ pathname: '/chat', params: {} });
            }}
          >
            <Ionicons name="add" size={20} color={colors.primary[400]} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary[400]} />
          </View>
        ) : chats.length === 0 ? (
          <Text style={styles.emptyText}>No chat history</Text>
        ) : (
          <View style={styles.chatList}>
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                onPress={handleChatPress}
                onDelete={handleDeleteChat}
              />
            ))}
          </View>
        )}
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[600],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[300],
    marginHorizontal: 16,
    marginVertical: 16,
  },
  chatSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#867771",
  },
  newChatButton: {
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: "center",
    paddingVertical: 20,
  },
  chatList: {
    gap: 4,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  chatInfo: {
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  chatTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[800],
    marginBottom: 2,
  },
  chatTime: {
    fontSize: 12,
    color: colors.gray[500],
  },
});

export default CustomDrawerContent;
