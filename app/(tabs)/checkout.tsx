// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   TouchableOpacity,
// //   Alert,
// //   ActivityIndicator,
// //   Platform,
// // } from "react-native";
// // import { useEffect, useState } from "react";
// // import { useRouter } from "expo-router";
// // import { auth, db } from "../../services/firebase";
// // import { onAuthStateChanged } from "firebase/auth";
// // import {
// //   doc,
// //   getDoc,
// //   updateDoc,
// //   collection,
// //   addDoc,
// //   serverTimestamp,
// // } from "firebase/firestore";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { Ionicons } from "@expo/vector-icons";
// // import { usePaystack } from "react-native-paystack-webview";

// // import InputField from "../components/InputField";
// // import PrimaryButton from "../components/PrimaryButton";

// // export default function CheckoutScreen() {
// //   const router = useRouter();
// //   const { popup } = usePaystack(); // Her method for triggering Paystack

// //   const [checkingAuth, setCheckingAuth] = useState(true);
// //   const [loading, setLoading] = useState(true);
// //   const [processing, setProcessing] = useState(false);

// //   const [userProfile, setUserProfile] = useState<any>(null);
// //   const [cartItems, setCartItems] = useState([]);
// //   const [total, setTotal] = useState(0);

// //   const [deliveryAddress, setDeliveryAddress] = useState("");
// //   const [isEditingAddress, setIsEditingAddress] = useState(false);

// //   const [cardDetails, setCardDetails] = useState({
// //     number: "",
// //     expiry: "",
// //     cvv: "",
// //   });
// //   const [isEditingCard, setIsEditingCard] = useState(false);

// //   useEffect(() => {
// //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// //       if (user) {
// //         loadCheckoutData(user.uid);
// //       } else {
// //         setLoading(false);
// //         setCheckingAuth(false);
// //       }
// //     });
// //     return unsubscribe;
// //   }, []);

// //   const loadCheckoutData = async (uid: string) => {
// //     try {
// //       const userDoc = await getDoc(doc(db, "users", uid));
// //       if (userDoc.exists()) {
// //         const data = userDoc.data();
// //         setUserProfile(data);
// //         setDeliveryAddress(data.address || "");
// //         setCardDetails({
// //           number: data.cardDetails?.number || "",
// //           expiry: data.cardDetails?.expiry || "",
// //           cvv: data.cardDetails?.cvv || "",
// //         });
// //       }

// //       const cartKey = `cart_${uid}`;
// //       const storedCart = await AsyncStorage.getItem(cartKey);
// //       if (storedCart) {
// //         const items = JSON.parse(storedCart);
// //         setCartItems(items);
// //         const sum = items.reduce(
// //           (acc: number, item: any) => acc + item.price * item.quantity,
// //           0,
// //         );
// //         setTotal(sum);
// //       }
// //     } catch (error) {
// //       console.error("Load Error:", error);
// //     } finally {
// //       setLoading(false);
// //       setCheckingAuth(false);
// //     }
// //   };

// //   // --- RESTRICTIONS & FORMATTING ---
// //   const handleCardNumberChange = (text: string) => {
// //     const cleaned = text.replace(/[^0-9]/g, "").slice(0, 16);
// //     setCardDetails({ ...cardDetails, number: cleaned });
// //   };

// //   const handleExpiryChange = (text: string) => {
// //     let cleaned = text.replace(/[^0-9]/g, "");
// //     if (cleaned.length >= 3) {
// //       cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
// //     }
// //     setCardDetails({ ...cardDetails, expiry: cleaned.slice(0, 5) });
// //   };

// //   const handleCvvChange = (text: string) => {
// //     const cleaned = text.replace(/[^0-9]/g, "").slice(0, 3);
// //     setCardDetails({ ...cardDetails, cvv: cleaned });
// //   };

// //   const syncWithFirebase = async () => {
// //     if (!auth.currentUser) return;
// //     try {
// //       await updateDoc(doc(db, "users", auth.currentUser.uid), {
// //         address: deliveryAddress,
// //         cardDetails: cardDetails,
// //       });
// //     } catch (e) {
// //       console.error("Update Error:", e);
// //     }
// //   };

// //   // --- THE FINAL STEP ---
// //   const finalizeOrder = async (reference: string) => {
// //     try {
// //       const orderData = {
// //         customerId: auth.currentUser?.uid,
// //         customerName: `${userProfile?.name} ${userProfile?.surname}`,
// //         items: cartItems,
// //         totalAmount: total,
// //         deliveryAddress: deliveryAddress,
// //         paymentStatus: "Paid",
// //         paymentRef: reference,
// //         orderStatus: "Processing",
// //         placedAt: serverTimestamp(),
// //       };

// //       await addDoc(collection(db, "orders"), orderData);
// //       await AsyncStorage.removeItem(`cart_${auth.currentUser?.uid}`);

// //       Alert.alert("Success", "Your order has been placed"); // Requested Message
// //       router.replace("/(tabs)/home"); // Or your home path
// //     } catch (error) {
// //       Alert.alert("Error", "Order failed to save.");
// //     } finally {
// //       setProcessing(false);
// //     }
// //   };

// //   const handlePlaceOrder = () => {
// //     if (!deliveryAddress.trim()) {
// //       Alert.alert("Incomplete", "Please add a delivery address.");
// //       return;
// //     }
// //     if (cardDetails.number.length < 16) {
// //       Alert.alert("Incomplete", "Please enter a valid 16-digit card number.");
// //       return;
// //     }

// //     setProcessing(true);

// //     // TRIGGER PAYSTACK POPUP
// //     popup.checkout({
// //       email: userProfile?.email || "customer@example.com",
// //       amount: Math.round(total * 100),
// //       onSuccess: (res: any) => {
// //         finalizeOrder(res.reference || "REF-" + Date.now());
// //       },
// //       onCancel: () => {
// //         setProcessing(false);
// //         Alert.alert("Cancelled", "Payment was cancelled");
// //       },
// //     });
// //   };

// //   if (checkingAuth || loading)
// //     return (
// //       <View style={styles.centered}>
// //         <ActivityIndicator size="large" color="#9c8966" />
// //       </View>
// //     );

// //   return (
// //     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
// //       <View style={styles.header}>
// //         <Text style={styles.brandTitle}>CHECKOUT</Text>
// //         <View style={styles.dividerGold} />
// //       </View>

// //       <View style={styles.content}>
// //         {/* ADDRESS SECTION */}
// //         <View style={styles.sectionHeaderRow}>
// //           <Text style={styles.sectionHeader}>Delivery Information</Text>
// //           <TouchableOpacity
// //             onPress={() => {
// //               if (isEditingAddress) syncWithFirebase();
// //               setIsEditingAddress(!isEditingAddress);
// //             }}
// //           >
// //             <Ionicons
// //               name={isEditingAddress ? "checkmark-circle" : "create-outline"}
// //               size={22}
// //               color="#9c8966"
// //             />
// //           </TouchableOpacity>
// //         </View>

// //         {isEditingAddress ? (
// //           <InputField
// //             label="Address"
// //             value={deliveryAddress}
// //             onChangeText={setDeliveryAddress}
// //           />
// //         ) : (
// //           <View style={styles.displayBox}>
// //             <Text style={styles.displayText}>
// //               {deliveryAddress || "Tap edit to add"}
// //             </Text>
// //           </View>
// //         )}

// //         {/* PAYMENT SECTION (YOUR ORIGINAL CODE RESTORED) */}
// //         <View style={[styles.sectionHeaderRow, { marginTop: 30 }]}>
// //           <Text style={styles.sectionHeader}>Payment Method</Text>
// //           <TouchableOpacity
// //             onPress={() => {
// //               if (isEditingCard) syncWithFirebase();
// //               setIsEditingCard(!isEditingCard);
// //             }}
// //           >
// //             <Ionicons
// //               name={isEditingCard ? "checkmark-circle" : "create-outline"}
// //               size={22}
// //               color="#9c8966"
// //             />
// //           </TouchableOpacity>
// //         </View>

// //         {isEditingCard ? (
// //           <View style={styles.editCardContainer}>
// //             <InputField
// //               label="Card Number"
// //               value={cardDetails.number}
// //               onChangeText={handleCardNumberChange}
// //               keyboardType="numeric"
// //             />
// //             <View style={{ flexDirection: "row", gap: 10 }}>
// //               <View style={{ flex: 1 }}>
// //                 <InputField
// //                   label="Expiry"
// //                   value={cardDetails.expiry}
// //                   onChangeText={handleExpiryChange}
// //                   keyboardType="numeric"
// //                   placeholder="MM/YY"
// //                 />
// //               </View>
// //               <View style={{ flex: 1 }}>
// //                 <InputField
// //                   label="CVV"
// //                   value={cardDetails.cvv}
// //                   onChangeText={handleCvvChange}
// //                   keyboardType="numeric"
// //                 />
// //               </View>
// //             </View>
// //           </View>
// //         ) : (
// //           <View style={styles.cardBox}>
// //             <Ionicons name="card" size={24} color="#9c8966" />
// //             <View style={styles.cardDetails}>
// //               <Text style={styles.cardLabel}>Card</Text>
// //               <Text style={styles.cardValue}>
// //                 {cardDetails.number
// //                   ? `•••• ${cardDetails.number.slice(-4)}`
// //                   : "No card"}
// //               </Text>
// //             </View>
// //           </View>
// //         )}

// //         {/* SUMMARY */}
// //         <View style={styles.summaryBox}>
// //           {cartItems.map((item: any, i) => (
// //             <View key={i} style={styles.itemRow}>
// //               <Text style={styles.itemText}>
// //                 {item.quantity}x {item.name}
// //               </Text>
// //               <Text style={styles.itemPrice}>
// //                 R {(item.price * item.quantity).toFixed(2)}
// //               </Text>
// //             </View>
// //           ))}
// //           <View style={styles.totalRow}>
// //             <Text style={styles.totalLabel}>Total</Text>
// //             <Text style={styles.totalValue}>R {total.toFixed(2)}</Text>
// //           </View>
// //         </View>

// //         <View style={styles.buttonContainer}>
// //           <PrimaryButton
// //             title={processing ? "PROCESSING..." : "PLACE ORDER"}
// //             onPress={handlePlaceOrder}
// //             loading={processing}
// //           />
// //         </View>
// //       </View>
// //     </ScrollView>
// //   );
// // }
// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#fff" },

// //   centered: {
// //     flex: 1,

// //     justifyContent: "center",

// //     alignItems: "center",

// //     padding: 40,
// //   },

// //   header: { alignItems: "center", marginTop: 60, marginBottom: 20 },

// //   brandTitle: {
// //     fontSize: 24,

// //     letterSpacing: 6,

// //     fontWeight: "300",

// //     color: "#000",
// //   },

// //   dividerGold: {
// //     width: 40,

// //     height: 2,

// //     backgroundColor: "#9c8966",

// //     marginTop: 10,
// //   },

// //   content: { padding: 25 },

// //   sectionHeaderRow: {
// //     flexDirection: "row",

// //     justifyContent: "space-between",

// //     alignItems: "center",

// //     marginBottom: 15,
// //   },

// //   sectionHeader: {
// //     fontSize: 12,

// //     fontWeight: "800",

// //     letterSpacing: 1.5,

// //     textTransform: "uppercase",

// //     color: "#444",
// //   },

// //   displayBox: {
// //     padding: 15,

// //     backgroundColor: "#f9f9f9",

// //     borderRadius: 4,

// //     marginBottom: 10,
// //   },

// //   displayText: { fontSize: 14, color: "#333" },

// //   cardBox: {
// //     flexDirection: "row",

// //     alignItems: "center",

// //     padding: 20,

// //     backgroundColor: "#fcfcfc",

// //     borderWidth: 1,

// //     borderColor: "#f0f0f0",

// //     borderRadius: 4,
// //   },

// //   editCardContainer: {
// //     padding: 10,

// //     backgroundColor: "#fff",

// //     borderWidth: 1,

// //     borderColor: "#eee",

// //     borderRadius: 4,
// //   },

// //   cardDetails: { flex: 1, marginLeft: 15 },

// //   cardLabel: {
// //     fontSize: 10,

// //     color: "#888",

// //     fontWeight: "600",

// //     textTransform: "uppercase",
// //   },

// //   cardValue: { fontSize: 14, fontWeight: "600", color: "#222" },

// //   summaryBox: {
// //     padding: 20,

// //     backgroundColor: "#fff",

// //     borderTopWidth: 1,

// //     borderBottomWidth: 1,

// //     borderColor: "#f0f0f0",

// //     marginTop: 20,
// //   },

// //   itemRow: {
// //     flexDirection: "row",

// //     justifyContent: "space-between",

// //     marginBottom: 10,
// //   },

// //   itemText: { fontSize: 14, color: "#555" },

// //   itemPrice: { fontSize: 14, fontWeight: "500", color: "#000" },

// //   totalRow: {
// //     flexDirection: "row",

// //     justifyContent: "space-between",

// //     alignItems: "center",

// //     marginTop: 15,
// //   },

// //   totalLabel: { fontSize: 16, fontWeight: "700" },

// //   totalValue: { fontSize: 22, fontWeight: "300", color: "#9c8966" },

// //   buttonContainer: { marginTop: 40, marginBottom: 20 },
// // });

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { auth, db } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import InputField from "../components/InputField";
import Checkout from "../components/checkout"; // <--- Import the component above

export default function CheckoutScreen() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const [isEditingCard, setIsEditingCard] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadCheckoutData(user.uid);
      } else {
        setLoading(false);
        setCheckingAuth(false);
      }
    });
    return unsubscribe;
  }, []);

  const loadCheckoutData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        setDeliveryAddress(data.address || "");
        setCardDetails(data.cardDetails || { number: "", expiry: "", cvv: "" });
      }
      const storedCart = await AsyncStorage.getItem(`cart_${uid}`);
      if (storedCart) {
        const items = JSON.parse(storedCart);
        setCartItems(items);
        setTotal(
          items.reduce((acc: number, i: any) => acc + i.price * i.quantity, 0),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  const finalizeOrder = async (reference: string) => {
    const orderData = {
      customerId: auth.currentUser?.uid,
      customerName: `${userProfile?.name} ${userProfile?.surname}`,
      items: cartItems,
      totalAmount: total, // Saves as Rands (e.g., 116)
      deliveryAddress,
      paymentStatus: "Paid",
      paymentRef: reference,
      orderStatus: "Processing",
      placedAt: serverTimestamp(),
    };

    await addDoc(collection(db, "orders"), orderData);
    await AsyncStorage.removeItem(`cart_${auth.currentUser?.uid}`);

    Alert.alert("Success", "Successfully paid", [
      { text: "OK", onPress: () => router.replace("/(tabs)/home") },
    ]);
  };

  const syncWithFirebase = async () => {
    if (!auth.currentUser) return;
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      address: deliveryAddress,
      cardDetails: cardDetails,
    });
  };

  if (checkingAuth || loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9c8966" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>CHECKOUT</Text>
        <View style={styles.dividerGold} />
      </View>

      <View style={styles.content}>
        {/* Address Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Delivery Information</Text>
          <TouchableOpacity
            onPress={() => {
              if (isEditingAddress) syncWithFirebase();
              setIsEditingAddress(!isEditingAddress);
            }}
          >
            <Ionicons
              name={isEditingAddress ? "checkmark-circle" : "create-outline"}
              size={22}
              color="#9c8966"
            />
          </TouchableOpacity>
        </View>
        {isEditingAddress ? (
          <InputField
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            label="Address"
          />
        ) : (
          <View style={styles.displayBox}>
            <Text>{deliveryAddress || "Tap edit to add"}</Text>
          </View>
        )}

        {/* Payment Card UI (Restored as requested) */}
        <View style={[styles.sectionHeaderRow, { marginTop: 30 }]}>
          <Text style={styles.sectionHeader}>Payment Method</Text>
          <TouchableOpacity
            onPress={() => {
              if (isEditingCard) syncWithFirebase();
              setIsEditingCard(!isEditingCard);
            }}
          >
            <Ionicons
              name={isEditingCard ? "checkmark-circle" : "create-outline"}
              size={22}
              color="#9c8966"
            />
          </TouchableOpacity>
        </View>
        {isEditingCard ? (
          <View style={styles.editCardContainer}>
            <InputField
              label="Card Number"
              value={cardDetails.number}
              onChangeText={(t) =>
                setCardDetails({
                  ...cardDetails,
                  number: t.replace(/[^0-9]/g, "").slice(0, 16),
                })
              }
              keyboardType="numeric"
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Expiry"
                  value={cardDetails.expiry}
                  onChangeText={(t) =>
                    setCardDetails({ ...cardDetails, expiry: t })
                  }
                  keyboardType="numeric"
                  placeholder="MM/YY"
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="CVV"
                  value={cardDetails.cvv}
                  onChangeText={(t) =>
                    setCardDetails({ ...cardDetails, cvv: t.slice(0, 3) })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.cardBox}>
            <Ionicons name="card" size={24} color="#9c8966" />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.cardValue}>
                {cardDetails.number
                  ? `•••• ${cardDetails.number.slice(-4)}`
                  : "No card"}
              </Text>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryBox}>
          {cartItems.map((item: any, i) => (
            <View key={i} style={styles.itemRow}>
              <Text>
                {item.quantity}x {item.name}
              </Text>
              <Text>R {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R {total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {/* THE PAYSTACK BUTTON COMPONENT */}
          <Checkout
            email={userProfile.email}
            totalAmount={total}
            onSuccess={finalizeOrder}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", marginTop: 16, marginBottom: 2 },
  brandTitle: { fontSize: 24, letterSpacing: 6, fontWeight: "300" },
  dividerGold: {
    width: 40,
    height: 2,
    backgroundColor: "#9c8966",
    marginTop: 10,
  },
  content: { padding: 25 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    color: "#444",
  },
  displayBox: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginBottom: 10,
  },
  cardBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fcfcfc",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 4,
  },
  editCardContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
  },
  cardValue: { fontSize: 14, fontWeight: "600" },
  summaryBox: {
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    marginTop: 20,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 22, fontWeight: "300", color: "#9c8966" },
  buttonContainer: { marginTop: 40, marginBottom: 20 },
});
