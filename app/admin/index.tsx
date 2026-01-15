import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import PrimaryButton from "../components/PrimaryButton";
import { router } from "expo-router";

export default function AdminDashboard() {
  const [foods, setFoods] = useState<any[]>([]);

  const fetchFoods = async () => {
    const snapshot = await getDocs(collection(db, "foods"));
    const list: any[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    setFoods(list);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <PrimaryButton
        title="Add Food Item"
        onPress={() => router.push("/admin/manage-food")}
      />

      <Text style={styles.subtitle}>Current Foods</Text>
      {foods.length === 0 && <Text>No food items added yet</Text>}

      {foods.map((food) => (
        <View key={food.id} style={styles.foodItem}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text>{food.category}</Text>
          <Text>Price: R{food.price}</Text>
          <Text>Sides: {food.sides.join(", ")}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  subtitle: { fontSize: 20, marginTop: 20, marginBottom: 12 },
  foodItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  foodName: { fontWeight: "600", fontSize: 16 },
});
