import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import PrimaryButton from "../components/PrimaryButton";

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant App</Text>
      <Text style={styles.subtitle}>Order your favourite meals anytime</Text>

      <PrimaryButton title="Login" onPress={() => router.push("/login")} />

      <PrimaryButton
        title="Browse Menu"
        onPress={() => router.replace("/home")}
        variant="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
  },
});
