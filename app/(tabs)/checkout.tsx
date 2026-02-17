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
  totalValue: { fontSize: 22, fontWeight: "700", color: "#D4AF37" },
  buttonContainer: { marginTop: 40, marginBottom: 20 },
});
