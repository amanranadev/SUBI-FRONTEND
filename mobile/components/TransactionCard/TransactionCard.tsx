import UserAvatar from "@/components/UserAvatar";
import { colors } from "@/constants/colors";
import { Transaction } from "@/types";
import {
  getBackgroundColor,
  getStatusColor,
  getStatusIcon,
  getStatusText,
} from "@/utils/transactionUtils";
import {
  formatCapitalSnakeCaseToLowerCase,
  formatDaysText,
} from "@/utils/utils";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TransactionCardProps {
  transaction: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  console.log(transaction.daysToClose);
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: `/transactionsDetails`,
          params: { transactionId: transaction.id },
        })
      }
      style={[
        styles.transactionCard,
        { backgroundColor: getBackgroundColor(transaction.statusType) },
      ]}
    >
      <Text style={styles.address}>{transaction.address}</Text>
      <Text style={styles.amount}>${transaction.amount.toLocaleString()}</Text>
      {transaction.status && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {formatCapitalSnakeCaseToLowerCase(transaction.status)}
          </Text>
        </View>
      )}

      <View style={styles.footerContainer}>
        <View style={styles.statusInfo}>
          <Text style={styles.daysText}>
            {formatDaysText(transaction.daysToClose, {
              suffix: "days",
              context: "countdown",
            })}
          </Text>
          <View style={styles.separator} />
          <View style={styles.statusIndicator}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(transaction.statusType)}
            </Text>
            <Text
              style={[
                styles.statusLabel,
                { color: getStatusColor(transaction.statusType) },
              ]}
            >
              {getStatusText(transaction.statusType)}
            </Text>
          </View>
        </View>

        <View style={styles.avatarsContainer}>
          {transaction.users?.map((user: string, index: number) => (
            <UserAvatar key={user} initials={user} isOverlapping={index > 0} />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.gray[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  address: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    marginBottom: 8,
  },
  amount: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 16,
    backgroundColor: colors.yellow[100],
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.yellow[900],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    flexShrink: 0,
    minWidth: 0,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  daysText: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: "500",
  },
  separator: {
    width: 6,
    borderRadius: 999,
    height: 6,
    backgroundColor: colors.gray[400],
    marginHorizontal: 8,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  avatarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default TransactionCard;
