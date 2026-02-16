import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from "./context/cartContext";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootSiblingParent } from "react-native-root-siblings";
// ADD THIS IMPORT
import { PaystackProvider } from "react-native-paystack-webview";

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await AsyncStorage.removeItem("cart");
        const isProtectedArea =
          segments[0] === "admin" || segments[0] === "checkout";
        if (isProtectedArea) {
          router.replace("/");
        }
      }
    });
    return unsubscribe;
  }, [segments]);

  return (
    <RootSiblingParent>
      {/* WRAP EVERYTHING IN THE PAYSTACK PROVIDER */}
      <PaystackProvider publicKey="pk_test_c0ea551fdff3be438351f76cab4881c2440a3bc1">
        <CartProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="food/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
            <Stack.Screen name="admin" />
          </Stack>
        </CartProvider>
      </PaystackProvider>
    </RootSiblingParent>
  );
}

// app/_layout.tsx
// import { Stack, useRouter, useSegments } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { CartProvider } from "./context/cartContext";
// import { useEffect } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../services/firebase";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { RootSiblingParent } from "react-native-root-siblings";

// export default function RootLayout() {
//   const segments = useSegments();
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         // USER LOGGED OUT: Clear cart
//         await AsyncStorage.removeItem("cart");

//         // --- FIXED LOGIC BELOW ---
//         // Only redirect to "/" if they are trying to access a PROTECTED area.
//         // We want them to stay in "(tabs)" if they are just browsing.

//         const isProtectedArea = segments[0] === "admin" || segments[0] === "checkout";

//         if (isProtectedArea) {
//           router.replace("/");
//         }
//         // --- END OF FIX ---
//       }
//     });

//     return unsubscribe;
//   }, [segments]);

//   return (
//     <RootSiblingParent>
//       <CartProvider>
//         <StatusBar style="dark" />
//         <Stack screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="index" />
//           <Stack.Screen name="(auth)" />
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//           <Stack.Screen name="food/[id]" options={{ headerShown: false }} />
//           <Stack.Screen name="checkout" options={{ headerShown: false }} />
//           <Stack.Screen name="admin" />
//         </Stack>
//       </CartProvider>
//     </RootSiblingParent>
//   );

// }
