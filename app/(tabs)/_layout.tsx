// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useEffect, useState } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useIsFocused } from "@react-navigation/native";

// export default function TabsLayout() {
//   const [cartCount, setCartCount] = useState(0);
//   const isFocused = useIsFocused(); // Hook to tell if user is looking at the tabs

//   const loadCartCount = async () => {
//     try {
//       const cart = await AsyncStorage.getItem("cart");
//       if (cart) {
//         const items = JSON.parse(cart);
//         const total = items.reduce(
//           (sum: number, item: any) => sum + item.quantity,
//           0,
//         );
//         setCartCount(total);
//       } else {
//         setCartCount(0);
//       }
//     } catch (e) {
//       setCartCount(0);
//     }
//   };

//   // REFRESH COUNT EVERY TIME THE USER OPENS THE TABS OR SWITCHES TABS
//   useEffect(() => {
//     if (isFocused) {
//       loadCartCount();
//     }
//   }, [isFocused]);

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: true,
//         tabBarActiveTintColor: "#000", // Makes it look fancier
//         tabBarInactiveTintColor: "#888",
//       }}
//     >
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: "",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="restaurant-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="cart"
//         options={{
//           title: "",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="cart-outline" size={size} color={color} />
//           ),
//           tabBarBadge: cartCount > 0 ? cartCount : undefined,
//           tabBarBadgeStyle: { backgroundColor: "#000" }, // Fancy black badge
//         }}
//       />
//       <Tabs.Screen
//         name="profileScreen"
//         options={{
//           title: "",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="person-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       {/* Hidden Screens */}
//       <Tabs.Screen name="food-details" options={{ href: null }} />
//       <Tabs.Screen name="checkout" options={{ href: null }} />
//     </Tabs>
//   );
// }

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

  // Listen for Auth State to show/hide Profile tab
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // !!user converts the user object to a boolean (true if exists, false if null)
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  const loadCartCount = async () => {
    try {
      const cart = await AsyncStorage.getItem("cart");
      if (cart) {
        const items = JSON.parse(cart);
        const total = items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        );
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadCartCount();
    }
  }, [isFocused]);

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
          tabBarBadgeStyle: { backgroundColor: "#000" },
        }}
      />

      {/* FIXED LOGIC: href is null when logged out, effectively hiding the tab button */}
      <Tabs.Screen
        name="profileScreen"
        options={{
          title: "Profile",
          href: isLoggedIn ? "/profileScreen" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden screens from the Tab Bar */}
      <Tabs.Screen name="food-details" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
    </Tabs>
  );
}