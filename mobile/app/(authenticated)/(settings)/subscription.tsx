import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header/Header";
import { colors } from "../../../constants/colors";
import useSubscriptionManagement from "../../../hooks/useSubscriptions";

function SubscriptionSettings() {
  const {
    current,
    plans,
    isLoadingCurrent,
    isLoadingPlans,
    billingPortal,
    isLoadingBillingPortal,
    refetchBillingPortal,
    createCheckoutSessionAsync,
  } = useSubscriptionManagement();

  const [activeIndex, setActiveIndex] = useState(0);

  const formattedCurrent = useMemo(() => {
    if (!current) return null;
    const price =
      current.price != null ? `$${(current.price / 100).toFixed(2)}` : "Free";
    const interval = current.interval ? ` / ${current.interval}` : "";
    return {
      name: current.display_name || current.name,
      price: `${price}${interval}`,
    };
  }, [current]);

  const sortedPlans = useMemo(() => {
    if (!plans || plans.length === 0) return [] as typeof plans;
    const copy = [...plans];
    copy.sort((a, b) => {
      const aIsFree = a.name === "FREE";
      const bIsFree = b.name === "FREE";
      if (aIsFree && !bIsFree) return -1;
      if (!aIsFree && bIsFree) return 1;
      // Otherwise keep original order
      return 0;
    });
    return copy;
  }, [plans]);

  const handleManageSubscription = async () => {
    const url = billingPortal?.url;
    if (url) {
      Linking.openURL(url);
      return;
    }
    const res = await refetchBillingPortal();
    if (res?.data?.url) Linking.openURL(res.data.url);
  };

  const handleChoosePlan = async (planName: string) => {
    const apiName = planName.toLowerCase();
    const session = await createCheckoutSessionAsync(apiName);
    if (session?.url) Linking.openURL(session.url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        <Header
          showMenuButton={false}
          leftComponent={
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[800]} />
            </TouchableOpacity>
          }
          title="Subscription"
        />
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.planTitle}>Current Plan</Text>
          {isLoadingCurrent ? (
            <ActivityIndicator color={colors.primary[400]} />
          ) : (
            <>
              <Text style={styles.planName}>
                {formattedCurrent?.name ?? "—"}
              </Text>
              <Text style={styles.planDetail}>
                {formattedCurrent?.price ?? "—"}
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleManageSubscription}
              >
                {isLoadingBillingPortal ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Manage Subscription
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.planTitle}>Plans</Text>
          {isLoadingPlans ? (
            <ActivityIndicator color={colors.primary[400]} />
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.plansScrollContent}
              scrollEventThrottle={16}
              onScroll={(e) => {
                const { contentOffset, layoutMeasurement } = e.nativeEvent;
                const index = Math.round(
                  contentOffset.x / Math.max(layoutMeasurement.width, 1)
                );
                if (index !== activeIndex) setActiveIndex(index);
              }}
            >
              {(sortedPlans || []).map((plan) => {
                const isCurrent = plan.name === current?.name;
                const price =
                  plan.price != null
                    ? `$${(plan.price / 100).toFixed(2)}`
                    : "Free";
                const interval = plan.interval ? ` / ${plan.interval}` : "";
                return (
                  <View key={plan.id} style={styles.planCard}>
                    <Text style={styles.planCardTitle}>
                      {plan.display_name || plan.name}
                    </Text>
                    <Text
                      style={styles.planCardPrice}
                    >{`${price}${interval}`}</Text>
                    <View style={styles.featuresList}>
                      {(plan.features || []).map((feature, index) => (
                        <View
                          key={`${plan.id}-feature-${index}`}
                          style={styles.featureRow}
                        >
                          <View style={styles.featureDot} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                    {isCurrent ? (
                      <TouchableOpacity
                        style={[styles.secondaryButton, { opacity: 0.7 }]}
                        onPress={handleManageSubscription}
                      >
                        <Text style={styles.secondaryButtonText}>
                          Manage Current Plan
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => handleChoosePlan(plan.name)}
                      >
                        <Text style={styles.secondaryButtonText}>
                          Choose Plan
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
          {!isLoadingPlans && (sortedPlans?.length || 0) > 1 && (
            <View style={styles.dotsRow}>
              {sortedPlans.map((_, i) => (
                <View
                  key={`dot-${i}`}
                  style={[styles.dot, i === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default SubscriptionSettings;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  plansScrollContent: {
    paddingVertical: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 0.574,
    borderColor: "#ebe6e3",
    padding: 16,
  },
  planCard: {
    width: 300,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ebe6e3",
    padding: 16,
    marginRight: 12,
  },
  planCardTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    lineHeight: 26,
    color: "#2b2827",
    letterSpacing: -0.31,
  },
  planCardPrice: {
    marginTop: 4,
    fontFamily: "Inter-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "#867873",
    marginBottom: 8,
  },
  featuresList: {
    marginVertical: 8,
    gap: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[400],
  },
  featureText: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "#2b2827",
  },
  dotsRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d9d4d2",
  },
  dotActive: {
    backgroundColor: colors.primary[400],
  },
  planTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    lineHeight: 20,
    color: "#867873",
    letterSpacing: -0.15,
    marginBottom: 8,
  },
  planName: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    lineHeight: 26,
    color: "#2b2827",
    letterSpacing: -0.31,
  },
  planDetail: {
    marginTop: 4,
    fontFamily: "Inter-Regular",
    fontSize: 13,
    lineHeight: 18,
    color: "#867873",
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: colors.primary[400],
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 14,
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ebe6e3",
    alignSelf: "flex-start",
  },
  secondaryButtonText: {
    color: "#2b2827",
    fontFamily: "Inter-Medium",
    fontSize: 14,
  },
});
