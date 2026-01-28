import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { Ionicons } from "@expo/vector-icons";

type FoodItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type RemovableItem = {
  name: string;
};

export default function ManageFood() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const isEditMode = !!params.id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState("");

  const [addonsOpen, setAddonsOpen] = useState(false);
  const [removableOpen, setRemovableOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Available foods to choose as add-ons
  const [availableFoods, setAvailableFoods] = useState<FoodItem[]>([]);

  // Selected add-ons (food items)
  const [selectedAddons, setSelectedAddons] = useState<FoodItem[]>([]);

  // Removable items
  const [newRemovableName, setNewRemovableName] = useState("");
  const [showNewRemovableInput, setShowNewRemovableInput] = useState(false);
  const [availableRemovables, setAvailableRemovables] = useState<
    RemovableItem[]
  >([]);
  const [selectedRemovables, setSelectedRemovables] = useState<RemovableItem[]>(
    [],
  );

  const CATEGORIES = [
    "Burgers",
    "Pizza",
    "Pasta",
    "Salads",
    "Desserts",
    "Drinks",
    "Appetizers",
    "Main Course",
  ];

  /* Load all existing foods from Firebase */
  useEffect(() => {
    loadAvailableFoods();
    loadRemovableItems();
  }, []);

  /* Prefill on edit */
  useEffect(() => {
    if (isEditMode) {
      setName((params.name as string) || "");
      setDescription((params.description as string) || "");
      setPrice((params.price as string) || "");
      setImage((params.image as string) || null);
      setCategory((params.category as string) || "");

      // Parse addons if they exist
      if (params.addons) {
        try {
          setSelectedAddons(JSON.parse(params.addons as string));
        } catch (e) {
          setSelectedAddons([]);
        }
      }

      // Parse removables if they exist
      if (params.removables) {
        try {
          setSelectedRemovables(JSON.parse(params.removables as string));
        } catch (e) {
          setSelectedRemovables([]);
        }
      }
    }
  }, [params]);

  const loadAvailableFoods = async () => {
    const snap = await getDocs(collection(db, "foods"));
    const foodsList = snap.docs.map((d) => ({
      id: d.id,
      name: d.data().name,
      price: d.data().price,
      image: d.data().image,
    }));
    setAvailableFoods(foodsList);
  };

  const loadRemovableItems = async () => {
    const snap = await getDocs(collection(db, "foods"));
    const removablesSet = new Set<string>();

    snap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.removables && Array.isArray(data.removables)) {
        data.removables.forEach((removable: RemovableItem) => {
          if (removable.name) removablesSet.add(removable.name);
        });
      }
    });

    setAvailableRemovables(Array.from(removablesSet).map((name) => ({ name })));
  };

  const toggleAddon = (food: FoodItem) => {
    const isSelected = selectedAddons.some((item) => item.id === food.id);

    if (isSelected) {
      setSelectedAddons(selectedAddons.filter((item) => item.id !== food.id));
    } else {
      setSelectedAddons([...selectedAddons, food]);
    }
  };

  const toggleRemovable = (item: RemovableItem) => {
    const isSelected = selectedRemovables.some((i) => i.name === item.name);

    if (isSelected) {
      setSelectedRemovables(
        selectedRemovables.filter((i) => i.name !== item.name),
      );
    } else {
      setSelectedRemovables([...selectedRemovables, item]);
    }
  };

  const addNewRemovable = () => {
    if (newRemovableName.trim()) {
      const newRemovable = { name: newRemovableName.trim() };

      if (!availableRemovables.some((r) => r.name === newRemovable.name)) {
        setAvailableRemovables([...availableRemovables, newRemovable]);
      }

      if (!selectedRemovables.some((r) => r.name === newRemovable.name)) {
        setSelectedRemovables([...selectedRemovables, newRemovable]);
      }

      setNewRemovableName("");
      setShowNewRemovableInput(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

   if (!result.canceled && result.assets[0].base64) {
     setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
   }
  };

  const handleSave = async () => {
    if (!name || !description || !price || !image) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      name,
      description,
      price: Number(price),
      image,
      category,
      addons: selectedAddons,
      removables: selectedRemovables,
    };

    if (isEditMode && params.id) {
      await updateDoc(doc(db, "foods", params.id as string), payload);
    } else {
      await addDoc(collection(db, "foods"), payload);
    }

    router.back();
  };

  const renderFoodCheckbox = (food: FoodItem) => {
    const isSelected = selectedAddons.some((item) => item.id === food.id);

    // Don't show current food in add-ons list when editing
    if (isEditMode && params.id === food.id) {
      return null;
    }

    return (
      <TouchableOpacity
        key={food.id}
        style={styles.foodRow}
        onPress={() => toggleAddon(food)}
      >
        <View style={[styles.checkbox, isSelected && styles.checked]}>
          {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
        <Image source={{ uri: food.image }} style={styles.foodThumbnail} />
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodPrice}>R {food.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRemovableCheckbox = (item: RemovableItem) => {
    const isSelected = selectedRemovables.some((i) => i.name === item.name);

    return (
      <TouchableOpacity
        key={item.name}
        style={styles.row}
        onPress={() => toggleRemovable(item)}
      >
        <View style={[styles.checkbox, isSelected && styles.checked]}>
          {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
        <Text>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isEditMode ? "Update Food" : "Add Food"}
      </Text>

      {/* Image */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text>Select Image</Text>
        )}
      </TouchableOpacity>

      {/* Using TextInput directly instead of InputField to avoid restriction issues */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter food name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description / Ingredients</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price (R)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          keyboardType="numeric"
        />
      </View>

      {/* Category Dropdown */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setCategoryOpen(!categoryOpen)}
      >
        <Text>{category || "Select Category"}</Text>
        <Ionicons
          name={categoryOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#000"
        />
      </TouchableOpacity>
      {categoryOpen && (
        <View style={styles.dropdownContent}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.row}
              onPress={() => {
                setCategory(cat);
                setCategoryOpen(false);
              }}
            >
              <View
                style={[styles.checkbox, category === cat && styles.checked]}
              >
                {category === cat && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Add-ons Dropdown - Shows existing food items with images */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setAddonsOpen(!addonsOpen)}
      >
        <Text>
          Add-ons - Choose Food Items ({selectedAddons.length} selected)
        </Text>
        <Ionicons
          name={addonsOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#000"
        />
      </TouchableOpacity>
      {addonsOpen && (
        <View style={styles.dropdownContent}>
          {availableFoods.length === 0 ? (
            <Text style={styles.emptyText}>
              No food items available yet. Add some food first!
            </Text>
          ) : (
            availableFoods.map((food) => renderFoodCheckbox(food))
          )}
        </View>
      )}

      {/* Removables Dropdown */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setRemovableOpen(!removableOpen)}
      >
        <Text>
          Removable Ingredients ({selectedRemovables.length} selected)
        </Text>
        <Ionicons
          name={removableOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#000"
        />
      </TouchableOpacity>
      {removableOpen && (
        <View style={styles.dropdownContent}>
          {availableRemovables.map((r) => renderRemovableCheckbox(r))}

          {/* Add new removable button */}
          {!showNewRemovableInput ? (
            <TouchableOpacity
              style={styles.addNewBtn}
              onPress={() => setShowNewRemovableInput(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#000" />
              <Text style={styles.addNewText}>Create New Removable</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.newItemContainer}>
              <TextInput
                style={styles.newItemInput}
                placeholder="Enter removable ingredient name"
                value={newRemovableName}
                onChangeText={setNewRemovableName}
              />
              <TouchableOpacity
                style={styles.saveNewBtn}
                onPress={addNewRemovable}
              >
                <Text style={styles.saveNewText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelNewBtn}
                onPress={() => {
                  setShowNewRemovableInput(false);
                  setNewRemovableName("");
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>
          {isEditMode ? "Update Food" : "Add Food"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

  imageBox: {
    height: 160,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },

  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  dropdownContent: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderTopWidth: 0,
    borderRadius: 6,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 8,
    backgroundColor: "#f9f9f9",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingLeft: 12,
    paddingVertical: 6,
  },

  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingLeft: 12,
    paddingVertical: 6,
    paddingRight: 12,
  },

  foodThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },

  foodInfo: {
    flex: 1,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#000",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
  },
  checked: { backgroundColor: "#000" },

  foodName: {
    fontSize: 15,
    fontWeight: "500",
  },

  foodPrice: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginTop: 2,
  },

  emptyText: {
    textAlign: "center",
    color: "#999",
    padding: 16,
    fontStyle: "italic",
  },

  addNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingLeft: 12,
    gap: 8,
  },
  addNewText: {
    color: "#000",
    fontWeight: "600",
  },

  newItemContainer: {
    marginTop: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  newItemInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  saveNewBtn: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 8,
  },
  saveNewText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelNewBtn: {
    padding: 10,
    alignItems: "center",
  },

  saveBtn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});









































// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ScrollView,
// } from "react-native";
// import { useEffect, useState } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import * as ImagePicker from "expo-image-picker";
// import InputField from "../components/InputField";
// import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
// import { db } from "../../services/firebase";

// type Option = {
//   name: string;
// };

// export default function ManageFood() {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const food = params.food ? JSON.parse(params.food as string) : null;

//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [image, setImage] = useState<string | null>(null);

//   const [addonsOpen, setAddonsOpen] = useState(false);
//   const [removableOpen, setRemovableOpen] = useState(false);

//   const ADDONS: Option[] = [
//     { name: "Cheese" },
//     { name: "Sauce" },
//     { name: "Extra Meat" },
//   ];

//   const REMOVABLES: Option[] = [
//     { name: "Onions" },
//     { name: "Tomato" },
//     { name: "Pickles" },
//   ];

//   const [selectedAddons, setSelectedAddons] = useState<Option[]>([]);
//   const [selectedRemovables, setSelectedRemovables] = useState<Option[]>([]);

//   /* Prefill on edit */
//   useEffect(() => {
//     if (food) {
//       setName(food.name);
//       setDescription(food.description);
//       setPrice(String(food.price));
//       setImage(food.image);
//       setSelectedAddons(food.addons || []);
//       setSelectedRemovables(food.removables || []);
//     }
//   }, []);

//   const toggleItem = (
//     item: Option,
//     list: Option[],
//     setList: (v: Option[]) => void,
//   ) => {
//     setList(
//       list.some((i) => i.name === item.name)
//         ? list.filter((i) => i.name !== item.name)
//         : [...list, item],
//     );
//   };

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const handleSave = async () => {
//     if (!name || !description || !price || !image) return;

//     const payload = {
//       name,
//       description,
//       price: Number(price),
//       image,
//       addons: selectedAddons,
//       removables: selectedRemovables,
//     };

//     if (food) {
//       await updateDoc(doc(db, "foods", food.id), payload);
//     } else {
//       await addDoc(collection(db, "foods"), payload);
//     }

//     router.back(); // list re-renders
//   };

//   const renderCheckbox = (
//     item: Option,
//     selected: Option[],
//     toggle: () => void,
//   ) => {
//     const checked = selected.some((i) => i.name === item.name);
//     return (
//       <TouchableOpacity key={item.name} style={styles.row} onPress={toggle}>
//         <View style={[styles.checkbox, checked && styles.checked]} />
//         <Text>{item.name}</Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>{food ? "Update Food" : "Add Food"}</Text>

//       {/* Image */}
//       <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
//         {image ? (
//           <Image source={{ uri: image }} style={styles.image} />
//         ) : (
//           <Text>Select Image</Text>
//         )}
//       </TouchableOpacity>

//       <InputField label="Name" value={name} onChangeText={setName} />
//       <InputField
//         label="Description / Ingredients"
//         value={description}
//         onChangeText={setDescription}
//       />
//       <InputField label="Price (R)" value={price} onChangeText={setPrice} />

//       {/* Add-ons */}
//       <TouchableOpacity
//         style={styles.dropdown}
//         onPress={() => setAddonsOpen(!addonsOpen)}
//       >
//         <Text>Add-ons</Text>
//       </TouchableOpacity>
//       {addonsOpen &&
//         ADDONS.map((a) =>
//           renderCheckbox(a, selectedAddons, () =>
//             toggleItem(a, selectedAddons, setSelectedAddons),
//           ),
//         )}

//       {/* Removables */}
//       <TouchableOpacity
//         style={styles.dropdown}
//         onPress={() => setRemovableOpen(!removableOpen)}
//       >
//         <Text>Removable Ingredients</Text>
//       </TouchableOpacity>
//       {removableOpen &&
//         REMOVABLES.map((r) =>
//           renderCheckbox(r, selectedRemovables, () =>
//             toggleItem(r, selectedRemovables, setSelectedRemovables),
//           ),
//         )}

//       <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//         <Text style={styles.saveText}>{food ? "Update Food" : "Add Food"}</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, backgroundColor: "#fff" },
//   title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

//   imageBox: {
//     height: 160,
//     borderWidth: 1,
//     borderColor: "#000",
//     borderRadius: 8,
//     marginBottom: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     overflow: "hidden",
//   },
//   image: { width: "100%", height: "100%" },

//   dropdown: {
//     borderWidth: 1,
//     borderColor: "#000",
//     padding: 12,
//     borderRadius: 6,
//     marginTop: 12,
//   },

//   row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
//   checkbox: {
//     width: 18,
//     height: 18,
//     borderWidth: 1,
//     borderColor: "#000",
//     marginRight: 10,
//   },
//   checked: { backgroundColor: "#000" },

//   saveBtn: {
//     backgroundColor: "#000",
//     padding: 14,
//     borderRadius: 8,
//     marginTop: 24,
//     alignItems: "center",
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
// });
