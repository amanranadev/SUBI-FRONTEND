import Header from "@/components/Header";
// import CreateListingModal from "@/components/CreateListingModal/CreateListingModal";
import ListingCard from "@/components/ListingCard/ListingCard";
import TransactionCard from "@/components/TransactionCard/TransactionCard";
import { colors } from "@/constants/colors";
import { useTransactionManagement } from "@/hooks/useTransactions";
import { useUserStore } from "@/stores/userStore";
import { Transaction } from "@/types/transaction";
import { formatTransactionForUI } from "@/utils/transactionUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TransactionsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"listings" | "transactions">(
    "transactions",
  );
  const user = useUserStore((state) => state.user);

  const {
    transactions: allTransactions,
    isLoading,
    error,
    refetch,
  } = useTransactionManagement();

  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];
    const transactionArray = Array.isArray(allTransactions)
      ? allTransactions
      : [];
    const filtered = transactionArray.filter((transaction: Transaction) => {
      const category =
        transaction.transactionCategory || transaction.transaction_category;
      if (activeTab === "listings") {
        return category === "LISTING";
      } else {
        return category === "PSA";
      }
    });
    return filtered;
  }, [allTransactions, activeTab]);

  const transactions = filteredTransactions.map(formatTransactionForUI);

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blue[500]} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error instanceof Error
              ? error.message
              : "Failed to fetch transactions"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Header />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "listings"
              ? styles.activeTabButton
              : styles.inactiveTabButton,
          ]}
          onPress={() => setActiveTab("listings")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "listings" && styles.activeTabText,
            ]}
          >
            Listings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "transactions"
              ? styles.activeTabButton
              : styles.inactiveTabButton,
          ]}
          onPress={() => setActiveTab("transactions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "transactions" && styles.activeTabText,
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <View style={styles.titleTextContainer}>
            <Text style={styles.pageTitle}>
              {activeTab === "listings" ? "Listings" : "Transactions"}
            </Text>
            <Text style={styles.pageSubtitle}>
              {activeTab === "listings"
                ? `${transactions.length} active listings`
                : `${transactions.length} under contract`}
            </Text>
          </View>
          {activeTab === "transactions" ? (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/home")}
              accessibilityLabel="Create new transaction"
            >
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          ) : null}
          {/* Listing creation disabled — legacy CreateListingModal removed. */}
        </View>
      </View>

      <View style={styles.divider} />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {transactions.map((transaction: Transaction) => {
          if (activeTab === "listings") {
            return (
              <ListingCard key={transaction.id} transaction={transaction} />
            );
          } else {
            return (
              <TransactionCard key={transaction.id} transaction={transaction} />
            );
          }
        })}
      </ScrollView>

      {/* Listing creation disabled — CreateListingModal stub returns null.
      <CreateListingModal
        ref={createListingModalRef}
        onSuccess={() => {}}
        onClose={() => createListingModalRef.current?.dismiss()}
      />
      */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[500],
    marginVertical: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: colors.gray[300],
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  activeTabButton: {
    backgroundColor: colors.white,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveTabButton: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[600],
  },
  activeTabText: {
    color: colors.gray[800],
    fontWeight: "600",
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[900],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: colors.red[500],
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.blue[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TransactionsScreen;
