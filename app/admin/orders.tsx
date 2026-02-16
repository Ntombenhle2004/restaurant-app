import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Ionicons } from "@expo/vector-icons";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  description?: string;
};

type Order = {
  id: string;
  customerId: string;
  customerName: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number; // Matches CheckoutScreen
  paymentStatus: string;
  paymentRef: string;
  orderStatus: string;
  placedAt: any;
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
      const q = query(collection(db, "orders"), orderBy("placedAt", "desc"));
      const snap = await getDocs(q);

      const ordersList: Order[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, "id">),
      }));

      setOrders(ordersList);
      setFilteredOrders(ordersList);
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

    const q = searchQuery.toLowerCase();
    const filtered = orders.filter((order) => {
      return (
        order.customerName?.toLowerCase().includes(q) ||
        order.paymentRef?.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q)
      );
    });

    setFilteredOrders(filtered);
  };

  const renderItem = ({ item }: { item: Order }) => {
    return (
      <View style={styles.card}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>
            ORDER ID: {item.id.slice(-6).toUpperCase()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.paymentStatus === "Paid" ? "#e6f4ea" : "#feefe3",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: item.paymentStatus === "Paid" ? "#1e8e3e" : "#d93025",
                },
              ]}
            >
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUSTOMER DETAILS</Text>
          <Info label="Name" value={item.customerName} />
          <Info label="Address" value={item.deliveryAddress} />
          <Info label="Payment Ref" value={item.paymentRef} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORDER ITEMS</Text>
          {item.items.map((i, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemQuantity}>{i.quantity}x</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{i.name}</Text>
                  {i.description && (
                    <Text style={styles.itemDesc}>{i.description}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.itemPrice}>
                R {(Number(i.price) * i.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.dateText}>
              {item.placedAt?.toDate().toLocaleDateString()}{" "}
              {item.placedAt
                ?.toDate()
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalAmount}>
              R {Number(item.totalAmount || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="000" />
        <Text style={{ marginTop: 10, color: "000" }}>
          Loading orders...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <View style={styles.header}>
            <Text style={styles.brandTitle}>ORDERS</Text>
            <View style={styles.dividerGold} />
          </View>
  

      <View style={styles.searchContainer}>
        <Ionicons style={styles.seachicon} name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
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
  container: { flex: 1, padding: 16, backgroundColor: "#F8F8F8" },
  header: { alignItems: "center", marginTop: 1, marginBottom: 20 },
  brandTitle: { fontSize: 24, letterSpacing: 6, fontWeight: "300" },
  dividerGold: {
    width: 45,
    height: 2,
    backgroundColor: "#9c8966",
    marginTop: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 22,
    fontWeight: "300",
    textAlign: "center",
    letterSpacing: 4,
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 16,
    color: "000",
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fcfcfc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd9d9",
  },
  searchInput: { flex: 1, marginLeft: 5 },
  seachicon: { marginTop: 9 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 4,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "000",
    elevation: 2,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  orderId: { fontSize: 10, color: "#aaa", fontWeight: "bold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "000",
    marginBottom: 8,
    letterSpacing: 1,
  },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  label: { width: 100, color: "#888", fontSize: 13 },
  value: { flex: 1, fontSize: 13, color: "#333", fontWeight: "500" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemLeft: { flexDirection: "row", flex: 1 },
  itemQuantity: { marginRight: 10, fontWeight: "700", color: "000" },
  itemName: { fontWeight: "600", fontSize: 14 },
  itemDesc: { fontSize: 11, color: "#999", fontStyle: "italic" },
  itemPrice: { fontWeight: "bold", fontSize: 14, color: "#444" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  dateText: { fontSize: 11, color: "#bbb" },
  totalLabel: { fontWeight: "800", fontSize: 10, color: "000" },
  totalAmount: { fontWeight: "300", fontSize: 22, color: "#9c8966" },
});