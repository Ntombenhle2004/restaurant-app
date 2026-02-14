import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useEffect, useState, useRef } from "react";
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

// --- PAYSTACK IMPORT ---
let Paystack: any = null;
if (Platform.OS !== "web") {
  try {
    // @ts-ignore
    Paystack = require("react-native-paystack-webview").default;
  } catch (e) {
    console.log("Paystack module not available");
  }
}

import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";

export default function CheckoutScreen() {
  const router = useRouter();
  const paystackWebViewRef = useRef<any>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
        setIsLoggedIn(true);
        loadCheckoutData(user.uid);
      } else {
        setIsLoggedIn(false);
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
        setCardDetails({
          number: data.cardDetails?.number || "",
          expiry: data.cardDetails?.expiry || "",
          cvv: data.cardDetails?.cvv || "",
        });
      }

      const cartKey = `cart_${uid}`;
      const storedCart = await AsyncStorage.getItem(cartKey);
      if (storedCart) {
        const items = JSON.parse(storedCart);
        setCartItems(items);
        const sum = items.reduce(
          (acc: number, item: any) => acc + item.price * item.quantity,
          0,
        );
        setTotal(sum);
      }
    } catch (error) {
      console.error("Load Error:", error);
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  // --- FORMATTING LOGIC ---
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 16);
    setCardDetails({ ...cardDetails, number: cleaned });
  };

  const handleExpiryChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length >= 3) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    setCardDetails({ ...cardDetails, expiry: cleaned.slice(0, 5) });
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 3);
    setCardDetails({ ...cardDetails, cvv: cleaned });
  };

  // --- FIREBASE SYNC ON EDIT ---
  const syncWithFirebase = async () => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        address: deliveryAddress,
        cardDetails: cardDetails,
      });
      console.log("Database Updated");
    } catch (e) {
      console.error("Update Error:", e);
    }
  };

  const finalizeOrder = async (reference: string) => {
    try {
      const orderData = {
        customerId: auth.currentUser?.uid,
        customerName: `${userProfile?.name} ${userProfile?.surname}`,
        items: cartItems,
        totalAmount: total,
        deliveryAddress: deliveryAddress,
        paymentStatus: "Paid",
        paymentRef: reference,
        orderStatus: "Processing",
        placedAt: serverTimestamp(),
        paymentMethod: `Card ending in ${cardDetails.number.slice(-4) || "XXXX"}`,
      };

      await addDoc(collection(db, "orders"), orderData);
      await AsyncStorage.removeItem(`cart_${auth.currentUser?.uid}`);

      Alert.alert("Success", "Your feast is being prepared!", [
        { text: "View Home", onPress: () => router.replace("/home") },
      ]);
    } catch (error) {
      console.error("Order Error:", error);
      Alert.alert("Error", "Order failed to save.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!deliveryAddress || deliveryAddress.trim() === "") {
      Alert.alert("Incomplete", "Please add a delivery address.");
      return;
    }

    if (cardDetails.number.length < 16) {
      Alert.alert("Incomplete", "Please enter a valid 16-digit card number.");
      return;
    }

    setProcessing(true);

    if (Platform.OS === "web") {
      // Web fallback - simulate payment
      setTimeout(() => finalizeOrder("WEB-" + Date.now()), 1500);
    } else {
      // Trigger Paystack on mobile
      if (paystackWebViewRef.current) {
        paystackWebViewRef.current.startTransaction();
      } else {
        Alert.alert("Error", "Payment system not initialized");
        setProcessing(false);
      }
    }
  };

  if (checkingAuth || loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9c8966" />
      </View>
    );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>CHECKOUT</Text>
        <View style={styles.dividerGold} />
      </View>

      <View style={styles.content}>
        {/* --- DELIVERY ADDRESS --- */}
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
            label="Address"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
          />
        ) : (
          <View style={styles.displayBox}>
            <Text style={styles.displayText}>
              {deliveryAddress || "Tap edit to add"}
            </Text>
          </View>
        )}

        {/* --- PAYMENT --- */}
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
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Expiry"
                  value={cardDetails.expiry}
                  onChangeText={handleExpiryChange}
                  keyboardType="numeric"
                  placeholder="MM/YY"
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="CVV"
                  value={cardDetails.cvv}
                  onChangeText={handleCvvChange}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.cardBox}>
            <Ionicons name="card" size={24} color="#9c8966" />
            <View style={styles.cardDetails}>
              <Text style={styles.cardLabel}>Card</Text>
              <Text style={styles.cardValue}>
                {cardDetails.number
                  ? `•••• ${cardDetails.number.slice(-4)}`
                  : "No card"}
              </Text>
            </View>
          </View>
        )}

        {/* --- SUMMARY --- */}
        <View style={styles.summaryBox}>
          {cartItems.map((item: any, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemText}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                R {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* --- PAYSTACK WEBVIEW (Hidden but active) --- */}
        {Platform.OS !== "web" && Paystack && (
          <View style={{ height: 0, overflow: "hidden" }}>
            <Paystack
              paystackKey="pk_test_c0ea551fdff3be438351f76cab4881c2440a3bc1"
              amount={String(Math.round(total * 100))}
              billingEmail={userProfile?.email || "guest@example.com"}
              billingName={
                `${userProfile?.name || ""} ${userProfile?.surname || ""}`.trim() ||
                "Guest"
              }
              currency="ZAR"
              onCancel={(e: any) => {
                console.log("Payment cancelled", e);
                setProcessing(false);
                Alert.alert("Cancelled", "Payment was cancelled");
              }}
              onSuccess={(res: any) => {
                console.log("Payment success", res);
                const reference =
                  res.transactionRef?.reference ||
                  res.reference ||
                  "PAY-" + Date.now();
                finalizeOrder(reference);
              }}
              ref={paystackWebViewRef}
              autoStart={false}
            />
          </View>
        )}

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={processing ? "PROCESSING..." : "PLACE ORDER"}
            onPress={handlePlaceOrder}
            loading={processing}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  header: { alignItems: "center", marginTop: 60, marginBottom: 20 },
  brandTitle: {
    fontSize: 24,
    letterSpacing: 6,
    fontWeight: "300",
    color: "#000",
  },
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
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#444",
  },
  displayBox: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginBottom: 10,
  },
  displayText: { fontSize: 14, color: "#333" },
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
  cardDetails: { flex: 1, marginLeft: 15 },
  cardLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardValue: { fontSize: 14, fontWeight: "600", color: "#222" },
  summaryBox: {
    padding: 20,
    backgroundColor: "#fff",
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
  itemText: { fontSize: 14, color: "#555" },
  itemPrice: { fontSize: 14, fontWeight: "500", color: "#000" },
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
