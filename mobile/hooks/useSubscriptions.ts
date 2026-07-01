import { useMutation, useQuery } from "@tanstack/react-query";
import { subscriptionService } from "../services/subscriptionService";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  lists: () => [...subscriptionKeys.all, "list"] as const,
  details: () => [...subscriptionKeys.all, "detail"] as const,
  current: () => [...subscriptionKeys.details(), "current"] as const,
  plans: () => [...subscriptionKeys.lists(), "plans"] as const,
};

export default function useSubscriptionManagement() {
  const plansQuery = useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: subscriptionService.getPlans,
  });

  const currentQuery = useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: subscriptionService.getCurrent,
  });

  const createCheckoutMutation = useMutation({
    mutationFn: (planName: string) =>
      subscriptionService.createCheckoutSession(planName),
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionService.cancelSubscription(),
  });

  const billingPortalQuery = useQuery({
    queryKey: [...subscriptionKeys.details(), "billing_portal"],
    queryFn: subscriptionService.getBillingPortalUrl,
  });

  return {
    // Queries
    plans: plansQuery.data || [],
    current: currentQuery.data || null,
    billingPortal: billingPortalQuery.data,

    // Loading
    isLoadingPlans: plansQuery.isLoading,
    isLoadingCurrent: currentQuery.isLoading,
    isLoadingBillingPortal: billingPortalQuery.isLoading,

    // Errors
    isErrorPlans: plansQuery.isError,
    isErrorCurrent: currentQuery.isError,
    isErrorBillingPortal: billingPortalQuery.isError,
    errorPlans: plansQuery.error,
    errorCurrent: currentQuery.error,
    errorBillingPortal: billingPortalQuery.error,

    // Refetch
    refetchPlans: plansQuery.refetch,
    refetchCurrent: currentQuery.refetch,
    refetchBillingPortal: billingPortalQuery.refetch,

    // Mutations
    createCheckoutSession: createCheckoutMutation.mutate,
    createCheckoutSessionAsync: createCheckoutMutation.mutateAsync,
    cancelSubscription: cancelMutation.mutate,
    cancelSubscriptionAsync: cancelMutation.mutateAsync,

    // Mutation states
    isCreatingCheckout: createCheckoutMutation.isPending,
    isCancelling: cancelMutation.isPending,
    createCheckoutError: createCheckoutMutation.error,
    cancelError: cancelMutation.error,
    isCreateCheckoutSuccess: createCheckoutMutation.isSuccess,
    isCancelSuccess: cancelMutation.isSuccess,
  };
}
