import { View, Text, StyleSheet, FlatList, Image, Alert } from "react-native";
import { Icon } from "react-native-elements";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useRouter, useFocusEffect } from "expo-router";


const APP_COLOR = "#000";

type Food = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
};

export default function FoodList() {
  const [foods, setFoods] = useState<Food[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadFoods();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFoods();
    }, []),
  );

  const loadFoods = async () => {
    const snap = await getDocs(collection(db, "foods"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Food, "id">),
    }));
    setFoods(list);
  };

  const deleteFood = async (id: string) => {
    Alert.alert("Confirm", "Delete this food item?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "foods", id));
          loadFoods();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Items</Text>

      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>R {item.price}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>

            <View style={styles.actions}>
              <Icon
                name="edit"
                type="feather"
                color={APP_COLOR}
                onPress={() =>
                  router.push({
                    pathname: "/admin/manage-food",
                    params: {
                      id: item.id,
                      name: item.name,
                      price: item.price.toString(),
                      image: item.image,
                      description: item.description,
                      category: item.category || "",
                      addons: JSON.stringify((item as any).addons || []),
                      removables: JSON.stringify(
                        (item as any).removables || [],
                      ),
                    },
                  })
                }
              />

              <Icon
                name="trash"
                type="feather"
                color="red"
                onPress={() => deleteFood(item.id)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontWeight: "bold",
  },
  category: {
    fontSize: 12,
    color: "#777",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
    description: {
    fontSize: 14,
    }
});
