// import { Stack, router, useLocalSearchParams } from "expo-router";
// import { doc, getDoc } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { Button } from "react-native-elements";
// import { db } from "../../services/firebase";

// type Food = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   image: string;
//   category: string;
// };

// const APP_COLOR = "#000";

// export default function FoodDetails() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const [food, setFood] = useState<Food | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (id) fetchFood();
//   }, [id]);

//   const fetchFood = async () => {
//     try {
//       const ref = doc(db, "foods", id);
//       const snap = await getDoc(ref);

//       if (snap.exists()) {
//         setFood({
//           id: snap.id,
//           ...(snap.data() as Omit<Food, "id">),
//         });
//       }
//     } catch (error) {
//       console.log("Error loading food:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={APP_COLOR} />
//       </View>
//     );
//   }

//   if (!food) {
//     return (
//       <View style={styles.center}>
//         <Text>Food not found</Text>
//       </View>
//     );
//   }

//   return (
//     <>
//       {/* HEADER WITH BACK ARROW */}
//       <Stack.Screen
//         options={{
//           title: "Food Detail",
//         }}
//       />

//       <ScrollView style={styles.container}>
//         <Image source={{ uri: food.image }} style={styles.image} />

//         <Text style={styles.name}>{food.name}</Text>
//         <Text style={styles.category}>{food.category}</Text>

//         <Text style={styles.description}>{food.description}</Text>

//         <Text style={styles.price}>R {food.price}</Text>

//         <Button
//           title="Add to Cart"
//           buttonStyle={styles.button}
//           onPress={() =>
//             router.push({
//               pathname: "/cart",
//               params: { foodId: food.id }, // pass the food clicked
//             })
//           }
//         />
//       </ScrollView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#fff",
//   },

//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   image: {
//     width: "100%",
//     height: 240,
//     borderRadius: 12,
//     marginBottom: 16,
//   },

//   name: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 4,
//   },

//   category: {
//     fontSize: 14,
//     color: "#777",
//     marginBottom: 12,
//   },

//   description: {
//     fontSize: 16,
//     lineHeight: 22,
//     marginBottom: 16,
//   },

//   price: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },

//   button: {
//     backgroundColor: APP_COLOR,
//     borderRadius: 8,
//   },
// });

























// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../../services/firebase";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Icon, Button } from "react-native-elements";

// type Food = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   image: string;
//   category: string;
// };

// type CartItem = {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
//   sides: string[];
//   drink: string | null;
//   extras: string[];
//   removed: string[];
// };

// const INCLUDED_SIDES = ["Pap", "Chips", "Salad"];
// const DRINKS = ["Coke", "Fanta", "Sprite"];
// const EXTRAS = [
//   { name: "Extra Chips", price: 15 },
//   { name: "Cheese", price: 10 },
//   { name: "Sauce", price: 5 },
// ];
// const INGREDIENTS = ["Lettuce", "Tomato", "Onion"];

// export default function FoodDetails() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();

//   const [food, setFood] = useState<Food | null>(null);
//   const [quantity, setQuantity] = useState(1);

//   const [sides, setSides] = useState<string[]>([]);
//   const [drink, setDrink] = useState<string | null>(null);
//   const [extras, setExtras] = useState<string[]>([]);
//   const [removed, setRemoved] = useState<string[]>([]);

//   useEffect(() => {
//     loadFood();
//   }, []);

//   const loadFood = async () => {
//     const ref = doc(db, "foods", id);
//     const snap = await getDoc(ref);
//     if (snap.exists()) {
//       setFood({ id: snap.id, ...(snap.data() as Omit<Food, "id">) });
//     }
//   };

//   const toggleSide = (side: string) => {
//     if (sides.includes(side)) {
//       setSides(sides.filter((s) => s !== side));
//     } else if (sides.length < 2) {
//       setSides([...sides, side]);
//     } else {
//       Alert.alert("Limit reached", "You can only choose 2 sides");
//     }
//   };

//   const toggleExtra = (extra: string) => {
//     setExtras(
//       extras.includes(extra)
//         ? extras.filter((e) => e !== extra)
//         : [...extras, extra]
//     );
//   };

//   const toggleRemove = (item: string) => {
//     setRemoved(
//       removed.includes(item)
//         ? removed.filter((i) => i !== item)
//         : [...removed, item]
//     );
//   };

//   const extrasTotal = extras.reduce((sum, name) => {
//     const found = EXTRAS.find((e) => e.name === name);
//     return sum + (found?.price || 0);
//   }, 0);

//   const totalPrice = food ? (food.price + extrasTotal) * quantity : 0;

//   const addToCart = async () => {
//     if (!food) return;

//     const stored = await AsyncStorage.getItem("cart");
//     const cart: CartItem[] = stored ? JSON.parse(stored) : [];

//     cart.push({
//       id: `${food.id}-${Date.now()}`,
//       name: food.name,
//       price: food.price + extrasTotal,
//       quantity,
//       image: food.image,
//       sides,
//       drink,
//       extras,
//       removed,
//     });

//     await AsyncStorage.setItem("cart", JSON.stringify(cart));

//     Alert.alert("Added to Cart", "Item added successfully");
//     router.back();
//   };

//   if (!food) return null;

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Icon name="arrow-left" type="feather" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Food Detail</Text>
//       </View>

//       <Image source={{ uri: food.image }} style={styles.image} />
//       <Text style={styles.name}>{food.name}</Text>
//       <Text style={styles.desc}>{food.description}</Text>

//       <Section title="Choose up to 2 sides">
//         {INCLUDED_SIDES.map((s) => (
//           <Option
//             key={s}
//             label={s}
//             active={sides.includes(s)}
//             onPress={() => toggleSide(s)}
//           />
//         ))}
//       </Section>

//       <Section title="Drink (optional)">
//         {DRINKS.map((d) => (
//           <Option
//             key={d}
//             label={d}
//             active={drink === d}
//             onPress={() => setDrink(d)}
//           />
//         ))}
//       </Section>

//       <Section title="Extras (add-on)">
//         {EXTRAS.map((e) => (
//           <Option
//             key={e.name}
//             label={`${e.name} (+R${e.price})`}
//             active={extras.includes(e.name)}
//             onPress={() => toggleExtra(e.name)}
//           />
//         ))}
//       </Section>

//       <Section title="Remove ingredients">
//         {INGREDIENTS.map((i) => (
//           <Option
//             key={i}
//             label={i}
//             active={removed.includes(i)}
//             onPress={() => toggleRemove(i)}
//           />
//         ))}
//       </Section>

//       <View style={styles.qtyRow}>
//         <TouchableOpacity
//           onPress={() => setQuantity(Math.max(1, quantity - 1))}
//         >
//           <Icon name="minus-circle" type="feather" />
//         </TouchableOpacity>
//         <Text style={styles.qty}>{quantity}</Text>
//         <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
//           <Icon name="plus-circle" type="feather" />
//         </TouchableOpacity>
//       </View>

//       <Button
//         title={`Add to Cart • R ${totalPrice}`}
//         buttonStyle={styles.addBtn}
//         onPress={addToCart}
//       />
//     </ScrollView>
//   );
// }

// function Section({ title, children }: any) {
//   return (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       <View style={styles.options}>{children}</View>
//     </View>
//   );
// }

// function Option({ label, active, onPress }: any) {
//   return (
//     <TouchableOpacity
//       style={[styles.option, active && styles.optionActive]}
//       onPress={onPress}
//     >
//       <Text style={[styles.optionText, active && styles.optionTextActive]}>
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", padding: 16 },
//   header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
//   headerTitle: { fontSize: 18, fontWeight: "600", marginLeft: 12 },

//   image: { width: "100%", height: 220, borderRadius: 12 },
//   name: { fontSize: 22, fontWeight: "700", marginTop: 12 },
//   desc: { color: "#555", marginBottom: 10 },

//   section: { marginTop: 16 },
//   sectionTitle: { fontWeight: "600", marginBottom: 8 },

//   options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
//   option: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//   },
//   optionActive: { backgroundColor: "#000", borderColor: "#000" },
//   optionText: { color: "#333" },
//   optionTextActive: { color: "#fff" },

//   qtyRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 20,
//     gap: 20,
//   },
//   qty: { fontSize: 18, fontWeight: "600" },

//   addBtn: {
//     backgroundColor: "#000",
//     borderRadius: 10,
//     paddingVertical: 14,
//     marginBottom: 30,
//   },
// });








































import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

type Addon = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function FoodDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [food, setFood] = useState<any>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    loadFood();
  }, []);

  const loadFood = async () => {
    const snap = await getDoc(doc(db, "foods", id));
    if (!snap.exists()) return;

    const data = snap.data();
    setFood(data);

    if (data.addons?.length) {
      const addonDocs = await Promise.all(
        data.addons.map((addonId: string) => getDoc(doc(db, "foods", addonId)))
      );

      setAddons(
        addonDocs
          .filter((d) => d.exists())
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
    }
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const toggleRemove = (item: string) => {
    setRemoved((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const totalPrice = () => {
    const addonTotal = addons
      .filter((a) => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

    return (food.price + addonTotal) * qty;
  };

  const addToCart = async () => {
    const stored = await AsyncStorage.getItem("cart");
    const cart = stored ? JSON.parse(stored) : [];

    cart.push({
      id: Date.now().toString(),
      foodId: id,
      name: food.name,
      image: food.image,
      basePrice: food.price,
      addons: addons.filter((a) => selectedAddons.includes(a.id)),
      removed,
      quantity: qty,
      total: totalPrice(),
    });

    await AsyncStorage.setItem("cart", JSON.stringify(cart));
    Alert.alert("Added to cart");
  };

  if (!food) return null;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: food.image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{food.name}</Text>
        <Text style={styles.desc}>{food.description}</Text>
        <Text style={styles.price}>R {food.price}</Text>

        {/* ADD-ONS */}
        {addons.length > 0 && (
          <>
            <Text style={styles.section}>Would you like to add?</Text>

            {addons.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.addonRow}
                onPress={() => toggleAddon(a.id)}
              >
                <Ionicons
                  name={
                    selectedAddons.includes(a.id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                />
                <Image source={{ uri: a.image }} style={styles.addonImg} />
                <View>
                  <Text style={styles.addonName}>{a.name}</Text>
                  <Text style={styles.addonPrice}>+R {a.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* REMOVABLES */}
        {food.removables?.length > 0 && (
          <>
            <Text style={styles.section}>Remove ingredients</Text>
            {food.removables.map((r: string) => (
              <TouchableOpacity
                key={r}
                style={styles.removeRow}
                onPress={() => toggleRemove(r)}
              >
                <Ionicons
                  name={removed.includes(r) ? "checkbox" : "square-outline"}
                  size={22}
                />
                <Text style={styles.removeText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* QTY */}
        <View style={styles.qtyRow}>
          <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))}>
            <Ionicons name="remove-circle" size={30} />
          </TouchableOpacity>
          <Text style={styles.qty}>{qty}</Text>
          <TouchableOpacity onPress={() => setQty(qty + 1)}>
            <Ionicons name="add-circle" size={30} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cartBtn} onPress={addToCart}>
          <Text style={styles.cartText}>Add to cart · R {totalPrice()}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 240 },
  content: { padding: 16 },
  name: { fontSize: 22, fontWeight: "bold" },
  desc: { color: "#555", marginVertical: 6 },
  price: { fontSize: 18, fontWeight: "600" },

  section: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "bold",
  },

  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    marginTop: 10,
  },
  addonImg: { width: 50, height: 50, marginHorizontal: 12 },
  addonName: { fontWeight: "600" },
  addonPrice: { color: "#555" },

  removeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  removeText: { marginLeft: 10 },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  qty: { fontSize: 20, marginHorizontal: 20 },

  cartBtn: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cartText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
