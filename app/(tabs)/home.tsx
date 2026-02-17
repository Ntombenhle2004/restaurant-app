import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { useRouter, useFocusEffect } from "expo-router";
import { Icon } from "react-native-elements";
import { onAuthStateChanged } from "firebase/auth";

type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

const APP_COLOR = "#000";
const GOLD_COLOR = "#D4AF37";
const CATEGORIES = [
  "All",
  "Burgers",
  "Pizza",
  "Pasta",
  "Seafood",
  "Salads",
  "Desserts",
  "Drinks",
  "combos",
];

export default function HomeScreen() {
  const router = useRouter();
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load User Profile Name
  const fetchUserName = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name);
      }
    } catch (error) {
      console.error("Error fetching name:", error);
    }
  };

  const loadFoods = async () => {
    try {
      const snap = await getDocs(collection(db, "foods"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Food, "id">),
      })) as Food[];
      setFoods(list);
    } catch (error) {
      console.error("Error loading foods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();

    // Listen for Auth changes to update greeting
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserName(user.uid);
      } else {
        setUserName(null);
      }
    });
    return unsubscribe;
  }, []);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={APP_COLOR} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>
                {userName
                  ? `HELLO ${userName}`
                  : "Welcome to the Immortals"}
              </Text>
              <Text style={styles.subTitle}>What do you want to eat today?</Text>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Icon name="search" type="feather" color="#999" size={18} />
                <TextInput
                  placeholder="Search..."
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <FlatList
              data={CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.categoriesContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedCategory === item && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === item && styles.categoryTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/food-details",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.image }} style={styles.image} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>R {item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  headerTextContainer: { marginTop: 20, marginBottom: 20 },

  welcomeText: {
    fontSize: 14,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: "#1a1a1a",
    lineHeight: 34,
  },
  searchContainer: { marginVertical: 15, },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fcfcfc",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    color: "#000",
    ...Platform.select({
      web: {
        outlineStyle: "none" as any,
      },
    }),
  },
  categoriesContainer: { paddingVertical: 10, marginBottom: 10 },
  categoryButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 2,
    backgroundColor: "#fff",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  categoryButtonActive: { backgroundColor: APP_COLOR, borderColor: APP_COLOR },
  categoryText: {
    fontSize: 11,
    color: "#888",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  categoryTextActive: { color: "#fff", fontWeight: "700" },
  row: { justifyContent: "space-between" },
  card: { width: "47%", marginBottom: 30 },
  imageWrapper: {
    backgroundColor: "#f9f9f9",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: { width: "100%", height: 180, resizeMode: "cover" },
  cardInfo: { paddingHorizontal: 2 },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  description: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    marginTop: 1,
    paddingRight: 50,
  },
  price: { fontSize: 14, color: GOLD_COLOR, marginTop: 4, fontWeight: "700" },
});
