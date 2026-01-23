import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function TabsLayout() {
const [cartCount, setCartCount] = useState(0);

const loadCartCount = async () => {
  const cart = await AsyncStorage.getItem("cart");
  if (cart) {
    const items = JSON.parse(cart);
    const total = items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    );
    setCartCount(total);
  } else {
    setCartCount(0);
  }
};

useEffect(() => {
  const interval = setInterval(loadCartCount, 500);
  return () => clearInterval(interval);
}, []);



  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="food-details"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
