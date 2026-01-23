import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon, Button } from "react-native-elements";
import { useRouter, useFocusEffect } from "expo-router";

type CartItem = {
  id: string;
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  total?: number;
};

const APP_COLOR = "#000";

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    const storedCart = await AsyncStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else {
      setCartItems([]);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    setCartItems(items);
    await AsyncStorage.setItem("cart", JSON.stringify(items));
  };

  const increaseQty = (id: string) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updated);
  };

  const decreaseQty = (id: string) => {
    const updated = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
  };

const confirmDelete = (id: string) => {
  Alert.alert(
    "Remove item",
    "Are you sure you want to remove this item from your cart?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeItem(id),
      },
    ]
  );
};


const getTotal = () =>
  cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="shopping-cart" type="feather" size={50} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/food-details",
                params: { id: item.foodId },
              })
            }
          >
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.price}>
                R {item.total ? item.total : item.price * item.quantity}
              </Text>

              <View style={styles.rowBetween}>
                <View style={styles.qtyRow}>
                  <TouchableOpacity onPress={() => decreaseQty(item.id)}>
                    <Icon name="minus-circle" type="feather" />
                  </TouchableOpacity>

                  <Text style={styles.qty}>{item.quantity}</Text>

                  <TouchableOpacity onPress={() => increaseQty(item.id)}>
                    <Icon name="plus-circle" type="feather" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                  <Icon name="trash-2" type="feather" color="red" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: R {getTotal()}</Text>
        <Button
          title="Checkout"
          buttonStyle={styles.checkout}
          onPress={() => router.push("/checkout")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  item: {
    flexDirection: "row",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  price: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  qty: {
    marginHorizontal: 10,
    fontSize: 16,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  checkout: {
    backgroundColor: APP_COLOR,
    borderRadius: 8,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    marginTop: 12,
    color: "#888",
  },
});












