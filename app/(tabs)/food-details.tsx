import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
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
  const { id, cartItemId } = useLocalSearchParams();
  const router = useRouter();

  const [food, setFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<FoodItem[]>([]);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!cartItemId) {
        setQuantity(1);
        setSelectedAddons([]);
        setExcludedItems([]);
      }
    }, [id, cartItemId]),
  );

  useEffect(() => {
    const fetchFoodAndPreferences = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "foods", id as string);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const foodData = { id: snap.id, ...snap.data() } as FoodItem;
          setFood(foodData);

          if (cartItemId) {
            const user = auth.currentUser;
            // FIX: Match the logic - use cart_guest if no user
            const cartKey = user ? `cart_${user.uid}` : "cart_guest";
            const cartData = await AsyncStorage.getItem(cartKey);

            if (cartData) {
              const cart = JSON.parse(cartData);
              const existingItem = cart.find(
                (item: any) => item.id === cartItemId,
              );
              if (existingItem) {
                setQuantity(existingItem.quantity);
                setSelectedAddons(existingItem.selectedAddons || []);
                setExcludedItems(existingItem.excludedItems || []);
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFoodAndPreferences();
  }, [id, cartItemId]);

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
      const user = auth.currentUser;
      // FIX: Key must be "cart_guest" for logged-out users to match CartScreen
      const cartKey = user ? `cart_${user.uid}` : "cart_guest";

      const cartData = await AsyncStorage.getItem(cartKey);
      let cart = cartData ? JSON.parse(cartData) : [];

      const unitPrice =
        (food?.price || 0) + selectedAddons.reduce((s, i) => s + i.price, 0);

      const newItem = {
        id: cartItemId || Date.now().toString(),
        foodId: food?.id,
        name: food?.name,
        image: food?.image,
        quantity,
        selectedAddons,
        excludedItems,
        price: unitPrice,
      };

      if (cartItemId) {
        cart = cart.map((item: any) =>
          item.id === cartItemId ? newItem : item,
        );
      } else {
        cart.push(newItem);
      }

      await AsyncStorage.setItem(cartKey, JSON.stringify(cart));

      // UI Feedback
      if (!cartItemId) {
        if (Platform.OS === "android") {
          ToastAndroid.show("Added to cart!", ToastAndroid.SHORT);
        } else {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      }

      // If editing, go back to cart. If adding fresh, user stays here or can go to cart.
      if (cartItemId) {
        router.push("/cart");
      }
    } catch (e) {
      Alert.alert("Error", "Could not save to cart");
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
      <View style={styles.header}>
        <Text style={styles.brandTitle}>FOOD DETAILS</Text>
        <View style={styles.dividerGold} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Image source={{ uri: food.image }} style={styles.mainImage} />

        <View style={styles.infoSection}>
          <Text style={styles.foodName}>{food.name}</Text>
          {/* <Text style={styles.categoryLabel}>{food.category}</Text> */}

          <Text style={styles.foodDescription}>{food.description}</Text>
          <Text style={styles.basePrice}>R {food.price.toFixed(2)}</Text>
        </View>

        {/* REMOVABLES */}
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
                  <View style={[styles.addonInfo, { marginLeft: 15 }]}>
                    <Text style={styles.addonName}>No {item.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ADDONS */}
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

      {/* WEB TOAST NOTIFICATION */}
      {showToast && (
        <View style={styles.webToast}>
          <Text style={styles.webToastText}>Added to cart! </Text>
        </View>
      )}

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
            {cartItemId ? "ADD TO CART" : "ADD TO CART"} • R
            {calculateTotal().toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", marginTop: 16, marginBottom: 2 },
  brandTitle: { fontSize: 24, letterSpacing: 6, fontWeight: "300" },
  dividerGold: {
    width: 80,
    height: 2,
    backgroundColor: "#9c8966",
    marginTop: 10,
  },
  loader: { flex: 1, justifyContent: "center" },
  mainImage: { width: "100%", height: 250, marginTop:20},
  infoSection: { padding: 20 },
  categoryLabel: {
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  foodName: { fontSize: 26, fontWeight: "bold", marginVertical: 5 },
  foodDescription: { fontSize: 15, color: "#666", lineHeight: 20 },
  basePrice: { fontSize: 22, fontWeight: "700", marginTop: 10, color:"#9c8966", },
  extrasSection: { paddingHorizontal: 20, marginTop: 10 },
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
  checkboxSelected: { backgroundColor: "#000", borderColor: "#000" },
  addonImage: { width: 60, height: 60, marginHorizontal: 12 },
  addonInfo: { flex: 1 },
  addonName: { fontSize: 15, fontWeight: "500" },
  addonPrice: { fontSize: 13, color: "#666" },

  webToast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    zIndex: 999,
    elevation: 5,
  },
  webToastText: { color: "#fff", fontWeight: "600" },

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
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    paddingHorizontal: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
});