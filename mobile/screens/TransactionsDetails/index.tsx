import Header from "@/components/Header";
import { colors } from "@/constants/colors";
import { useTransactionManagement } from "@/hooks/useTransactions";
import { formatPrice, formatTransactionForUI } from "@/utils/transactionUtils";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BuyersAndSellers,
  LenderTitle,
  Overview,
  Property,
  Settings,
  TabNavigation,
  Tasks,
  Transaction,
} from "./components";

const TransactionsDetailsScreen: React.FC = () => {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const [activeTab, setActiveTab] = useState("Overview");
  const { transaction, isLoadingTransaction, isSuccessTransaction } =
    useTransactionManagement(transactionId);

  // Only format transaction if it exists and is successfully loaded
  const formattedTransaction =
    transaction && isSuccessTransaction
      ? formatTransactionForUI(transaction)
      : null;

  // Helper function to get the first name (buyer priority, then seller)
  const getFirstName = () => {
    if (!formattedTransaction?.buyersAndSellersParsed) return "";

    const { buyers, sellers } = formattedTransaction.buyersAndSellersParsed;

    // Priority: buyer first, then seller
    if (buyers.length > 0) {
      return buyers[0].firstName;
    } else if (sellers.length > 0) {
      return sellers[0].firstName;
    }

    return "";
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const tabsScreens = () => {
    switch (activeTab) {
      case "Overview":
        // Only render Overview if transaction is defined
        return formattedTransaction ? (
          <Overview transaction={formattedTransaction} />
        ) : null;
      case "Transaction":
        return formattedTransaction ? (
          <Transaction transaction={formattedTransaction} />
        ) : null;
      case "Tasks":
        return <Tasks transactionId={transactionId} />;
      case "Property":
        return formattedTransaction ? (
          <Property transaction={formattedTransaction} />
        ) : null;
      case "Buyers & Sellers":
        return formattedTransaction ? (
          <BuyersAndSellers transaction={formattedTransaction} />
        ) : null;
      case "Lender & Title":
        return formattedTransaction ? (
          <LenderTitle transaction={formattedTransaction} />
        ) : null;
      case "Settings":
        return formattedTransaction ? (
          <Settings transaction={formattedTransaction} />
        ) : null;
      default:
        return formattedTransaction ? (
          <Overview transaction={formattedTransaction} />
        ) : null;
    }
  };
  console.log(formattedTransaction);
  if (isLoadingTransaction || !isSuccessTransaction || !formattedTransaction) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <ActivityIndicator size="large" color={colors.blue[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={colors.gray[800]} />
      </TouchableOpacity>
      <BottomSheetModalProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.content}>
            <Text style={styles.title}>{formattedTransaction.address}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {formatPrice(formattedTransaction.amount)}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.price}>{getFirstName()}</Text>
            </View>
            <TabNavigation onTabChange={handleTabChange} />
            <View style={styles.tabsScreens}>{tabsScreens()}</View>
          </View>
        </GestureHandlerRootView>
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
};

export default TransactionsDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  backButton: { paddingHorizontal: 16, paddingTop: 12 },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 12,
    paddingBottom: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    color: colors.gray[600],
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  separator: {
    width: 6,
    borderRadius: 999,
    height: 6,
    backgroundColor: colors.gray[600],
  },
  tabsScreens: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
