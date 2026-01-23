// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Alert,
//   TextInput,
//   ScrollView,
// } from "react-native";
// import { Button } from "react-native-elements";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import { db } from "../../services/firebase";
// import { collection, addDoc } from "firebase/firestore";
// import { auth } from "../../services/firebase";

// type CartItem = {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
// };

// export default function Checkout() {
//   const router = useRouter();
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [total, setTotal] = useState(0);
//   const [address, setAddress] = useState("");
//   const [card, setCard] = useState("");
//   const [userId, setUserId] = useState<string | null>(null);

//   useEffect(() => {
//     loadUserData();
//     loadCart();
//   }, []);

//   useEffect(() => {
//     calculateTotal();
//   }, [cart]);

//   const loadUserData = () => {
//     const user = auth.currentUser;
//     if (user) {
//       setUserId(user.uid);
//       // Ideally you fetch user profile from Firestore
//       // Here we try to load from AsyncStorage for demo
//       AsyncStorage.getItem(`userProfile-${user.uid}`).then((res) => {
//         if (res) {
//           const profile = JSON.parse(res);
//           setAddress(profile.address || "");
//           setCard(profile.card || "");
//         }
//       });
//     }
//   };

//   const loadCart = async () => {
//     const storedCart = await AsyncStorage.getItem("cart");
//     if (storedCart) setCart(JSON.parse(storedCart));
//   };

//   const calculateTotal = () => {
//     const sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
//     setTotal(sum);
//   };

//   const placeOrder = async () => {
//     if (!userId) {
//       Alert.alert("Error", "Please login to place an order");
//       return;
//     }
//     if (!address || !card) {
//       Alert.alert("Error", "Address and card are required");
//       return;
//     }
//     if (cart.length === 0) {
//       Alert.alert("Cart Empty", "Add items to cart before placing order");
//       return;
//     }

//     try {
//       await addDoc(collection(db, "orders"), {
//         userId,
//         items: cart,
//         total,
//         address,
//         card,
//         status: "pending",
//         createdAt: new Date(),
//       });

//       Alert.alert("Success", "Order placed successfully!");
//       await AsyncStorage.removeItem("cart");
//       router.replace("/home");
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Checkout</Text>

//       <FlatList
//         data={cart}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.cartItem}>
//             <Text style={styles.cartName}>{item.name}</Text>
//             <Text style={styles.cartQty}>
//               {item.quantity} x R {item.price}
//             </Text>
//           </View>
//         )}
//       />

//       <Text style={styles.totalText}>Total: R {total}</Text>

//       <Text style={styles.label}>Drop-off Address</Text>
//       <TextInput
//         style={styles.input}
//         value={address}
//         onChangeText={setAddress}
//         placeholder="Enter your address"
//       />

//       <Text style={styles.label}>Card Details</Text>
//       <TextInput
//         style={styles.input}
//         value={card}
//         onChangeText={setCard}
//         placeholder="Enter your card number"
//         keyboardType="numeric"
//       />

//       <Button
//         title="Place Order"
//         buttonStyle={styles.button}
//         onPress={placeOrder}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },
//   cartItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 8,
//     borderBottomWidth: 0.5,
//     borderColor: "#ccc",
//   },
//   cartName: {
//     fontSize: 16,
//   },
//   cartQty: {
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   totalText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginVertical: 12,
//   },
//   label: {
//     fontSize: 16,
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     fontSize: 16,
//   },
//   button: {
//     marginTop: 20,
//     backgroundColor: "#000",
//     borderRadius: 6,
//     paddingVertical: 12,
//   },
// });





































import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { db } from "../../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { auth } from "../../services/firebase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const [userId, setUserId] = useState<string | null>(null);
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [savedCards, setSavedCards] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState("");

  const [deliveryOption, setDeliveryOption] = useState<"store" | "delivery">(
    "delivery"
  );
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [showCardDropdown, setShowCardDropdown] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Unauthorized", "Please login to access Checkout");
      router.replace("/login");
      return;
    }

    setUserId(user.uid);

    // Load user profile with registered address and cards
    AsyncStorage.getItem(`userProfile-${user.uid}`).then((res) => {
      if (res) {
        const profile = JSON.parse(res);

        // Set the registered address
        if (profile.address) {
          setRegisteredAddress(profile.address);
        } else {
          Alert.alert(
            "Profile Incomplete",
            "Please update your profile with an address before checkout"
          );
        }

        // Set saved cards
        if (profile.cards && profile.cards.length > 0) {
          setSavedCards(profile.cards);
          setSelectedCard(profile.cards[0]);
        } else if (profile.card) {
          setSavedCards([profile.card]);
          setSelectedCard(profile.card);
        }
      } else {
        Alert.alert(
          "Profile Not Found",
          "Please complete your profile before checkout"
        );
      }
    });

    loadCart();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cart]);

  const loadCart = async () => {
    const storedCart = await AsyncStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  };

  const calculateTotal = () => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  const toggleCardDropdown = () => {
    setShowCardDropdown(!showCardDropdown);
  };

  const selectCard = (card: string) => {
    setSelectedCard(card);
    setShowCardDropdown(false);
  };

  const placeOrder = async () => {
    // Validation
    if (cart.length === 0) {
      Alert.alert("Cart Empty", "Add items to cart before placing order");
      return;
    }

    if (deliveryOption === "delivery" && !registeredAddress) {
      Alert.alert(
        "Error",
        "Please update your profile with a delivery address"
      );
      return;
    }

    if (paymentMethod === "card" && !selectedCard) {
      Alert.alert("Error", "Please select a card for payment");
      return;
    }

    try {
      // Create order object
      const orderData = {
        userId,
        items: cart,
        total,
        deliveryOption,
        address: deliveryOption === "delivery" ? registeredAddress : null,
        paymentMethod,
        card: paymentMethod === "card" ? selectedCard : null,
        status: "pending",
        createdAt: new Date(),
      };

      // Add order to Firestore
      await addDoc(collection(db, "orders"), orderData);

      // Clear cart
      await AsyncStorage.removeItem("cart");

      Alert.alert(
        "Success",
        `Order placed successfully!\n${
          deliveryOption === "store"
            ? "Collect at store"
            : "Delivery to: " + registeredAddress
        }\nPayment: ${paymentMethod === "card" ? "Card" : "Cash on Collection"}`
      );

      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to place order");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Checkout</Text>

        {/* CART ITEMS */}
        {cart.length === 0 ? (
          <Text style={styles.emptyCart}>Your cart is empty.</Text>
        ) : (
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartQty}>
                  {item.quantity} x R {item.price.toFixed(2)}
                </Text>
              </View>
            )}
          />
        )}

        <Text style={styles.totalText}>Total: R {total.toFixed(2)}</Text>

        {/* DELIVERY OPTION - RADIO BUTTONS */}
        <Text style={styles.sectionTitle}>Delivery Option</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setDeliveryOption("delivery")}
          >
            <View
              style={[
                styles.radioCircle,
                deliveryOption === "delivery" && styles.selectedRadio,
              ]}
            />
            <Text style={styles.radioText}>Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setDeliveryOption("store")}
          >
            <View
              style={[
                styles.radioCircle,
                deliveryOption === "store" && styles.selectedRadio,
              ]}
            />
            <Text style={styles.radioText}>Collect at Store</Text>
          </TouchableOpacity>
        </View>

        {/* SHOW REGISTERED ADDRESS */}
        {deliveryOption === "delivery" && (
          <View style={styles.addressBox}>
            <Text style={styles.label}>
              Delivery Address (from your profile):
            </Text>
            <Text style={styles.addressText}>
              {registeredAddress ||
                "No address found. Please update your profile."}
            </Text>
          </View>
        )}

        {/* PAYMENT METHOD - RADIO BUTTONS */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setPaymentMethod("card")}
          >
            <View
              style={[
                styles.radioCircle,
                paymentMethod === "card" && styles.selectedRadio,
              ]}
            />
            <Text style={styles.radioText}>Card Payment</Text>
          </TouchableOpacity>

          {deliveryOption === "store" && (
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setPaymentMethod("cash")}
            >
              <View
                style={[
                  styles.radioCircle,
                  paymentMethod === "cash" && styles.selectedRadio,
                ]}
              />
              <Text style={styles.radioText}>Cash on Collection</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CARD SELECTION DROPDOWN */}
        {paymentMethod === "card" && (
          <>
            <Text style={styles.label}>Select Card</Text>
            <TouchableOpacity
              onPress={toggleCardDropdown}
              style={styles.cardSelector}
            >
              <Text style={styles.cardText}>
                {selectedCard || "Select a card"}
              </Text>
              <Icon
                name={showCardDropdown ? "chevron-up" : "chevron-down"}
                type="entypo"
                color="#333"
              />
            </TouchableOpacity>
            {showCardDropdown &&
              savedCards.map((c, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => selectCard(c)}
                >
                  <Text style={styles.cardText}>{c}</Text>
                </TouchableOpacity>
              ))}
          </>
        )}

        {/* PLACE ORDER BUTTON */}
        <Button
          title="Place Order"
          buttonStyle={styles.button}
          onPress={placeOrder}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  emptyCart: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginVertical: 20,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartName: {
    fontSize: 16,
    color: "#333",
  },
  cartQty: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "right",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    color: "#333",
  },
  addressBox: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addressText: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  radioGroup: {
    flexDirection: "column",
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 5,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#333",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRadio: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },
  cardSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 15,
  },
});