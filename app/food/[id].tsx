import { View, Text, Image, StyleSheet, Button } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useCart } from "../context/cartContext";

type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

export default function FoodDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // use correct hook
  const { addToCart } = useCart();
  const [food, setFood] = useState<Food | null>(null);

  useEffect(() => {
    if (id) fetchFood(id);
  }, [id]);

  const fetchFood = async (id: string) => {
    const docRef = doc(db, "foods", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setFood({
        id: docSnap.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
      });
    }
  };

  if (!food) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Button title="Back" onPress={() => router.back()} />

      <Text style={styles.name}>{food.name}</Text>
      <Image source={{ uri: food.image }} style={styles.image} />
      <Text style={styles.price}>R {food.price}</Text>
      <Text style={styles.description}>{food.description}</Text>

      <Button title="Add to Cart" onPress={() => addToCart(food)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  name: { fontSize: 24, fontWeight: "bold", marginVertical: 8 },
  image: { width: "100%", height: 200, borderRadius: 12, marginVertical: 8 },
  price: { fontSize: 18, fontWeight: "600", marginVertical: 4 },
  description: { fontSize: 16, marginVertical: 8 },
});
