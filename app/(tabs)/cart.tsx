import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon } from "react-native-elements";
import { useRouter, useFocusEffect } from "expo-router";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

type CartItem = {
  id: string;
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedAddons?: any[];
  excludedItems?: string[];
};

const APP_COLOR = "#000";
const GOLD_COLOR = "#9c8966";

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true); // Track if Firebase check is done

  // 1. Monitor Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadCart(user.uid);
      } else {
        setUserId(null);
        loadCart(null); // Load guest cart
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  // 2. Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // We check auth.currentUser directly to be sure
      const currentUid = auth.currentUser?.uid || null;
      loadCart(currentUid);
    }, []),
  );

  const loadCart = async (uid: string | null) => {
    try {
      // Use user key if logged in, otherwise use guest key
      const cartKey = uid ? `cart_${uid}` : "cart_guest";
      const storedCart = await AsyncStorage.getItem(cartKey);
      setCartItems(storedCart ? JSON.parse(storedCart) : []);
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    setCartItems(items);
    const cartKey = userId ? `cart_${userId}` : "cart_guest";
    await AsyncStorage.setItem(cartKey, JSON.stringify(items));
  };

  // --- Cart Actions ---
  const increaseQty = (id: string) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
    );
    saveCart(updated);
  };

  const decreaseQty = (id: string) => {
    const updated = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity - 1) }
        : item,
    );
    saveCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const clearCart = () => {
    const action = () => saveCart([]);
    if (Platform.OS === "web") {
      if (confirm("Clear your entire cart?")) action();
    } else {
      Alert.alert("Clear Feast", "Empty your entire cart?", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: action },
      ]);
    }
  };

  const confirmDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (confirm("Remove this item?")) removeItem(id);
    } else {
      Alert.alert("Remove item", "Remove this from your cart?", [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeItem(id) },
      ]);
    }
  };

  const getTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // --- Render ---

  // Stop showing the loader once we know if the user is a Guest or Logged In
  if (initializing) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="shopping-bag" type="feather" size={60} color="#eee" />
        <Text style={styles.emptyText}>YOUR TABLE IS EMPTY</Text>
        <TouchableOpacity
          style={styles.startShopping}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.startText}>SELECT A FEAST</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CART</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>CLEAR ALL</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                  <Icon name="x" type="feather" size={18} color="#999" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/food-details",
                    params: { id: item.foodId, cartItemId: item.id },
                  })
                }
              >
                <Text style={styles.editLink}>Edit Preferences</Text>
              </TouchableOpacity>

              <View style={styles.bottomRow}>
                <Text style={styles.price}>R {item.price.toFixed(2)}</Text>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    onPress={() => decreaseQty(item.id)}
                    style={styles.qtyBtn}
                  >
                    <Icon name="minus" type="feather" size={14} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => increaseQty(item.id)}
                    style={styles.qtyBtn}
                  >
                    <Icon name="plus" type="feather" size={14} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.totalValue}>R {getTotal()}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => {
            // Force login before checkout
            if (!userId) {
              Alert.alert(
                "Login Required",
                "Please login to proceed with your order.",
              );
              router.push("/profileScreen");
            } else {
              router.push("/checkout");
            }
          }}
        >
          <Text style={styles.checkoutText}>PROCEED TO CHECKOUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginTop: 10,
  },
  headerTitle: { fontSize: 14, fontWeight: "700", letterSpacing: 2 },
  clearText: {
    fontSize: 10,
    color: "#ff4444",
    fontWeight: "700",
    letterSpacing: 1,
  },
  itemCard: {
    flexDirection: "row",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: "#fcfcfc",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  image: { width: 90, height: 90, resizeMode: "cover" },
  info: { flex: 1, marginLeft: 15, justifyContent: "space-between" },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    flex: 1,
  },
  editLink: {
    fontSize: 11,
    color: GOLD_COLOR,
    textDecorationLine: "underline",
    marginVertical: 5,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { fontSize: 15, fontWeight: "700", color: "#000" },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  qtyBtn: { padding: 8 },
  qtyText: { paddingHorizontal: 10, fontSize: 13, fontWeight: "700" },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  totalLabel: { fontSize: 12, color: "#888", letterSpacing: 1 },
  totalValue: { fontSize: 18, fontWeight: "700", color: GOLD_COLOR },
  checkoutBtn: {
    backgroundColor: APP_COLOR,
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 2,
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 2,
    fontSize: 12,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: { marginTop: 20, fontSize: 12, letterSpacing: 3, color: "#999" },
  startShopping: { marginTop: 20, paddingBottom: 5, borderBottomWidth: 1 },
  startText: { fontSize: 12, fontWeight: "700", letterSpacing: 1 },
});