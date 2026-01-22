import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cart]);

  const loadCart = async () => {
    const storedCart = await AsyncStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  };

  const saveCart = async (items: CartItem[]) => {
    setCart(items);
    await AsyncStorage.setItem("cart", JSON.stringify(items));
  };

  const calculateTotal = () => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  const increaseQty = (id: string) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updated);
  };

  const decreaseQty = (id: string) => {
    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
        : item
    );
    saveCart(updated);
  };

  const removeItem = (id: string) => {
    Alert.alert("Confirm", "Remove this item from cart?", [
      { text: "Cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const updated = cart.filter((item) => item.id !== id);
          saveCart(updated);
        },
      },
    ]);
  };

  const clearCart = () => {
    Alert.alert("Confirm", "Clear all items from cart?", [
      { text: "Cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setCart([]);
          await AsyncStorage.removeItem("cart");
        },
      },
    ]);
  };

  const goToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Cart Empty", "Please add items to cart before checkout.");
      return;
    }
    router.push("/(user)/checkout");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      {cart.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>R {item.price}</Text>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity onPress={() => decreaseQty(item.id)}>
                      <Icon name="minus" type="feather" />
                    </TouchableOpacity>
                    <Text style={styles.qty}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => increaseQty(item.id)}>
                      <Icon name="plus" type="feather" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Icon name="trash" type="feather" color="red" />
                </TouchableOpacity>
              </View>
            )}
          />

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: R {total}</Text>
          </View>

          <Button
            title="Clear Cart"
            buttonStyle={[styles.button, { backgroundColor: "red" }]}
            onPress={clearCart}
          />
          <Button
            title="Go to Checkout"
            buttonStyle={styles.button}
            onPress={goToCheckout}
          />
        </>
      )}
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
  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  price: {
    fontSize: 14,
    color: "#555",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  qty: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  totalContainer: {
    marginVertical: 16,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    marginVertical: 6,
    backgroundColor: "#000",
    borderRadius: 6,
    paddingVertical: 12,
  },
});
