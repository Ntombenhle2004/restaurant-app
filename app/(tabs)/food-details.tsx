import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FoodItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  addons?: FoodItem[];
  removables?: { name: string }[];
};

export default function FoodDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [food, setFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Customization States
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<FoodItem[]>([]);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);

  // RESET STATE WHEN VIEWING NEW PRODUCT OR RETURNING
  useFocusEffect(
    useCallback(() => {
      setQuantity(1);
      setSelectedAddons([]);
      setExcludedItems([]);
    }, [id]),
  );

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const docRef = doc(db, "foods", id as string);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setFood({ id: snap.id, ...snap.data() } as FoodItem);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id]);

  const calculateTotal = () => {
    if (!food) return 0;
    const addonsTotal = selectedAddons.reduce(
      (sum, item) => sum + item.price,
      0,
    );
    return (food.price + addonsTotal) * quantity;
  };

  const toggleAddon = (addon: FoodItem) => {
    const exists = selectedAddons.find((a) => a.id === addon.id);
    setSelectedAddons(
      exists
        ? selectedAddons.filter((a) => a.id !== addon.id)
        : [...selectedAddons, addon],
    );
  };

  const toggleRemovable = (name: string) => {
    setExcludedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    );
  };

  const addToCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem("cart");
      let cart = cartData ? JSON.parse(cartData) : [];
      const newItem = {
        cartId: Date.now().toString(),
        id: food?.id,
        name: food?.name,
        image: food?.image,
        quantity,
        selectedAddons,
        excludedItems,
        pricePerUnit:
          (food?.price || 0) + selectedAddons.reduce((s, i) => s + i.price, 0),
        totalPrice: calculateTotal(),
      };
      cart.push(newItem);
      await AsyncStorage.setItem("cart", JSON.stringify(cart));
      router.replace("/(tabs)/home"); // Go back to home
    } catch (e) {
      Alert.alert("Error", "Could not add to cart");
    }
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#000" style={styles.loader} />
    );
  if (!food)
    return (
      <View style={styles.container}>
        <Text>Food not found</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Image source={{ uri: food.image }} style={styles.mainImage} />

        <View style={styles.infoSection}>
          <Text style={styles.categoryLabel}>{food.category}</Text>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodDescription}>{food.description}</Text>
          <Text style={styles.basePrice}>R {food.price.toFixed(2)}</Text>
        </View>

        {/* REMOVABLES SECTION */}
        {/* REMOVABLES SECTION */}
        {food.removables && food.removables.length > 0 && (
          <View style={styles.extrasSection}>
            <Text style={styles.extrasTitle}>REMOVE INGREDIENTS?</Text>
            {food.removables.map((item, index) => {
              const isRemoved = excludedItems.includes(item.name);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.addonCard}
                  onPress={() => toggleRemovable(item.name)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isRemoved && styles.checkboxSelected,
                    ]}
                  >
                    {isRemoved && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>

                  {/* Added a View with marginLeft to create the space you wanted */}
                  <View style={[styles.addonInfo, { marginLeft: 15 }]}>
                    <Text style={styles.addonName}>No {item.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ADDONS SECTION (MATCHING SCREENSHOT) */}
        {food.addons && food.addons.length > 0 && (
          <View style={styles.extrasSection}>
            <Text style={styles.extrasTitle}>WOULD YOU LIKE TO ADD?</Text>
            {food.addons.map((addon) => {
              const isSelected = selectedAddons.some((a) => a.id === addon.id);
              return (
                <TouchableOpacity
                  key={addon.id}
                  style={styles.addonCard}
                  onPress={() => toggleAddon(addon)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>

                  {/* Fixed image size - contain ensures it doesn't stretch */}
                  <Image
                    source={{ uri: addon.image }}
                    style={styles.addonImage}
                    resizeMode="contain"
                  />

                  <View style={styles.addonInfo}>
                    <Text style={styles.addonName}>{addon.name}</Text>
                    <Text style={styles.addonPrice}>
                      +R{addon.price.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => quantity > 1 && setQuantity(quantity - 1)}
          >
            <Ionicons name="remove-circle-outline" size={32} color="black" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
            <Ionicons name="add-circle-outline" size={32} color="black" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addToCart}>
          <Text style={styles.addButtonText}>
            Add to Cart • R{calculateTotal().toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center",  },
  mainImage: { width: "100%", height: 250 },
  infoSection: { padding: 20 ,},
  categoryLabel: {
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  foodName: { fontSize: 26, fontWeight: "bold", marginVertical: 5 },
  foodDescription: { fontSize: 15, color: "#666", lineHeight: 20 },
  basePrice: { fontSize: 22, fontWeight: "700", marginTop: 10 },

  extrasSection: { paddingHorizontal: 20, marginTop: 10 ,},
  extrasTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
    color: "#333",
    
  },
  addonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#CCC",
    borderRadius: 4,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  addonImage: {
    width: 60,
    height: 60,
    marginHorizontal: 12,
  },
  addonInfo: { flex: 1 },
  addonName: { fontSize: 15, fontWeight: "500" },
  addonPrice: { fontSize: 13, color: "#666" },

  footer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderColor: "#EEE",
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  stepper: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  quantityText: { fontSize: 20, marginHorizontal: 12 },
  addButton: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 16,paddingHorizontal: 20, fontWeight: "600" },
});
