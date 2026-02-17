import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function AdminDashboard() {
  const router = useRouter();
  const [foodCount, setFoodCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const foodSnap = await getDocs(collection(db, "foods"));
      const orderSnap = await getDocs(collection(db, "orders"));
      setFoodCount(foodSnap.size);
      setOrderCount(orderSnap.size);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ["Foods", "Orders"],
    datasets: [
      {
        data: [foodCount, orderCount],
        colors: [
          (opacity = 1) => `#9c8966`, 
          (opacity = 1) => `#9c8966`, 
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(156, 137, 102, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barPercentage: 0.6,
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#f0f0f0",
    },
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9c8966" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <Text style={styles.brandTitle}>DASHBOARD</Text>
        <View style={styles.dividerGold} />
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Food vs Orders</Text>
          <View style={styles.legend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Total Count</Text>
          </View>
        </View>

        <View style={styles.chartWrapper}>
          <BarChart
            data={chartData}
            width={screenWidth - 80}
            height={220}
            chartConfig={chartConfig}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero={true}
            flatColor={true} 
            withCustomBarColorFromData={true}  
            style={styles.barChartStyle}
          />
        </View>
      </View>

      <View style={styles.statsRow}>
      
        <TouchableOpacity
          style={styles.smallCard}
          onPress={() => router.push("/admin/manage-food")}
        >
          <Text style={styles.cardLabel}>Foods</Text>
          <Text style={styles.cardValue}>{foodCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallCard}
          onPress={() => router.push("/admin/orders")}
        >
          <Text style={styles.cardLabel}>Orders</Text>
          <Text style={styles.cardValue}>{orderCount}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/admin/manage-food")}
      >
        <Text style={styles.buttonText}>Manage Food</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/admin/orders")}
      >
        <Text style={styles.secondaryButtonText}>View Recent Orders</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingHorizontal: 20 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", marginTop: 19, marginBottom: 13 },
  brandTitle: {
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: "300",
    color: "#1A1A1A",
  },
  dividerGold: {
    width: 40,
    height: 2,
    backgroundColor: "#9c8966",
    marginTop: 12,
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
    textTransform: "uppercase",
  },
  legend: { flexDirection: "row", alignItems: "center" },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9c8966",
    marginRight: 6,
  },
  legendText: { fontSize: 11, color: "#888", fontWeight: "600" },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 40,
  },
  barChartStyle: { marginVertical: 8, borderRadius: 16 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  smallCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 20,
    borderRadius: 18,
    borderLeftWidth: 5,
    borderLeftColor: "#9c8966",
    elevation: 2,
  },
  cardLabel: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 4,
  },
  primaryButton: {
    marginBottom: 12,
    backgroundColor: "transparent",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#cac7c7",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#cac7c7",
    alignItems: "center",
  },
  buttonText: { color: "#000", fontSize: 16, fontWeight: "700" },
  secondaryButtonText: { color: "#000", fontSize: 16, fontWeight: "700" },
});
