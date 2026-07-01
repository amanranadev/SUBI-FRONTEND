import { Stack } from "expo-router/stack";
import React from "react";

export default function TransactionsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="transactions"
        options={{
          title: "Transactions",
        }}
      />
      <Stack.Screen
        name="transactionsDetails"
        options={{
          title: "Transaction Details",
        }}
      />
    </Stack>
  );
}
