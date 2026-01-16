import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();

  const [foodCount, setFoodCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const foodSnap = await getDocs(collection(db, "foods"));
    const orderSnap = await getDocs(collection(db, "orders"));

    setFoodCount(foodSnap.size);
    setOrderCount(orderSnap.size);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      {/* Analytics Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Food Items</Text>
        <Text style={styles.cardValue}>{foodCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Orders</Text>
        <Text style={styles.cardValue}>{orderCount}</Text>
      </View>

      {/* Navigation Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/admin/manage-food")}
      >
        <Text style={styles.buttonText}>Manage Food Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/admin/orders")}
      >
        <Text style={styles.buttonText}>View Orders</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 20,
    borderRadius: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    color: "#555",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
