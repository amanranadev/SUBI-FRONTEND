import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface UserAvatarProps {
  initials: string;
  isOverlapping?: boolean;
  size?: number;
  backgroundColor?: string;
  initialsColor?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  initials,
  isOverlapping = false,
  size = 32,
  backgroundColor = colors.blue[500],
  initialsColor = colors.white,
}) => {
  const avatarSize = size;
  const borderRadius = avatarSize / 2;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius,
          backgroundColor,
          marginLeft: isOverlapping ? -8 : 0,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.375 }, {color: initialsColor}]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "600",
  },
});

export default UserAvatar;
