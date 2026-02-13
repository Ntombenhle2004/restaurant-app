// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   TextInput,
//   Platform,
// } from "react-native";
// import { useEffect, useState, useCallback } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../services/firebase";
// import { useRouter, useFocusEffect } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Icon } from "react-native-elements"; // Back to your original Icon component

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
// };

// const APP_COLOR = "#000";

// // EXACT MATCH FROM YOUR MANAGE FOOD
// const CATEGORIES = [
//   "All",
//   "Burgers",
//   "Pizza",
//   "Pasta",
//   "Seafood",
//   "Salads",
//   "Desserts",
//   "Drinks",
//   "combos",
// ];

// export default function HomeScreen() {
//   const router = useRouter();
//   const [foods, setFoods] = useState<Food[]>([]);
//   const [search, setSearch] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);

//   const loadFoods = async () => {
//     try {
//       const snap = await getDocs(collection(db, "foods"));
//       const list = snap.docs.map((doc) => ({
//         id: doc.id,
//         ...(doc.data() as Omit<Food, "id">),
//       })) as Food[];
//       setFoods(list);
//     } catch (error) {
//       console.error("Error loading foods:", error);
//     }
//   };

//   const loadCart = async () => {
//     try {
//       const storedCart = await AsyncStorage.getItem("cart");
//       if (storedCart) setCartItems(JSON.parse(storedCart));
//     } catch (error) {
//       console.error("Error loading cart:", error);
//     }
//   };

//   useEffect(() => {
//     loadFoods();
//     loadCart();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       loadCart();
//     }, []),
//   );

//   const filteredFoods = foods.filter((food) => {
//     const matchesSearch = food.name
//       .toLowerCase()
//       .includes(search.toLowerCase());
//     const matchesCategory =
//       selectedCategory === "All" || food.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const getTotalItems = () =>
//     cartItems.reduce((sum, item) => sum + item.quantity, 0);

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={filteredFoods}
//         keyExtractor={(item) => item.id}
//         numColumns={2}
//         showsVerticalScrollIndicator={false}
//         columnWrapperStyle={styles.row}
//         contentContainerStyle={styles.listContent}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.title}>What do you want to eat today?</Text>

//             {/* RESTORED EXACT SEARCH BOX STYLE */}
//             <View style={styles.searchBox}>
//               <Icon name="search" type="feather" color="#888" />
//               <TextInput
//                 placeholder="Search food..."
//                 value={search}
//                 onChangeText={setSearch}
//                 // style={styles.searchInput}
//                 placeholderTextColor="#888"
//               />
//             </View>

//             <FlatList
//               data={CATEGORIES}
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               keyExtractor={(item) => item}
//               contentContainerStyle={styles.categories}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[
//                     styles.categoryButton,
//                     selectedCategory === item && styles.categoryButtonActive,
//                   ]}
//                   onPress={() => setSelectedCategory(item)}
//                 >
//                   <Text
//                     style={[
//                       styles.categoryText,
//                       selectedCategory === item && styles.categoryTextActive,
//                     ]}
//                   >
//                     {item}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             />
//           </>
//         }
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.card}
//             onPress={() =>
//               router.push({
//                 pathname: "/food-details",
//                 params: { id: item.id },
//               })
//             }
//           >
//             <Image source={{ uri: item.image }} style={styles.image} />
//             <Text style={styles.name} numberOfLines={1}>
//               {item.name}
//             </Text>
//             <Text style={styles.price}>R {item.price}</Text>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Floating Cart Button */}
//       {cartItems.length > 0 && (
//         <TouchableOpacity
//           style={styles.cartButton}
//           onPress={() => router.push("/cart")}
//         >
//           <Icon name="shopping-cart" type="feather" color="#fff" size={24} />
//           <View style={styles.badge}>
//             <Text style={styles.badgeText}>{getTotalItems()}</Text>
//           </View>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   listContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 100,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "bold",
//     marginTop: 20,
//     marginBottom: 16,
//     color: APP_COLOR,
//   },
//   // EXACT CSS REPLICATED
//   // Inside your styles object:

//   searchBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f2f2f2",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginBottom: 16,
//     // Ensure the container doesn't show a border either
//     borderWidth: 0,
//   },
//   searchInput: {
//     marginLeft: 8,
//     flex: 1,
//     fontSize: 16,
//     color: "#000",
//     ...Platform.select({
//       web: {
//         outlineStyle: "none", // THIS removes the black border on web
//       },
//     }),
//   },
//   categories: {
//     marginBottom: 20,
//   },
//   categoryButton: {
//     height: 36,
//     minWidth: 90,
//     paddingHorizontal: 14,
//     borderRadius: 18,
//     backgroundColor: "#eee",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 10,
//   },
//   categoryButtonActive: {
//     backgroundColor: APP_COLOR,
//   },
//   categoryText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   categoryTextActive: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   row: {
//     justifyContent: "space-between",
//   },
//   card: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 12,
//     padding: 10,
//     width: "48%",
//     marginBottom: 16,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   image: {
//     width: "100%",
//     height: 120,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   price: {
//     fontSize: 14,
//     color: "#555",
//     marginVertical: 4,
//   },
//   cartButton: {
//     position: "absolute",
//     bottom: 20,
//     right: 20,
//     backgroundColor: APP_COLOR,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 5,
//   },
//   badge: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     backgroundColor: "#ff4444",
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   badgeText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//   },
// });

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
const GOLD_COLOR = "#9c8966";
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
              <Text style={styles.brandTitle}>AMBROSIA</Text>
              <Text style={styles.welcomeText}>
                {userName
                  ? `Welcome back, ${userName}`
                  : "Welcome to the Immortals"}
              </Text>
              <Text style={styles.subTitle}>Select your feast today</Text>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Icon name="search" type="feather" color="#999" size={18} />
                <TextInput
                  placeholder="Search our kitchen..."
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
  headerTextContainer: { marginTop: 30, marginBottom: 20 },
  brandTitle: {
    fontSize: 10,
    letterSpacing: 5,
    color: GOLD_COLOR,
    fontWeight: "700",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: "#1a1a1a",
    lineHeight: 34,
  },
  searchContainer: { marginVertical: 15 },
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
    ...Platform.select({ web: { outlineStyle: "none" } }),
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
  price: { fontSize: 14, color: GOLD_COLOR, marginTop: 4, fontWeight: "700" },
});