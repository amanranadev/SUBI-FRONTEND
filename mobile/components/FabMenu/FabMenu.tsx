import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { ComponentProps, useEffect, useState } from "react";
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

export interface FabMenuItem {
  label: string;
  iconName: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}

interface FabMenuProps {
  items: FabMenuItem[];
  hidden?: boolean;
  style?: StyleProp<ViewStyle>;
  menuDirection?: "down" | "up";
}

const FabMenu: React.FC<FabMenuProps> = ({
  items,
  hidden = false,
  style,
  menuDirection = "down",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (hidden) {
      setIsOpen(false);
    }
  }, [hidden]);

  const handleItemPress = (onPress: () => void) => {
    setIsOpen(false);
    onPress();
  };

  return (
    <View
      style={[
        styles.container,
        hidden && { opacity: 0, pointerEvents: "none" as const },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Ionicons
          name={isOpen ? "close" : "add"}
          size={28}
          color={colors.white}
        />
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            styles.menuBase,
            menuDirection === "up" ? styles.menuUp : styles.menuDown,
          ]}
        >
          {items.map((item, index) => (
            <View key={index} style={styles.menuItem}>
              <TouchableOpacity
                style={styles.menuLabel}
                onPress={() => handleItemPress(item.onPress)}
              >
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => handleItemPress(item.onPress)}
              >
                <Ionicons name={item.iconName} size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default FabMenu;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brickOrange,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.brickOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  menuBase: {
    position: "absolute",
    right: 0,
    gap: 12,
    zIndex: 9,
    width: 220,
  },
  menuDown: {
    top: 60,
  },
  menuUp: {
    bottom: 60,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  menuLabel: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    flexShrink: 0,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.gray[800],
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brickOrange,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.brickOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
