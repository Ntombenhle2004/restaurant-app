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
    if (id) loadFood(id);
  }, [id]);

  const loadFood = async (foodId: string) => {
    const snap = await getDoc(doc(db, "foods", foodId));
    if (!snap.exists()) return;

    const data = snap.data();
    setFood({ id: snap.id, ...data });

    setSelectedAddons([]);
    setRemoved([]);
    setQty(1);

    if (data.addons?.length) {
      const addonDocs = await Promise.all(
        data.addons.map((addonId: string) => getDoc(doc(db, "foods", addonId)))
      );

      setAddons(
        addonDocs
          .filter((d) => d.exists())
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
    } else {
      setAddons([]);
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

    const addonTotal = addons
      .filter((a) => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

    const itemPrice = food.price + addonTotal;

    cart.push({
      id: Date.now().toString(),
      foodId: food.id,
      name: food.name,
      image: food.image,
      price: itemPrice, 
      quantity: qty,
      addons: addons.filter((a) => selectedAddons.includes(a.id)),
      removed,
    });

    await AsyncStorage.setItem("cart", JSON.stringify(cart));
    Alert.alert("Added to cart");
    router.back();
  };

  if (!food) return <Text style={{ padding: 20 }}>Loading...</Text>;

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
            <Text style={styles.section}>Add-ons</Text>

            {addons.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.row}
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
                  <Text style={styles.rowTitle}>{a.name}</Text>
                  <Text style={styles.rowSub}>+R {a.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

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
  image: { width: "100%", height: 260 },
  content: { padding: 16 },

  name: { fontSize: 22, fontWeight: "bold" },
  desc: { color: "#555", marginVertical: 6 },
  price: { fontSize: 18, fontWeight: "600" },

  section: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  addonImg: { width: 45, height: 45, marginHorizontal: 12 },
  rowTitle: { fontWeight: "600" },
  rowSub: { color: "#555" },

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
    borderRadius: 14,
    alignItems: "center",
  },
  cartText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
