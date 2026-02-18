// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useEffect, useState } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useIsFocused } from "@react-navigation/native";
// import { auth } from "../../services/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { Text } from "react-native";

// const GOLD_COLOR = "#D4AF37";

// const Title = () => (
//   <Text
//     style={{
//       fontSize: 18,
//       fontWeight: "700",
//       letterSpacing: 3,
//       color: GOLD_COLOR,
//     }}
//   >
//     AMBROSIA
//   </Text>
// );

// export default function TabsLayout() {
//   const [cartCount, setCartCount] = useState(0);
//   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
//   const isFocused = useIsFocused();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setIsLoggedIn(!!user);
//       loadCartCount();
//     });
//     return unsubscribe;
//   }, []);

//   const loadCartCount = async () => {
//     try {
//       const user = auth.currentUser;
//       const cartKey = user ? `cart_${user.uid}` : "cart_guest";

//       const cart = await AsyncStorage.getItem(cartKey);

//       if (cart) {
//         const items = JSON.parse(cart);
//         const total = items.reduce(
//           (sum: number, item: any) => sum + (item.quantity || 0),
//           0,
//         );
//         setCartCount(total);
//       } else {
//         setCartCount(0);
//       }
//     } catch (e) {
//       console.error("Error loading cart count:", e);
//       setCartCount(0);
//     }
//   };

//   useEffect(() => {
//     loadCartCount();
//     const interval = setInterval(() => {
//       loadCartCount();
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [isLoggedIn, isFocused]);

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: true,
//         headerTitle: () => <Title />,

//         headerStyle: {
//           backgroundColor: "#000",
//         },
//         headerTintColor: GOLD_COLOR,
//         headerLeft: () => null, // ✅ remove back arrow

//         tabBarActiveTintColor: GOLD_COLOR,
//         tabBarInactiveTintColor: "#888",
//         tabBarStyle: {
//           borderTopWidth: 0,
//           elevation: 0,
//           shadowOpacity: 0,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: "Menu",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="restaurant-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="cart"
//         options={{
//           title: "Cart",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="cart-outline" size={size} color={color} />
//           ),
//           tabBarBadge: cartCount > 0 ? cartCount : undefined,
//           tabBarBadgeStyle: {
//             backgroundColor: GOLD_COLOR,
//             color: "#000",
//           },
//         }}
//       />

//       <Tabs.Screen
//         name="profileScreen"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="person-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       {/* Hidden routes */}
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
import { Text } from "react-native";

const GOLD_COLOR = "#D4AF37";

const Title = () => (
  <Text
    style={{
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 3,
      color: GOLD_COLOR,
    }}
  >
    AMBROSIA
  </Text>
);

export default function TabsLayout() {
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
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
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
    const interval = setInterval(loadCartCount, 2000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isFocused]);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: () => <Title />,
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: GOLD_COLOR,
        headerLeft: () => null,
        tabBarActiveTintColor: GOLD_COLOR,
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
          tabBarBadgeStyle: { backgroundColor: GOLD_COLOR, color: "#000" },
        }}
      />

      <Tabs.Screen
        name="profileScreen"
        options={{
          href: isLoggedIn ? "/profileScreen" : null, // ✅ Hides icon when logged out
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