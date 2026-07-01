import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatsCardProps {
  icon?: React.ReactNode;
  mainText: string;
  subText: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, mainText, subText }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {icon ? icon : <View style={styles.iconPlaceholder} />}
      </View>

      <View style={styles.mainTextWrapper}>
        <Text
          style={styles.mainText}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={18 / 30}
        >
          {mainText}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subText}>{subText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[500],
    width: 112,
    height: 120,
  },
  iconContainer: {
    flex: 1 / 3,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  section: {
    flex: 1 / 3,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mainTextWrapper: {
    flex: 1 / 3,
    alignItems: "flex-start",
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  iconPlaceholder: {
    width: 16,
    height: 16,
  },
  mainText: {
    fontSize: 30,
    fontWeight: "600",
    color: colors.gray[900],
  },
  subText: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: "400",
  },
});

export default StatsCard;
