// import { View, Text, StyleSheet, FlatList, Image, Alert } from "react-native";
// import { Icon } from "react-native-elements";
// import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
// import { db } from "../../services/firebase";
// import { useEffect, useState } from "react";
// import { useRouter } from "expo-router";

// type Food = {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
// };

// const APP_COLOR = "#8B0000";

// export default function FoodList() {
//   const [foods, setFoods] = useState<Food[]>([]);
//   const router = useRouter();

//   useEffect(() => {
//     loadFoods();
//   }, []);

//   const loadFoods = async () => {
//     const snap = await getDocs(collection(db, "foods"));
//     const list = snap.docs.map((doc) => ({
//       id: doc.id,
//       ...(doc.data() as Omit<Food, "id">),
//     }));
//     setFoods(list);
//   };

//   const deleteFood = async (id: string) => {
//     Alert.alert("Delete Food", "Are you sure?", [
//       { text: "Cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           await deleteDoc(doc(db, "foods", id));
//           loadFoods();
//         },
//       },
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Food Items</Text>

//       {/* Table Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Image</Text>
//         <Text style={styles.headerText}>Name</Text>
//         <Text style={styles.headerText}>Price</Text>
//         <Text style={styles.headerText}>Actions</Text>
//       </View>

//       <FlatList
//         data={foods}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.row}>
//             <Image source={{ uri: item.image }} style={styles.image} />
//             <Text style={styles.cell}>{item.name}</Text>
//             <Text style={styles.cell}>R {item.price}</Text>

//             <View style={styles.actions}>
//               <Icon
//                 name="edit"
//                 type="feather"
//                 color={APP_COLOR}
//                 onPress={() =>
//                   router.push({
//                     pathname: "/admin/manage-food",
//                     params: { id: item.id },
//                   })
//                 }
//               />
//               <Icon
//                 name="trash"
//                 type="feather"
//                 color="red"
//                 onPress={() => deleteFood(item.id)}
//               />
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F9F9F9",
//     padding: 16,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 12,
//     color: APP_COLOR,
//   },
//   header: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     paddingBottom: 6,
//   },
//   headerText: {
//     width: "25%",
//     fontWeight: "bold",
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     borderBottomWidth: 0.5,
//   },
//   image: {
//     width: 40,
//     height: 40,
//     borderRadius: 4,
//   },
//   cell: {
//     width: "25%",
//   },
//   actions: {
//     flexDirection: "row",
//     gap: 12,
//   },
// });










import { View, Text, StyleSheet, FlatList, Image, Alert } from "react-native";
import { Icon } from "react-native-elements";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useRouter } from "expo-router";

const APP_COLOR = "#000";

type Food = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
};

export default function FoodList() {
  const [foods, setFoods] = useState<Food[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const snap = await getDocs(collection(db, "foods"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Food, "id">),
    }));
    setFoods(list);
  };

  const deleteFood = async (id: string) => {
    Alert.alert("Confirm", "Delete this food item?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "foods", id));
          loadFoods();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Items</Text>

      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>R {item.price}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>

            <View style={styles.actions}>
              <Icon
                name="edit"
                type="feather"
                color={APP_COLOR}
                onPress={() =>
                  router.push({
                    pathname: "/admin/manage-food",
                    params: {
                      id: item.id,
                      name: item.name,
                      price: item.price.toString(),
                      image: item.image,
                        description: item.description,
                      category: item.category,
                    },
                  })
                }
              />
              <Icon
                name="trash"
                type="feather"
                color="red"
                onPress={() => deleteFood(item.id)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontWeight: "bold",
  },
  category: {
    fontSize: 12,
    color: "#777",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
    description: {
    fontSize: 14,
    }
});
