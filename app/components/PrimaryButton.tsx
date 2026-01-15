import { Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export default function PrimaryButton({
  title,
  onPress,
  variant = "primary",
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, variant === "secondary" && styles.secondary]}
    >
      <Text
        style={[styles.text, variant === "secondary" && styles.secondaryText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#E53935",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  secondary: {
    backgroundColor: "#eee",
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryText: {
    color: "#000",
  },
});
