import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { Button } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { db } from "../../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { auth } from "../../services/firebase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [address, setAddress] = useState("");
  const [card, setCard] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
    loadCart();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cart]);

  const loadUserData = () => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      // Ideally you fetch user profile from Firestore
      // Here we try to load from AsyncStorage for demo
      AsyncStorage.getItem(`userProfile-${user.uid}`).then((res) => {
        if (res) {
          const profile = JSON.parse(res);
          setAddress(profile.address || "");
          setCard(profile.card || "");
        }
      });
    }
  };

  const loadCart = async () => {
    const storedCart = await AsyncStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  };

  const calculateTotal = () => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  const placeOrder = async () => {
    if (!userId) {
      Alert.alert("Error", "Please login to place an order");
      return;
    }
    if (!address || !card) {
      Alert.alert("Error", "Address and card are required");
      return;
    }
    if (cart.length === 0) {
      Alert.alert("Cart Empty", "Add items to cart before placing order");
      return;
    }

    try {
      await addDoc(collection(db, "orders"), {
        userId,
        items: cart,
        total,
        address,
        card,
        status: "pending",
        createdAt: new Date(),
      });

      Alert.alert("Success", "Order placed successfully!");
      await AsyncStorage.removeItem("cart");
      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.cartName}>{item.name}</Text>
            <Text style={styles.cartQty}>
              {item.quantity} x R {item.price}
            </Text>
          </View>
        )}
      />

      <Text style={styles.totalText}>Total: R {total}</Text>

      <Text style={styles.label}>Drop-off Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter your address"
      />

      <Text style={styles.label}>Card Details</Text>
      <TextInput
        style={styles.input}
        value={card}
        onChangeText={setCard}
        placeholder="Enter your card number"
        keyboardType="numeric"
      />

      <Button
        title="Place Order"
        buttonStyle={styles.button}
        onPress={placeOrder}
      />
    </ScrollView>
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
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  cartName: {
    fontSize: 16,
  },
  cartQty: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#000",
    borderRadius: 6,
    paddingVertical: 12,
  },
});
