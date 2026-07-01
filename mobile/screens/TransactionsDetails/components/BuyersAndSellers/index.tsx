import { colors } from "@/constants/colors";
import { useTransactionManagement } from "@/hooks/useTransactions";
import { Transaction, BuyersAndSellers as BuyersAndSellersType } from "@/types";
import {
  formatPhoneNumber,
  stripPhoneNumber,
} from "@/utils/phoneUtils";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SaveButton from "../SaveButton";
import AddPartyButton from "./AddPartyButton";
import PartyCard from "./PartyCard";
import { BuyersAndSellersFormData, PartyFormData } from "./types";

interface BuyersAndSellersProps {
  transaction: Transaction;
}

const createEmptyParty = (): PartyFormData => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  representing: false,
  isFromAPI: false,
});

const BuyersAndSellers: React.FC<BuyersAndSellersProps> = ({ transaction }) => {
  const { updateTransaction } = useTransactionManagement(transaction.id);

  const existingBuyers = transaction.buyersAndSellersParsed?.buyers || [];
  const existingSellers = transaction.buyersAndSellersParsed?.sellers || [];

  const formatParties = (parties: any[]): PartyFormData[] => {
    return parties.map((party) => ({
      firstName: party.firstName || "",
      lastName: party.lastName || "",
      email: party.email || "",
      phone: party.phone ? formatPhoneNumber(party.phone) : "",
      representing: party.representing || false,
      isFromAPI: party.isFromAPI || false,
    }));
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<BuyersAndSellersFormData>({
    defaultValues: {
      buyers: formatParties(existingBuyers),
      sellers: formatParties(existingSellers),
    },
  });

  const buyers = watch("buyers");
  const sellers = watch("sellers");

  const [expandedBuyers, setExpandedBuyers] = useState<boolean[]>(
    existingBuyers.map(() => true)
  );
  const [expandedSellers, setExpandedSellers] = useState<boolean[]>(
    existingSellers.map(() => true)
  );

  useEffect(() => {
    const updatedBuyers = transaction.buyersAndSellersParsed?.buyers || [];
    const updatedSellers = transaction.buyersAndSellersParsed?.sellers || [];

    reset({
      buyers: formatParties(updatedBuyers),
      sellers: formatParties(updatedSellers),
    });

    setExpandedBuyers(updatedBuyers.map(() => true));
    setExpandedSellers(updatedSellers.map(() => true));
  }, [transaction, reset]);

  const toggleBuyerExpand = (index: number) => {
    setExpandedBuyers((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const toggleSellerExpand = (index: number) => {
    setExpandedSellers((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const addBuyer = () => {
    const currentBuyers = getValues("buyers") || [];
    setValue("buyers", [...currentBuyers, createEmptyParty()]);
    setExpandedBuyers((prev) => [...prev, true]);
  };

  const addSeller = () => {
    const currentSellers = getValues("sellers") || [];
    setValue("sellers", [...currentSellers, createEmptyParty()]);
    setExpandedSellers((prev) => [...prev, true]);
  };

  const removeBuyer = (index: number) => {
    const currentBuyers = getValues("buyers") || [];
    const newBuyers = currentBuyers.filter((_, i) => i !== index);
    setValue("buyers", newBuyers);
    setExpandedBuyers((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSeller = (index: number) => {
    const currentSellers = getValues("sellers") || [];
    const newSellers = currentSellers.filter((_, i) => i !== index);
    setValue("sellers", newSellers);
    setExpandedSellers((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: BuyersAndSellersFormData) => {
    const processParties = (parties: PartyFormData[]) => {
      return parties.map((party) => ({
        firstName: party.firstName,
        lastName: party.lastName,
        email: party.email,
        phone: party.phone ? stripPhoneNumber(party.phone) : "",
        representing: party.representing,
        isFromAPI: party.isFromAPI,
      }));
    };

    const updatedBuyersAndSellers: BuyersAndSellersType = {
      buyers: processParties(data.buyers),
      sellers: processParties(data.sellers),
    };

    const updates: Partial<Transaction> = {
      buyersAndSellers: JSON.stringify(updatedBuyersAndSellers),
      buyers_and_sellers: JSON.stringify(updatedBuyersAndSellers),
      buyersAndSellersParsed: updatedBuyersAndSellers,
    };

    updateTransaction({ transactionId: transaction.id, updates });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Buyers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Buyers</Text>
            </View>

            {buyers.length === 0 ? (
              <Text style={styles.emptyText}>No buyers added yet</Text>
            ) : (
              buyers.map((buyer, index) => (
                <PartyCard
                  key={`buyer-${index}`}
                  index={index}
                  party={buyer}
                  type="buyer"
                  isExpanded={expandedBuyers[index] ?? true}
                  onToggleExpand={() => toggleBuyerExpand(index)}
                  onDelete={() => removeBuyer(index)}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                />
              ))
            )}

            <AddPartyButton label="Add Buyer" onPress={addBuyer} />
          </View>

          {/* Sellers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sellers</Text>
            </View>

            {sellers.length === 0 ? (
              <Text style={styles.emptyText}>No sellers added yet</Text>
            ) : (
              sellers.map((seller, index) => (
                <PartyCard
                  key={`seller-${index}`}
                  index={index}
                  party={seller}
                  type="seller"
                  isExpanded={expandedSellers[index] ?? true}
                  onToggleExpand={() => toggleSellerExpand(index)}
                  onDelete={() => removeSeller(index)}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                />
              ))
            )}

            <AddPartyButton label="Add Seller" onPress={addSeller} />
          </View>

          <SaveButton onPress={handleSubmit(onSubmit)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
    fontStyle: "italic",
  },
});

export default BuyersAndSellers;
