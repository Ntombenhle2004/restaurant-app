import { View, Text, StyleSheet } from "react-native";

export default function CartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Cart</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18 },
});
