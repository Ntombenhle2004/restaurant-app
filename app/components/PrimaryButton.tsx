import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        variant === "secondary" && styles.secondary,
        loading && { opacity: 0.7 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#000"} />
      ) : (
        <Text
          style={[styles.text, variant === "secondary" && styles.secondaryText]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#000", // Solid black for luxury
    paddingVertical: 18,
    borderRadius: 2, // Minimalist sharp corners
    marginTop: 10,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#000",
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 2, // Elegant spacing
    textTransform: "uppercase",
  },
  secondaryText: {
    color: "#000",
  },
});
