import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title?: string;
  showMenuButton?: boolean;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showMenuButton = true,
  leftComponent,
  rightComponent,
}) => {
  const navigation = useNavigation();

  const handleDrawerToggle = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {!showMenuButton && leftComponent ? (
          leftComponent
        ) : (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleDrawerToggle}
          >
            <Ionicons name="menu" size={24} color={colors.gray[800]} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        {title && (
          <View style={styles.titleContainer}>
            <Text>{title}</Text>
          </View>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    // paddingVertical: 16,
    backgroundColor: "transparent",
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: -0.312,
    color: colors.gray[800],
  },
  placeholder: {
    width: 36,
    height: 36,
  },
});

export default Header;
