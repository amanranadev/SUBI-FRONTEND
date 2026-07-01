import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ErrorContainerProps {
  title: string;
  message: string;
  status?: number;
  code?: string;
}

const ErrorContainer: React.FC<ErrorContainerProps> = ({
  title,
  message,
  status,
  code,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={20} color={colors.red[500]} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {(status || code) && (
            <Text style={styles.details}>
              {status && `Status: ${status}`}
              {status && code && " • "}
              {code && `Code: ${code}`}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  message: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "400",
    color: "#991B1B",
    lineHeight: 18,
  },
  details: {
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "400",
    color: "#B91C1C",
    marginTop: 2,
  },
});

export default ErrorContainer;
