import CircleCheck from "@/assets/icons/CircleCheck";
import DateIcon from "@/assets/icons/DateIcon";
import DollarIcon from "@/assets/icons/DollarIcon";
import UserAvatar from "@/components/UserAvatar";
import { colors } from "@/constants/colors";
import { useTeamManagement } from "@/hooks/useTeams";
import { Transaction } from "@/types/transaction";
import { formatPrice } from "@/utils/transactionUtils";
import { format } from "date-fns";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BuyerSellerCard from "../BuyerSellerCard";
import StatsCard from "../StatsCard/index";
interface OverviewProps {
  transaction: Transaction;
}

const avatarColor = [
  {
    backgroundColor: colors.red[100],
    initialsColor: colors.red[800]
  },
  {
    backgroundColor: colors.blue[100],
    initialsColor: colors.blue[800]
  },
  {
    backgroundColor: colors.purple[100],
    initialsColor: colors.purple[600]
  },
  {
    backgroundColor: colors.yellow[100],
    initialsColor: colors.yellow[900]
  },
];

const Overview: React.FC<OverviewProps> = ({ transaction }) => {
  const { teams } = useTeamManagement();
  console.log(teams);

  // Compute days display with proper grammar and overdue handling
  const absDays = Math.abs(transaction.daysToClose);
  const isOverdue = transaction.daysToClose < 0;
  const dayWord = absDays === 1 ? "day" : "days";
  const statusWord = isOverdue ? "overdue" : "left";

  return (
  <ScrollView showsVerticalScrollIndicator={false}>
    <View style={styles.container}>
      {transaction.buyersAndSellersParsed?.buyers.map((buyer, index) => (
        <BuyerSellerCard
          key={`buyer-${buyer.email}-${index}`}
          buyerSeller={buyer}
          pendDate={transaction.pendDate}
          label="Buyer"
        />
      ))}
      {transaction.buyersAndSellersParsed?.sellers.map((seller, index) => (
        <BuyerSellerCard
          key={`seller-${seller.email}-${index}`}
          buyerSeller={seller}
          pendDate={transaction.pendDate}
          label="Seller"
        />
      ))}
      <View style={styles.statsRow}>
        <StatsCard
          icon={<DollarIcon width={16} height={16} />}
          mainText={formatPrice(transaction.amount)}
          subText="Sale price"
        />
        <StatsCard
          icon={<CircleCheck width={16} height={16} />}
          mainText={transaction.totalCompletedTasks.toString()}
          subText={`of ${transaction.totalTasks} tasks`}
        />
        <StatsCard
          icon={<DateIcon width={16} height={16} />}
          mainText={format(new Date(transaction.closeDate), "MMM dd, yyyy")}
          subText="Closing date"
        />
        <StatsCard
          mainText={absDays.toString()}
          subText={`${dayWord} ${statusWord}`}
        />
      </View>

      <View style={styles.teamCard}>
        <Text style={styles.teamTitle}>Team</Text>
        <View style={styles.teamMembers}>
          {teams && teams.length > 0 ? (
            teams.map((team, index) => (
              <View style={styles.teamMember} key={team.id}>
                <UserAvatar
                  initials={team.name?.charAt(0)?.toUpperCase() || "?"}
                  size={40}
                  backgroundColor={avatarColor[index % avatarColor.length].backgroundColor}
                  initialsColor={avatarColor[index % avatarColor.length].initialsColor}
                />
                <Text style={styles.memberName}>{team.name || "Unknown Team"}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.memberName}>No team members</Text>
          )}
        </View>
      </View>
    </View>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingVertical: 12,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  teamCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[500],
    padding: 16,
    gap: 12,
  },
  teamTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  teamMembers: {
    gap: 12,
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
});

export default Overview;
