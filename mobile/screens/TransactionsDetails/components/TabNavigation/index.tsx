import { colors } from "@/constants/colors";
import React, { useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TabNavigationProps {
  onTabChange?: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const flatListRef = useRef<FlatList>(null);

  const tabs = [
    { id: "Overview", label: "Overview" },
    { id: "Transaction", label: "Transaction" },
    { id: "Tasks", label: "Tasks" },
    { id: "Property", label: "Property" },
    { id: "Buyers & Sellers", label: "Buyers & Sellers" },
    { id: "Lender & Title", label: "Lender & Title" },
    { id: "Settings", label: "Settings" },
  ];

  const handleTabPress = (tabId: string, index: number) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);

    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const renderTab = ({
    item,
    index,
  }: {
    item: (typeof tabs)[0];
    index: number;
  }) => {
    const isLastItem = index === tabs.length - 1;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isLastItem && { marginRight: 0 }]}
        onPress={() => handleTabPress(item.id, index)}
      >
        <Text
          style={[styles.tabText, activeTab === item.id && styles.activeTabText]}
        >
          {item.label}
        </Text>
        {activeTab === item.id && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={tabs}
        renderItem={renderTab}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
      />
      <View style={styles.borderLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 33,
    // paddingRight: 16,
    // overflow: "hidden",
  },
  tabContainer: {
    alignItems: "center",
  },
  tabButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginRight: 24,
    position: "relative",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[600],
    lineHeight: 21,
  },
  activeTabText: {
    color: colors.gray[900],
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.gray[900],
  },
  borderLine: {
    width: "100%",
    bottom: 0,
    left: 0,
    right: 25,
    height: 0.5,
    backgroundColor: colors.gray[500],
  },
});

export default TabNavigation;
