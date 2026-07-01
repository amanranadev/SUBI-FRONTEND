import UserAvatar from "@/components/UserAvatar";
import { colors } from "@/constants/colors";
import { BuyerSeller } from "@/types/transaction";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BuyerSellerCardProps {
  buyerSeller: BuyerSeller;
  pendDate: string;
  label: string;
}

const BuyerSellerCard: React.FC<BuyerSellerCardProps> = ({
  buyerSeller,
  pendDate,
  label,
}) => {
  return (
    <View style={styles.buyerCard}>
      <UserAvatar
        initials="AP"
        size={48}
        backgroundColor={colors.purple[100]}
      />
      <View style={styles.buyerInfo}>
        <View style={styles.buyerNameSection}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.buyerName}>
            {buyerSeller.firstName} {buyerSeller.lastName}
          </Text>
        </View>
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pending date</Text>
            <Text style={styles.detailValue}>
              {format(new Date(pendDate), "MMM dd, yyyy")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buyerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[500],
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  buyerInfo: {
    flex: 1,
    gap: 8,
  },
  buyerNameSection: {
    gap: 2,
  },
  label: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: "400",
  },
  buyerName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  detailsSection: {
    gap: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: "400",
  },
  detailValue: {
    fontSize: 12,
    color: colors.gray[900],
    fontWeight: "500",
  },
});

export default BuyerSellerCard;
