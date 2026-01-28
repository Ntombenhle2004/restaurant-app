import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Picker } from "@react-native-picker/picker";

const APP_COLOR = "#000";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  addons?: string[];
  removables?: string[];
};

type Order = {
  id: string;
  userName: string;
  phone: string;
  address: string;
  total: number;
  status: string;
  createdAt?: any;
  items: OrderItem[];
};

const STATUSES = ["Pending", "Preparing", "Out for delivery", "Completed"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const snap = await getDocs(collection(db, "orders"));
      const list: Order[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, "id">),
      }));
      setOrders(list);
    } catch (err) {
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <Text style={styles.orderId}>Order #{item.id.slice(0, 6)}</Text>

      <Text style={styles.text}>
        👤 {item.userName} | 📞 {item.phone}
      </Text>
      <Text style={styles.text}>📍 {item.address}</Text>

      <View style={styles.itemsBox}>
        {item.items.map((i, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {i.quantity} × {i.name}
            </Text>
            <Text>R {i.price * i.quantity}</Text>

            {i.addons && i.addons.length > 0 && (
              <Text style={styles.sub}>➕ Add-ons: {i.addons.join(", ")}</Text>
            )}

            {i.removables && i.removables.length > 0 && (
              <Text style={styles.sub}>➖ No: {i.removables.join(", ")}</Text>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.total}>Total: R {item.total}</Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Status</Text>
        <Picker
          selectedValue={item.status}
          onValueChange={(value) => updateStatus(item.id, value)}
        >
          {STATUSES.map((s) => (
            <Picker.Item key={s} label={s} value={s} />
          ))}
        </Picker>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  orderId: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemsBox: {
    marginTop: 10,
    marginBottom: 10,
  },
  itemRow: {
    marginBottom: 6,
  },
  itemName: {
    fontWeight: "600",
  },
  sub: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  total: {
    fontWeight: "bold",
    marginTop: 6,
  },
  statusBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 10,
    marginTop: 6,
  },
});
