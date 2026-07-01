import DateIcon from "@/assets/icons/DateIcon";
import UserAvatar from "@/components/UserAvatar";
import { colors } from "@/constants/colors";
import { Transaction } from "@/types/transaction";
import {
  formatPrice,
  getBackgroundColor,
  getStatusColor,
  getStatusIcon,
  getStatusText,
} from "@/utils/transactionUtils";
import {
  formatDaysText,
  getColorFromInitials,
  getInitials,
} from "@/utils/utils";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ListingCardProps {
  transaction: Transaction;
}

const ListingCard: React.FC<ListingCardProps> = ({ transaction }) => {
  const buyerAndSellerArray = [
    ...(transaction.buyersAndSellersParsed?.buyers || []),
    ...(transaction.buyersAndSellersParsed?.sellers || []),
  ];
  return (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: `/transactionsDetails`,
        params: { transactionId: transaction.id }
      })}
      style={[
        styles.transactionCard,
        { backgroundColor: getBackgroundColor(transaction.statusType) },
      ]}
    >
      <Text style={styles.address}>{transaction.address}</Text>
      <Text style={styles.price}>{formatPrice(transaction.listingPrice || 0)}</Text>

      <View style={styles.footerContainer}>
        <View style={styles.statusInfo}>
          <DateIcon height={14} width={14} />
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
              {getStatusText(
                transaction.statusType,
                transaction.overdueCount,
                transaction.dueSoonCount
              )}
            </Text>
          </View>
        </View>

        <View style={styles.avatarsContainer}>
          {(buyerAndSellerArray).map((user, index: number) => {
            const initials = getInitials(`${user.firstName} ${user.lastName}`)
            // Use unique key: combine firstName, lastName, and index to ensure uniqueness
            const uniqueKey = `${user.firstName || ""}-${user.lastName || ""}-${index}`
            return (
              <UserAvatar
                key={uniqueKey}
                initials={initials}
                isOverlapping={index > 0}
                backgroundColor={getColorFromInitials(initials)}
              />
            )
          })}
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
  price: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
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

export default ListingCard;
