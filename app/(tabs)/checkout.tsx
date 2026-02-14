import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useRouter } from "expo-router";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const APP_COLOR = "#000";

export default function Checkout() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [selectedCard, setSelectedCard] = useState("**** 1234");

  useEffect(() => {
    loadCart();
    loadUserProfile();
  }, []);

  const loadCart = async () => {
    const stored = await AsyncStorage.getItem("cart");
    if (stored) setCartItems(JSON.parse(stored));
  };

  const loadUserProfile = async () => {
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      setAddress(snap.data().address || "");
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (!user) {
      Alert.alert("Login required", "Please log in to place an order");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Missing address", "Please enter a drop-off address");
      return;
    }

    Alert.alert("Confirm Order", `Total: R ${total}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Place Order",
        onPress: async () => {
          await addDoc(collection(db, "orders"), {
            userId: user.uid,
            items: cartItems,
            total,
            address,
            cardUsed: selectedCard,
            status: "paid",
            currency: "ZAR",
            createdAt: serverTimestamp(),
          });

          await AsyncStorage.removeItem("cart");

          Alert.alert("Success", "Order placed successfully", [
            { text: "OK", onPress: () => router.replace("/") },
          ]);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      {/* ADDRESS */}
      <Text style={styles.label}>Drop-off Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter delivery address"
        multiline
      />

      {/* CART ITEMS */}
      <Text style={styles.label}>Order Summary</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>
              {item.name} x{item.quantity}
            </Text>
            <Text>R {item.price * item.quantity}</Text>
          </View>
        )}
      />

      {/* CARD */}
      <Text style={styles.label}>Payment Method</Text>
      <TouchableOpacity
        style={styles.cardBox}
        onPress={() =>
          setSelectedCard(
            selectedCard === "**** 1234" ? "**** 9876" : "**** 1234"
          )
        }
      >
        <Text>Card: {selectedCard}</Text>
        <Text style={styles.change}>Change</Text>
      </TouchableOpacity>

      {/* TOTAL */}
      <Text style={styles.total}>Total: R {total}</Text>

      {/* PLACE ORDER */}
      <TouchableOpacity style={styles.button} onPress={placeOrder}>
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  name: {
    fontSize: 15,
  },
  cardBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  change: {
    color: APP_COLOR,
    fontWeight: "600",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
  },
  button: {
    backgroundColor: APP_COLOR,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
