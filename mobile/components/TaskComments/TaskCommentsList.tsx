import { colors } from "@/constants/colors";
import { useComments } from "@/hooks/useComments";
import { getInitials } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow, parseISO } from "date-fns";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TaskCommentsListProps {
  taskId: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  style?: object;
}

export const TaskCommentsList: React.FC<TaskCommentsListProps> = ({
  taskId,
  maxItems,
  showViewAll = true,
  onViewAllPress,
  style,
}) => {
  const { data: comments = [], isLoading } = useComments(taskId);

  const formatTimestamp = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "";
    }
  };

  const displayComments = useMemo(() => {
    return maxItems ? comments.slice(0, maxItems) : comments;
  }, [comments, maxItems]);

  const isShowingAllComments = useMemo(() => {
    return !maxItems || displayComments.length >= comments.length;
  }, [maxItems, displayComments.length, comments.length]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={colors.primary[400]} />
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Text style={styles.emptyText}>No comments yet</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Comments</Text>
          <Text style={styles.count}>({comments.length})</Text>
        </View>
        {showViewAll && comments.length > 0 && (maxItems ? comments.length > maxItems : true) && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAllPress}
          >
            <Text style={styles.viewAllText}>
              {isShowingAllComments ? "View less" : "View all"}
            </Text>
            <Ionicons
              name={isShowingAllComments ? "chevron-up" : "chevron-forward"}
              size={16}
              color={colors.gray[600]}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.commentsList}>
        {displayComments.map((comment) => {
          const userName = comment.user?.name || "Unknown User";
          const initials = getInitials(userName);
          const timestamp = formatTimestamp(comment.created_at);

          return (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentContainer}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.timestamp}>{timestamp}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
    lineHeight: 24,
  },
  count: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[600],
    lineHeight: 20,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[600],
    lineHeight: 20,
  },
  commentsList: {
    gap: 12,
  },
  commentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  commentContainer: {
    flexDirection: "row",
    gap: 12,
  },
  avatarContainer: {
    alignItems: "flex-start",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gray[400],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  commentContent: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[800],
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 20,
  },
  commentText: {
    fontSize: 16,
    color: colors.gray[800],
    lineHeight: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[600],
    fontStyle: "italic",
  },
});
