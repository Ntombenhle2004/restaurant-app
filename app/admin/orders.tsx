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
  addons?: any[];
  removables?: any[];
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

  const renderItem = ({ item, index }: { item: Order; index: number }) => (
    <View style={styles.card}>
      {/* Order Number Header */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{index + 1}</Text>
        <View style={[styles.statusBadge, getStatusColor(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{item.userName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{item.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{item.address}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {item.items.map((i, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemQuantity}>{i.quantity}x</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{i.name}</Text>

                {/* Add-ons */}
                {i.addons && i.addons.length > 0 && (
                  <Text style={styles.addon}>
                    + {i.addons.map((a) => a.name).join(", ")}
                  </Text>
                )}

                {/* Removables */}
                {i.removables && i.removables.length > 0 && (
                  <Text style={styles.removable}>
                    - No {i.removables.map((r) => r.name).join(", ")}
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

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>R {item.total.toFixed(2)}</Text>
      </View>

      {/* Status Picker */}
      <View style={styles.statusBox}>
        <Text style={styles.statusPickerLabel}>Update Status</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={item.status}
            onValueChange={(value) => updateStatus(item.id, value)}
            style={styles.picker}
          >
            {STATUSES.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return styles.statusPending;
      case "Preparing":
        return styles.statusPreparing;
      case "Out for delivery":
        return styles.statusDelivery;
      case "Completed":
        return styles.statusCompleted;
      default:
        return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No orders yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders Management</Text>
      <Text style={styles.subtitle}>{orders.length} Total Orders</Text>

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
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  statusPending: {
    backgroundColor: "#FF9800",
  },
  statusPreparing: {
    backgroundColor: "#2196F3",
  },
  statusDelivery: {
    backgroundColor: "#9C27B0",
  },
  statusCompleted: {
    backgroundColor: "#4CAF50",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#666",
    width: 80,
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemLeft: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginRight: 8,
    minWidth: 30,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  addon: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 2,
  },
  removable: {
    fontSize: 12,
    color: "#F44336",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#000",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  statusBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  statusPickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
});
