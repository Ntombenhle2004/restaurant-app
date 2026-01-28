import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Ionicons } from "@expo/vector-icons";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  addons?: any[];
  removables?: any[];
};

type Order = {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  phone?: string;
  deliveryAddress?: string;
  total: number;
  createdAt?: any;
  items: OrderItem[];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  const loadOrders = async () => {
    try {
      const snap = await getDocs(collection(db, "orders"));

      const ordersWithUsers: Order[] = await Promise.all(
        snap.docs.map(async (d) => {
          const orderData = d.data() as Omit<Order, "id">;

          let userData = {};
          if (orderData.userId) {
            const userSnap = await getDoc(doc(db, "users", orderData.userId));

            if (userSnap.exists()) {
              userData = userSnap.data();
            }
          }

          return {
            id: d.id,
            ...orderData,
            userName: (userData as any)?.name || "N/A",
            userEmail: (userData as any)?.email || orderData.userEmail || "N/A",
            phone: (userData as any)?.phone || "N/A",
            deliveryAddress: (userData as any)?.address || "N/A",
          };
        }),
      );

      setOrders(ordersWithUsers);
      setFilteredOrders(ordersWithUsers);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = orders.filter((order, index) => {
      const orderNumber = (index + 1).toString();
      const userName = (order.userName || "").toLowerCase();

      return orderNumber.includes(query) || userName.includes(query);
    });

    setFilteredOrders(filtered);
  };

  const getOrderNumber = (orderId: string) => {
    const index = orders.findIndex((o) => o.id === orderId);
    return index + 1;
  };

  const renderItem = ({ item }: { item: Order }) => {
    const orderNumber = getOrderNumber(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>

          <Info label="Name" value={item.userName} />
          <Info label="Email" value={item.userEmail} />
          <Info label="Phone" value={item.phone} />
          <Info label="Delivery" value={item.deliveryAddress} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>

          {item.items.map((i, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemQuantity}>{i.quantity}x</Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{i.name}</Text>

                  {Array.isArray(i.addons) && i.addons.length > 0 && (
                    <Text style={styles.addon}>
                      + {i.addons.map((a) => a.name || a).join(", ")}
                    </Text>
                  )}

                  {Array.isArray(i.removables) && i.removables.length > 0 && (
                    <Text style={styles.removable}>
                      - No {i.removables.map((r) => r.name || r).join(", ")}
                    </Text>
                  )}
                </View>
              </View>

              <Text style={styles.itemPrice}>
                R {(i.price * i.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>R {item.total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders Management</Text>
      <Text style={styles.subtitle}>{orders.length} Total Orders</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search order or customer..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const Info = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || "N/A"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F5F5F5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  subtitle: { textAlign: "center", marginBottom: 16, color: "#666" },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  orderHeader: { marginBottom: 12 },
  orderNumber: { fontSize: 18, fontWeight: "bold" },
  section: { marginBottom: 16 },
  sectionTitle: { fontWeight: "bold", marginBottom: 6 },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  label: { width: 90, color: "#666" },
  value: { flex: 1 },
  itemRow: { flexDirection: "row", justifyContent: "space-between" },
  itemLeft: { flexDirection: "row", flex: 1 },
  itemQuantity: { marginRight: 8 },
  itemDetails: { flex: 1 },
  itemName: { fontWeight: "600" },
  addon: { color: "green", fontSize: 12 },
  removable: { color: "red", fontSize: 12 },
  itemPrice: { fontWeight: "bold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  totalLabel: { fontWeight: "bold" },
  totalAmount: { fontWeight: "bold", fontSize: 16 },
});
