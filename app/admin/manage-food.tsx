import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
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
  description: string;
  category: string;
  addons?: FoodItem[];
  removables?: RemovableItem[];
};

type RemovableItem = {
  name: string;
};

export default function ManageFood() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState("");

  const [addonsOpen, setAddonsOpen] = useState(false);
  const [removableOpen, setRemovableOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [availableRemovables, setAvailableRemovables] = useState<
    RemovableItem[]
  >([]);
  const [selectedAddons, setSelectedAddons] = useState<FoodItem[]>([]);
  const [selectedRemovables, setSelectedRemovables] = useState<RemovableItem[]>(
    [],
  );
  const [newRemovableName, setNewRemovableName] = useState("");

  const CATEGORIES = [
    "Burgers",
    "Pizza",
    "Pasta",
    "Seafood",
    "Salads",
    "Desserts",
    "Drinks",
    "combos",
  ];

  const loadFoods = async () => {
    try {
      const snap = await getDocs(collection(db, "foods"));
      const foodsList = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FoodItem, "id">),
      }));
      setFoods(foodsList);
      loadRemovableItems(foodsList);
    } catch (error) {
      console.error("Error loading:", error);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);
  useFocusEffect(
    useCallback(() => {
      loadFoods();
    }, []),
  );

  const loadRemovableItems = (foodsList: FoodItem[]) => {
    const removablesSet = new Set<string>();
    foodsList.forEach((food) => {
      food.removables?.forEach((r) => r.name && removablesSet.add(r.name));
    });
    setAvailableRemovables(Array.from(removablesSet).map((name) => ({ name })));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setImageUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    if (!name || !description || !price || !imageUri) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    setUploading(true);
    try {
      const payload = {
        name,
        description,
        price: Number(price),
        image: imageUri,
        category,
        addons: selectedAddons,
        removables: selectedRemovables,
      };

      if (isEditMode && currentEditId) {
        await updateDoc(doc(db, "foods", currentEditId), payload);
        setFoods(
          foods.map((f) =>
            f.id === currentEditId ? { ...payload, id: currentEditId } : f,
          ),
        );
      } else {
        const docRef = await addDoc(collection(db, "foods"), payload);
        setFoods([...foods, { ...payload, id: docRef.id }]);
      }
      closeModal();
    } catch (e) {
      Alert.alert("Error", "Save failed");
    } finally {
      setUploading(false);
    }
  };

  const performDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "foods", id));
      setFoods((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      Alert.alert("Error", "Delete failed");
    }
  };

  const deleteFood = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Delete this food item?")) {
        performDelete(id);
      }
    } else {
      Alert.alert("Confirm", "Delete this food item?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => performDelete(id),
        },
      ]);
    }
  };

  const openEditModal = (food: FoodItem) => {
    setIsEditMode(true);
    setCurrentEditId(food.id);
    setName(food.name);
    setDescription(food.description);
    setPrice(food.price.toString());
    setImageUri(food.image);
    setCategory(food.category || "");
    setSelectedAddons(food.addons || []);
    setSelectedRemovables(food.removables || []);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setName("");
    setDescription("");
    setPrice("");
    setImageUri(null);
    setCategory("");
    setSelectedAddons([]);
    setSelectedRemovables([]);
    setAddonsOpen(false);
    setRemovableOpen(false);
    setCategoryOpen(false);
  };

  const toggleAddon = (food: FoodItem) => {
    const exists = selectedAddons.some((item) => item.id === food.id);
    setSelectedAddons(
      exists
        ? selectedAddons.filter((item) => item.id !== food.id)
        : [...selectedAddons, food],
    );
  };

  const toggleRemovable = (item: RemovableItem) => {
    const exists = selectedRemovables.some((i) => i.name === item.name);
    setSelectedRemovables(
      exists
        ? selectedRemovables.filter((i) => i.name !== item.name)
        : [...selectedRemovables, item],
    );
  };

  const renderFoodCheckbox = (food: FoodItem) => {
    if (isEditMode && currentEditId === food.id) return null;
    const isSelected = selectedAddons.some((item) => item.id === food.id);
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

  return (
    <View style={styles.container}>
      {/* Header Updated to Column */}
  <View style={styles.header}>
          <Text style={styles.brandTitle}>MANAGE FOOD</Text>
          <View style={styles.dividerGold} />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setIsEditMode(false);
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>Add food</Text>
        </TouchableOpacity>
     

      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listRow}>
            <Image source={{ uri: item.image }} style={styles.listImage} />
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{item.name}</Text>
              <Text style={styles.listPrice}>R {item.price}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Ionicons name="create-outline" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteFood(item.id)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditMode ? "Update Food" : "Add Food"}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={28} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <Text>Select Image</Text>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name *"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description *"
            multiline
          />
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Price (R) *"
            keyboardType="numeric"
          />

          {/* Category Dropdown */}
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setCategoryOpen(!categoryOpen)}
          >
            <Text>{category || "Select Category"}</Text>
            <Ionicons
              name={categoryOpen ? "chevron-up" : "chevron-down"}
              size={20}
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
                    style={[
                      styles.checkbox,
                      category === cat && styles.checked,
                    ]}
                  >
                    {category === cat && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                  <Text>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setAddonsOpen(!addonsOpen)}
          >
            <Text>Add-ons ({selectedAddons.length} selected)</Text>
            <Ionicons
              name={addonsOpen ? "chevron-up" : "chevron-down"}
              size={20}
            />
          </TouchableOpacity>
          {addonsOpen && (
            <View style={styles.dropdownContent}>
              {foods.map(renderFoodCheckbox)}
            </View>
          )}

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setRemovableOpen(!removableOpen)}
          >
            <Text>Removables ({selectedRemovables.length} selected)</Text>
            <Ionicons
              name={removableOpen ? "chevron-up" : "chevron-down"}
              size={20}
            />
          </TouchableOpacity>
          {removableOpen && (
            <View style={styles.dropdownContent}>
              {availableRemovables.map((r) => (
                <TouchableOpacity
                  key={r.name}
                  style={styles.row}
                  onPress={() => toggleRemovable(r)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedRemovables.some((sr) => sr.name === r.name) &&
                        styles.checked,
                    ]}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                  <Text>{r.name}</Text>
                </TouchableOpacity>
              ))}
              <TextInput
                style={styles.newItemInput}
                value={newRemovableName}
                onChangeText={setNewRemovableName}
                placeholder="New ingredient..."
              />
              <TouchableOpacity
                style={styles.saveNewBtn}
                onPress={() => {
                  if (newRemovableName) {
                    const newItem = { name: newRemovableName };
                    setAvailableRemovables([...availableRemovables, newItem]);
                    setSelectedRemovables([...selectedRemovables, newItem]);
                    setNewRemovableName("");
                  }
                }}
              >
                <Text style={{ color: "#fff" }}>Add New</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, uploading && { backgroundColor: "#666" }]}
            onPress={handleSave}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>
                {isEditMode ? "Update Food" : "Add Food"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FAFAFA" },
  header: { alignItems: "center", marginTop: 1, marginBottom: 2 },
  brandTitle: { fontSize: 24, letterSpacing: 6, fontWeight: "300" },
  dividerGold: {
    width: 80,
    height: 2,
    backgroundColor: "#9c8966",
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "black",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom:10,
    marginTop:10,
    alignSelf: "flex-end", // <--- This pushes the button to the right
  },
  title: { fontSize: 28, fontWeight: "700", textTransform: "lowercase" },

  addButtonText: {
    color: "#fff", // White text
    fontWeight: "600",
  },
  listRow: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "solid",
  },
  listImage: { width: 50, height: 50, borderRadius: 6, marginRight: 12 },
  listInfo: { flex: 1 },
  listName: { fontWeight: "600" },
  listPrice: { color: "#666" },
  actions: { flexDirection: "row", gap: 15 },
  modalContainer: { padding: 16, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "700" },
  imageBox: {
    height: 160,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  imagePreview: { width: "100%", height: "100%" },
  input: { borderWidth: 1, borderRadius: 6, padding: 12, marginBottom: 12 },
  textArea: { height: 80 },
  dropdown: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownContent: {
    borderWidth: 1,
    borderTopWidth: 0,
    padding: 8,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  foodThumbnail: { width: 40, height: 40, borderRadius: 4, marginRight: 10 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 14, fontWeight: "500" },
  foodPrice: { fontSize: 12, color: "#666" },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    marginRight: 12,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: { backgroundColor: "#000" },
  newItemInput: { borderWidth: 1, padding: 8, borderRadius: 4, marginTop: 10 },
  saveNewBtn: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 4,
    marginTop: 5,
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});