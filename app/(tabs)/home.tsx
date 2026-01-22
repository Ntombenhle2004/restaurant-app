import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useRouter } from "expo-router";

type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
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
  

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const snap = await getDocs(collection(db, "foods"));
    const list: Food[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Food, "id">),
    }));
    setFoods(list);
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || food.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
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

          <Button
            title="Add to Cart"
            buttonStyle={styles.addButton}
            onPress={() => {
              // cart logic later
            }}
          />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
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
});
