// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Image,
//   Alert,
//   ScrollView,
// } from "react-native";
// import { Input, Button, Icon } from "react-native-elements";
// import { useEffect, useState } from "react";
// import * as ImagePicker from "expo-image-picker";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { db } from "../../services/firebase";

// type Food = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   image: string; // base64
// };

// const APP_COLOR = "#000"; // change if your app uses another color

// export default function ManageFood() {
//   const [foods, setFoods] = useState<Food[]>([]);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [image, setImage] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   useEffect(() => {
//     loadFoods();
//   }, []);

//   const loadFoods = async () => {
//     const snap = await getDocs(collection(db, "foods"));
//     const list: Food[] = snap.docs.map((d) => ({
//       id: d.id,
//       ...(d.data() as Omit<Food, "id">),
//     }));
//     setFoods(list);
//   };

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       base64: true,
//       quality: 0.6,
//     });

//     if (!result.canceled && result.assets[0].base64) {
//       setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
//     }
//   };

//   const resetForm = () => {
//     setName("");
//     setDescription("");
//     setPrice("");
//     setImage(null);
//     setEditingId(null);
//   };

//   const saveFood = async () => {
//     if (!name || !description || !price || !image) {
//       Alert.alert("Error", "All fields are required");
//       return;
//     }

//     try {
//       if (editingId) {
//         await updateDoc(doc(db, "foods", editingId), {
//           name,
//           description,
//           price: Number(price),
//           image,
//         });
//         Alert.alert("Updated", "Food updated successfully");
//       } else {
//         await addDoc(collection(db, "foods"), {
//           name,
//           description,
//           price: Number(price),
//           image,
//         });
//         Alert.alert("Success", "Food added successfully");
//       }

//       resetForm();
//       loadFoods();
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     }
//   };

//   const editFood = (food: Food) => {
//     setEditingId(food.id);
//     setName(food.name);
//     setDescription(food.description);
//     setPrice(food.price.toString());
//     setImage(food.image);
//   };

//   const deleteFood = async (id: string) => {
//     Alert.alert("Confirm", "Delete this food item?", [
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
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Manage Food</Text>

//       {/* FORM */}
//       <Input
//         label="Name"
//         value={name}
//         onChangeText={setName}
//         inputStyle={styles.input}
//       />

//       <Input
//         label="Description"
//         value={description}
//         onChangeText={setDescription}
//         inputStyle={styles.input}
//       />

//       <Input
//         label="Price"
//         value={price}
//         onChangeText={setPrice}
//         keyboardType="numeric"
//         inputStyle={styles.input}
//       />

//       <Button
//         title={image ? "Change Image" : "Add Image"}
//         onPress={pickImage}
//         buttonStyle={styles.button}
//       />

//       {image && <Image source={{ uri: image }} style={styles.preview} />}

//       <Button
//         title={editingId ? "Update Food" : "Add Food"}
//         onPress={saveFood}
//         buttonStyle={styles.button}
//       />

//       {/* TABLE */}
//       <Text style={styles.subtitle}>Existing Food</Text>

//       <View style={styles.tableHeader}>
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
//             <Image source={{ uri: item.image }} style={styles.tableImage} />
//             <Text style={styles.cell}>{item.name}</Text>
//             <Text style={styles.cell}>R {item.price}</Text>
//             <View style={styles.actions}>
//               <Icon
//                 name="edit"
//                 type="feather"
//                 color={APP_COLOR}
//                 onPress={() => editFood(item)}
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
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F9F9F9",
//     padding: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 16,
//     color: APP_COLOR,
//   },
//   subtitle: {
//     marginTop: 24,
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   input: {
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: APP_COLOR,
//     marginVertical: 8,
//     borderRadius: 6,
//   },
//   preview: {
//     width: 120,
//     height: 120,
//     alignSelf: "center",
//     marginVertical: 10,
//     borderRadius: 8,
//   },
//   tableHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//     paddingBottom: 6,
//     borderBottomWidth: 1,
//   },
//   headerText: {
//     fontWeight: "bold",
//     width: "25%",
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     borderBottomWidth: 0.5,
//   },
//   tableImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 4,
//   },
//   cell: {
//     width: "25%",
//   },
//   actions: {
//     flexDirection: "row",
//     gap: 10,
//   },
// });















































// import { View, Text, StyleSheet, Image, Alert, ScrollView } from "react-native";
// import { Input, Button } from "react-native-elements";
// import { useEffect, useState } from "react";
// import * as ImagePicker from "expo-image-picker";
// import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
// import { db } from "../../services/firebase";
// import { useLocalSearchParams } from "expo-router";
// import { Picker } from "@react-native-picker/picker";

// const APP_COLOR = "#000";

// const CATEGORIES = [
//   "Starters",
//   "Burgers",
//   "Mains",
//   "Desserts",
//   "Beverages",
//   "Alcohols",
// ];

// export default function ManageFood() {
//   const params = useLocalSearchParams<{
//     id?: string;
//     name?: string;
//     description?: string;
//     price?: string;
//     image?: string;
//     category?: string;
//   }>();

//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [image, setImage] = useState<string | null>(null);
//   const [category, setCategory] = useState(CATEGORIES[0]);

//   useEffect(() => {
//     if (params.id) {
//       setEditingId(params.id);
//       setName(params.name || "");
//       setDescription(params.description || "");
//       setPrice(params.price || "");
//       setImage(params.image || null);
//       setCategory(params.category || CATEGORIES[0]);
//     }
//   }, [params.id]);

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       base64: true,
//       quality: 0.6,
//     });

//     if (!result.canceled && result.assets[0].base64) {
//       setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
//     }
//   };

//   const resetForm = () => {
//     setName("");
//     setDescription("");
//     setPrice("");
//     setImage(null);
//     setEditingId(null);
//     setCategory(CATEGORIES[0]);
//   };

//   const saveFood = async () => {
//     if (!name || !description || !price || !image || !category) {
//       Alert.alert("Error", "All fields are required");
//       return;
//     }

//     try {
//       if (editingId) {
//         await updateDoc(doc(db, "foods", editingId), {
//           name,
//           description,
//           price: Number(price),
//           image,
//           category,
//         });
//         Alert.alert("Updated", "Food updated successfully");
//       } else {
//         await addDoc(collection(db, "foods"), {
//           name,
//           description,
//           price: Number(price),
//           image,
//           category,
//         });
//         Alert.alert("Success", "Food added successfully");
//       }

//       resetForm();
//     } catch (error: any) {
//       Alert.alert("Error", error.message);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>{editingId ? "Update Food" : "Add Food"}</Text>

//       <Input label="Name" value={name} onChangeText={setName} />
//       <Input
//         label="Description"
//         value={description}
//         onChangeText={setDescription}
//       />
//       <Input
//         label="Price"
//         value={price}
//         onChangeText={setPrice}
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Category</Text>
//       <View style={styles.pickerWrapper}>
//         <Picker
//           selectedValue={category}
//           onValueChange={(value) => setCategory(value)}
//         >
//           {CATEGORIES.map((cat) => (
//             <Picker.Item key={cat} label={cat} value={cat} />
//           ))}
//         </Picker>
//       </View>

//       <Button
//         title={image ? "Change Image" : "Add Image"}
//         onPress={pickImage}
//         buttonStyle={styles.button}
//       />

//       {image && <Image source={{ uri: image }} style={styles.preview} />}

//       <Button
//         title={editingId ? "Update Food" : "Add Food"}
//         onPress={saveFood}
//         buttonStyle={styles.button}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F9F9F9",
//     padding: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 16,
//     color: APP_COLOR,
//   },
//   label: {
//     fontSize: 16,
//     marginLeft: 10,
//     marginBottom: 4,
//     fontWeight: "600",
//   },
//   pickerWrapper: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     marginBottom: 16,
//     marginHorizontal: 10,
//   },
//   button: {
//     backgroundColor: APP_COLOR,
//     marginVertical: 8,
//     borderRadius: 6,
//   },
//   preview: {
//     width: 120,
//     height: 120,
//     alignSelf: "center",
//     marginVertical: 10,
//     borderRadius: 8,
//   },
// });




















import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Input, Button, Icon } from "react-native-elements";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";

const APP_COLOR = "#000";

const CATEGORIES = [
  "Starters",
  "Burgers",
  "Mains",
  "Desserts",
  "Beverages",
  "Alcohols",
];

type Food = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function ManageFood() {
  const params = useLocalSearchParams<{ id?: string }>();

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);

  // 🔥 Add-ons via existing foods
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [selectedAddonId, setSelectedAddonId] = useState<string | null>(null);
  const [addons, setAddons] = useState<string[]>([]);

  // 🧅 Removables
  const [removableInput, setRemovableInput] = useState("");
  const [removables, setRemovables] = useState<string[]>([]);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const snap = await getDocs(collection(db, "foods"));
    const list: Food[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Food, "id">),
    }));
    setAllFoods(list);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const addAddon = () => {
    if (!selectedAddonId || addons.includes(selectedAddonId)) return;
    setAddons([...addons, selectedAddonId]);
    setSelectedAddonId(null);
  };

  const addRemovable = () => {
    if (!removableInput) return;
    setRemovables([...removables, removableInput]);
    setRemovableInput("");
  };

  const saveFood = async () => {
    if (!name || !description || !price || !image) {
      Alert.alert("Error", "Name, description, price and image are required");
      return;
    }

    const payload = {
      name,
      description,
      price: Number(price),
      image,
      category,
      addons,
      removables,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "foods", editingId), payload);
        Alert.alert("Updated", "Food updated successfully");
      } else {
        await addDoc(collection(db, "foods"), payload);
        Alert.alert("Success", "Food added successfully");
      }

      resetForm();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
    setCategory(CATEGORIES[0]);
    setAddons([]);
    setRemovables([]);
    setEditingId(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manage Food</Text>

      <Input label="Name" value={name} onChangeText={setName} />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Input
        label="Base Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          {CATEGORIES.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
      </View>

      <Button
        title="Pick Image"
        onPress={pickImage}
        buttonStyle={styles.button}
      />
      {image && <Image source={{ uri: image }} style={styles.preview} />}

      {/* ADD-ONS */}
      <Text style={styles.section}>Add-ons (Existing Foods)</Text>

      <View style={styles.pickerBox}>
        <Picker
          selectedValue={selectedAddonId}
          onValueChange={setSelectedAddonId}
        >
          <Picker.Item label="Select food to add as add-on" value={null} />
          {allFoods.map((f) => (
            <Picker.Item
              key={f.id}
              label={`${f.name} (R ${f.price})`}
              value={f.id}
            />
          ))}
        </Picker>
      </View>

      <Button title="Add as Add-on" onPress={addAddon} />

      {addons.map((id) => {
        const food = allFoods.find((f) => f.id === id);
        if (!food) return null;

        return (
          <View key={id} style={styles.addonCard}>
            <Image source={{ uri: food.image }} style={styles.addonImg} />
            <Text style={styles.addonText}>
              {food.name} – R {food.price}
            </Text>
          </View>
        );
      })}

      {/* REMOVABLES */}
      <Text style={styles.section}>Removable Ingredients</Text>

      <Input
        placeholder="e.g. Lettuce, Onion"
        value={removableInput}
        onChangeText={setRemovableInput}
      />
      <Button title="Add Ingredient" onPress={addRemovable} />

      {removables.map((r, i) => (
        <Text key={i} style={styles.removable}>
          • {r}
        </Text>
      ))}

      <Button
        title="Save Food"
        onPress={saveFood}
        buttonStyle={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9F9F9" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  label: { marginLeft: 10, fontWeight: "600" },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
  },
  button: { backgroundColor: APP_COLOR, marginVertical: 10 },
  preview: { width: 120, height: 120, alignSelf: "center", borderRadius: 8 },
  section: { marginTop: 24, fontSize: 18, fontWeight: "bold" },
  addonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  addonImg: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
  addonText: { fontSize: 15, fontWeight: "500" },
  removable: { marginLeft: 10, marginTop: 4 },
});
