import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { Icon, Button } from "react-native-elements";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const APP_COLOR = "#000";

const CATEGORIES = [
  "All",
  "Burgers",
  "Mains",
  "Starters",
  "Desserts",
  "Beverages",
];

export default function HomeScreen() {
  const router = useRouter();

  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadFoods();
    loadCart();
  }, []);

  // Reload cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadFoods = async () => {
    try {
      const snap = await getDocs(collection(db, "foods"));
      const list: Food[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Food, "id">),
      }));
      setFoods(list);
    } catch (error) {
      console.error("Error loading foods:", error);
      Alert.alert("Error", "Failed to load menu items");
    }
  };

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    try {
      setCartItems(items);
      await AsyncStorage.setItem("cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || food.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = async (food: Food) => {
    const existing = cartItems.find((item) => item.id === food.id);
    let updatedCart: CartItem[];

    if (existing) {
      updatedCart = cartItems.map((item) =>
        item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      const newItem: CartItem = {
        id: food.id,
        name: food.name,
        price: food.price,
        quantity: 1,
        image: food.image,
      };
      updatedCart = [...cartItems, newItem];
    }

    await saveCart(updatedCart);

    // Show success feedback
    Alert.alert("Added to Cart", `${food.name} has been added to your cart`, [
      { text: "OK" },
    ]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>What do you want to eat today?</Text>

            <View style={styles.searchBox}>
              <Icon name="search" type="feather" color="#888" />
              <TextInput
                placeholder="Search food..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                placeholderTextColor="#888"
              />
            </View>

            <FlatList
              data={CATEGORIES}
              horizontal
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
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
            onPress={() =>
              router.push({
                pathname: "/food-details",
                params: { id: item.id },
              })
            }
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>R {item.price}</Text>

            {/* <Button
              title="Add to Cart"
              buttonStyle={styles.addButton}
              onPress={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                }
                addToCart(item);
              }}
            /> */}
          </TouchableOpacity>
        )}
      />

      {/* Floating Cart Button */}
      {/* {cartItems.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push("/cart")}
        >
          <Icon name="shopping-cart" type="feather" color="#fff" size={24} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getTotalItems()}</Text>
          </View>
        </TouchableOpacity>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 16,
    color: APP_COLOR,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
  },

  categories: {
    marginBottom: 20,
  },

  categoryButton: {
    height: 36,
    minWidth: 90,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  categoryButtonActive: {
    backgroundColor: APP_COLOR,
  },

  categoryText: {
    fontSize: 14,
    color: "#333",
  },

  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 10,
    width: "48%",
    marginBottom: 16,
    elevation: 2,
  },

  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  price: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },

  addButton: {
    backgroundColor: APP_COLOR,
    borderRadius: 6,
    marginTop: 6,
  },

  cartButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: APP_COLOR,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});