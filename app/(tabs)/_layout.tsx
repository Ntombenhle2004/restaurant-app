import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function TabsLayout() {
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      loadCartCount(); 
    });
    return unsubscribe;
  }, []);

  const loadCartCount = async () => {
    try {
      const user = auth.currentUser;
      const cartKey = user ? `cart_${user.uid}` : "cart_guest";

      const cart = await AsyncStorage.getItem(cartKey);

      if (cart) {
        const items = JSON.parse(cart);
        const total = items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0,
        );
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch (e) {
      console.error("Error loading cart count:", e);
      setCartCount(0);
    }
  };

  useEffect(() => {

    loadCartCount();
    const interval = setInterval(() => {
      loadCartCount();
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: { borderTopWidth: 0, elevation: 0, shadowOpacity: 0 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "#000", color: "#fff" },
        }}
      />

      <Tabs.Screen
        name="profileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="food-details" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
    </Tabs>
  );
}