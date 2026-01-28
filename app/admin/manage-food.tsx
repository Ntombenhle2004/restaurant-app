// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   Alert,
//   ScrollView,
//   TouchableOpacity,
// } from "react-native";
// import { Input, Button, Icon } from "react-native-elements";
// import { useEffect, useState } from "react";
// import * as ImagePicker from "expo-image-picker";
// import {
//   collection,
//   addDoc,
//   updateDoc,
//   doc,
//   getDocs,
// } from "firebase/firestore";
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

// type Food = {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
// };

// export default function ManageFood() {
//   const params = useLocalSearchParams<{ id?: string }>();

//   const [editingId, setEditingId] = useState<string | null>(null);

//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [image, setImage] = useState<string | null>(null);
//   const [category, setCategory] = useState(CATEGORIES[0]);

//   // 🔥 Add-ons via existing foods
//   const [allFoods, setAllFoods] = useState<Food[]>([]);
//   const [selectedAddonId, setSelectedAddonId] = useState<string | null>(null);
//   const [addons, setAddons] = useState<string[]>([]);

//   // 🧅 Removables
//   const [removableInput, setRemovableInput] = useState("");
//   const [removables, setRemovables] = useState<string[]>([]);

//   useEffect(() => {
//     loadFoods();
//   }, []);

//   const loadFoods = async () => {
//     const snap = await getDocs(collection(db, "foods"));
//     const list: Food[] = snap.docs.map((d) => ({
//       id: d.id,
//       ...(d.data() as Omit<Food, "id">),
//     }));
//     setAllFoods(list);
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

//   const addAddon = () => {
//     if (!selectedAddonId || addons.includes(selectedAddonId)) return;
//     setAddons([...addons, selectedAddonId]);
//     setSelectedAddonId(null);
//   };

//   const addRemovable = () => {
//     if (!removableInput) return;
//     setRemovables([...removables, removableInput]);
//     setRemovableInput("");
//   };

//   const saveFood = async () => {
//     if (!name || !description || !price || !image) {
//       Alert.alert("Error", "Name, description, price and image are required");
//       return;
//     }

//     const payload = {
//       name,
//       description,
//       price: Number(price),
//       image,
//       category,
//       addons,
//       removables,
//     };

//     try {
//       if (editingId) {
//         await updateDoc(doc(db, "foods", editingId), payload);
//         Alert.alert("Updated", "Food updated successfully");
//       } else {
//         await addDoc(collection(db, "foods"), payload);
//         Alert.alert("Success", "Food added successfully");
//       }

//       resetForm();
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     }
//   };

//   const resetForm = () => {
//     setName("");
//     setDescription("");
//     setPrice("");
//     setImage(null);
//     setCategory(CATEGORIES[0]);
//     setAddons([]);
//     setRemovables([]);
//     setEditingId(null);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Manage Food</Text>

//       <Input label="Name" value={name} onChangeText={setName} />
//       <Input
//         label="Description"
//         value={description}
//         onChangeText={setDescription}
//       />
//       <Input
//         label="Base Price"
//         value={price}
//         onChangeText={setPrice}
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Category</Text>
//       <View style={styles.pickerBox}>
//         <Picker selectedValue={category} onValueChange={setCategory}>
//           {CATEGORIES.map((c) => (
//             <Picker.Item key={c} label={c} value={c} />
//           ))}
//         </Picker>
//       </View>

//       <Button
//         title="Pick Image"
//         onPress={pickImage}
//         buttonStyle={styles.button}
//       />
//       {image && <Image source={{ uri: image }} style={styles.preview} />}

//       {/* ADD-ONS */}
//       <Text style={styles.section}>Add-ons (Existing Foods)</Text>

//       <View style={styles.pickerBox}>
//         <Picker
//           selectedValue={selectedAddonId}
//           onValueChange={setSelectedAddonId}
//         >
//           <Picker.Item label="Select food to add as add-on" value={null} />
//           {allFoods.map((f) => (
//             <Picker.Item
//               key={f.id}
//               label={`${f.name} (R ${f.price})`}
//               value={f.id}
//             />
//           ))}
//         </Picker>
//       </View>

//       <Button title="Add as Add-on" onPress={addAddon} />

//       {addons.map((id) => {
//         const food = allFoods.find((f) => f.id === id);
//         if (!food) return null;

//         return (
//           <View key={id} style={styles.addonCard}>
//             <Image source={{ uri: food.image }} style={styles.addonImg} />
//             <Text style={styles.addonText}>
//               {food.name} – R {food.price}
//             </Text>
//           </View>
//         );
//       })}

//       {/* REMOVABLES */}
//       <Text style={styles.section}>Removable Ingredients</Text>

//       <Input
//         placeholder="e.g. Lettuce, Onion"
//         value={removableInput}
//         onChangeText={setRemovableInput}
//       />
//       <Button title="Add Ingredient" onPress={addRemovable} />

//       {removables.map((r, i) => (
//         <Text key={i} style={styles.removable}>
//           • {r}
//         </Text>
//       ))}

//       <Button
//         title="Save Food"
//         onPress={saveFood}
//         buttonStyle={styles.button}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "#F9F9F9" },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 16,
//   },
//   label: { marginLeft: 10, fontWeight: "600" },
//   pickerBox: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   button: { backgroundColor: APP_COLOR, marginVertical: 10 },
//   preview: { width: 120, height: 120, alignSelf: "center", borderRadius: 8 },
//   section: { marginTop: 24, fontSize: 18, fontWeight: "bold" },
//   addonCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   addonImg: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
//   addonText: { fontSize: 15, fontWeight: "500" },
//   removable: { marginLeft: 10, marginTop: 4 },
// });










































import { View, Text, StyleSheet, Image, Alert, ScrollView } from "react-native";
import { Input, Button, CheckBox } from "react-native-elements";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  // 🧠 Core state (NEVER conditional)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);

  // ➕ Add-ons
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [addons, setAddons] = useState<string[]>([]);

  // ➖ Removables
  const [removableInput, setRemovableInput] = useState("");
  const [removables, setRemovables] = useState<string[]>([]);

  // 🔄 Load foods for add-ons
  useEffect(() => {
    const loadFoods = async () => {
      const snap = await getDocs(collection(db, "foods"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Food, "id">),
      }));
      setAllFoods(list);
    };

    loadFoods();
  }, []);

  // ✏️ Load food when editing (SAFE)
  useEffect(() => {
    if (!params.id) return;

    const loadFoodForEdit = async () => {
      const ref = doc(db, "foods", params.id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const data = snap.data();

      setEditingId(params.id as string);
      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setPrice(String(data.price ?? ""));
      setImage(data.image ?? null);
      setCategory(data.category ?? CATEGORIES[0]);
      setAddons(data.addons ?? []);
      setRemovables(data.removables ?? []);
    };

    loadFoodForEdit();
  }, [params.id]);

  // 🖼 Pick image (base64 for now)
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // ➕ Toggle add-on checkbox
  const toggleAddon = (id: string) => {
    setAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  // ➖ Add removable ingredient
  const addRemovable = () => {
    if (!removableInput.trim()) return;
    setRemovables([...removables, removableInput.trim()]);
    setRemovableInput("");
  };

  // 💾 Save food
  const saveFood = async () => {
    if (!name || !description || !price || !image) {
      Alert.alert("Error", "All fields are required");
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

      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{editingId ? "Update Food" : "Add Food"}</Text>

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

      <Button title="Pick Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.preview} />}

      {/* ADD-ONS */}
      <Text style={styles.section}>Add-ons</Text>
      {allFoods
        .filter((f) => f.id !== editingId)
        .map((food) => (
          <CheckBox
            key={food.id}
            title={`${food.name} (R ${food.price})`}
            checked={addons.includes(food.id)}
            onPress={() => toggleAddon(food.id)}
          />
        ))}

      {/* REMOVABLES */}
      <Text style={styles.section}>Removable Ingredients</Text>
      <Input
        placeholder="e.g. Lettuce"
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
        title={editingId ? "Update Food" : "Save Food"}
        onPress={saveFood}
        buttonStyle={styles.saveBtn}
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
  label: { marginLeft: 10, fontWeight: "600", marginBottom: 4 },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
  },
  preview: {
    width: 120,
    height: 120,
    alignSelf: "center",
    borderRadius: 8,
    marginVertical: 10,
  },
  section: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  removable: { marginLeft: 10, marginTop: 4 },
  saveBtn: { backgroundColor: APP_COLOR, marginVertical: 20 },
});
