import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Button } from "react-native-elements";
import { useLocalSearchParams, Stack } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";

type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

const APP_COLOR = "#000";

export default function FoodDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchFood();
  }, [id]);

  const fetchFood = async () => {
    try {
      const ref = doc(db, "foods", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setFood({
          id: snap.id,
          ...(snap.data() as Omit<Food, "id">),
        });
      }
    } catch (error) {
      console.log("Error loading food:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={APP_COLOR} />
      </View>
    );
  }

  if (!food) {
    return (
      <View style={styles.center}>
        <Text>Food not found</Text>
      </View>
    );
  }

  return (
    <>
      {/* HEADER WITH BACK ARROW */}
      <Stack.Screen
        options={{
          title: "Food Detail",
        }}
      />

      <ScrollView style={styles.container}>
        <Image source={{ uri: food.image }} style={styles.image} />

        <Text style={styles.name}>{food.name}</Text>
        <Text style={styles.category}>{food.category}</Text>

        <Text style={styles.description}>{food.description}</Text>

        <Text style={styles.price}>R {food.price}</Text>

        <Button
          title="Add to Cart"
          buttonStyle={styles.button}
          onPress={() => {
            // cart logic comes next
          }}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },

  category: {
    fontSize: 14,
    color: "#777",
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },

  price: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  button: {
    backgroundColor: APP_COLOR,
    borderRadius: 8,
  },
});
