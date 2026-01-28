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

  /* Prefill on edit - FIXED: Using separate useEffect */
  useEffect(() => {
    if (isEditMode && params) {
      // Set basic fields
      if (params.name) setName(String(params.name));
      if (params.description) setDescription(String(params.description));
      if (params.price) setPrice(String(params.price));
      if (params.image) setImage(String(params.image));
      if (params.category) setCategory(String(params.category));

      // Parse addons if they exist
      if (params.addons) {
        try {
          const parsedAddons = JSON.parse(String(params.addons));
          setSelectedAddons(parsedAddons);
        } catch (e) {
          console.log("Error parsing addons:", e);
          setSelectedAddons([]);
        }
      }

      // Parse removables if they exist
      if (params.removables) {
        try {
          const parsedRemovables = JSON.parse(String(params.removables));
          setSelectedRemovables(parsedRemovables);
        } catch (e) {
          console.log("Error parsing removables:", e);
          setSelectedRemovables([]);
        }
      }
    }
  }, [isEditMode, params.id]); // Only depend on isEditMode and id

  const loadAvailableFoods = async () => {
    try {
      const snap = await getDocs(collection(db, "foods"));
      const foodsList = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        price: d.data().price,
        image: d.data().image,
      }));
      setAvailableFoods(foodsList);
    } catch (error) {
      console.error("Error loading foods:", error);
    }
  };

  const loadRemovableItems = async () => {
    try {
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

      setAvailableRemovables(
        Array.from(removablesSet).map((name) => ({ name })),
      );
    } catch (error) {
      console.error("Error loading removables:", error);
    }
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
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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

    try {
      if (isEditMode && params.id) {
        await updateDoc(doc(db, "foods", String(params.id)), payload);
      } else {
        await addDoc(collection(db, "foods"), payload);
      }
      router.back();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving food item");
    }
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
        activeOpacity={0.7}
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
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isSelected && styles.checked]}>
          {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
        <Text>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {isEditMode ? "Update Food" : "Add Food"}
      </Text>

      {/* Image */}
      <TouchableOpacity
        style={styles.imageBox}
        onPress={pickImage}
        activeOpacity={0.8}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text>Select Image</Text>
        )}
      </TouchableOpacity>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter food name"
          placeholderTextColor="#999"
          editable={true}
        />
      </View>

      {/* Description Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description / Ingredients *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={true}
        />
      </View>

      {/* Price Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price (R) *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          placeholderTextColor="#999"
          keyboardType="numeric"
          editable={true}
        />
      </View>

      {/* Category Dropdown */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setCategoryOpen(!categoryOpen)}
        activeOpacity={0.7}
      >
        <Text
          style={
            category ? styles.dropdownSelected : styles.dropdownPlaceholder
          }
        >
          {category || "Select Category"}
        </Text>
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
              activeOpacity={0.7}
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
        activeOpacity={0.7}
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
        activeOpacity={0.7}
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
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={20} color="#000" />
              <Text style={styles.addNewText}>Create New Removable</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.newItemContainer}>
              <TextInput
                style={styles.newItemInput}
                placeholder="Enter removable ingredient name"
                placeholderTextColor="#999"
                value={newRemovableName}
                onChangeText={setNewRemovableName}
                editable={true}
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

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveText}>
          {isEditMode ? "Update Food" : "Add Food"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#000",
  },

  imageBox: {
    height: 160,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
  },

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
    backgroundColor: "#fff",
    color: "#000",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
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

  dropdownPlaceholder: {
    color: "#999",
  },

  dropdownSelected: {
    color: "#000",
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
    paddingVertical: 8,
    paddingRight: 12,
  },

  foodThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
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
    backgroundColor: "#fff",
  },
  checked: {
    backgroundColor: "#000",
  },

  foodName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
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
    backgroundColor: "#fff",
    color: "#000",
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
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
});


























































