// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   TextInput,
//   Alert,
//   FlatList,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import { useEffect, useState, useCallback } from "react";
// import { useFocusEffect } from "expo-router";
// import * as ImagePicker from "expo-image-picker";
// import {
//   collection,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
//   getDocs,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { db, storage } from "../../services/firebase";
// import { Ionicons } from "@expo/vector-icons";

// type FoodItem = {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
//   description: string;
//   category: string;
//   addons?: FoodItem[];
//   removables?: RemovableItem[];
// };

// type RemovableItem = {
//   name: string;
// };

// export default function ManageFood() {
//   // Modal state
//   const [modalVisible, setModalVisible] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [currentEditId, setCurrentEditId] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);

//   // Form states
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [image, setImage] = useState<string | null>(null);
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [category, setCategory] = useState("");

//   // Dropdown states
//   const [addonsOpen, setAddonsOpen] = useState(false);
//   const [removableOpen, setRemovableOpen] = useState(false);
//   const [categoryOpen, setCategoryOpen] = useState(false);

//   // Food list state
//   const [foods, setFoods] = useState<FoodItem[]>([]);

//   // Available foods to choose as add-ons
//   const [availableFoods, setAvailableFoods] = useState<FoodItem[]>([]);

//   // Selected add-ons (food items)
//   const [selectedAddons, setSelectedAddons] = useState<FoodItem[]>([]);

//   // Removable items
//   const [newRemovableName, setNewRemovableName] = useState("");
//   const [showNewRemovableInput, setShowNewRemovableInput] = useState(false);
//   const [availableRemovables, setAvailableRemovables] = useState<
//     RemovableItem[]
//   >([]);
//   const [selectedRemovables, setSelectedRemovables] = useState<RemovableItem[]>(
//     [],
//   );

//   const CATEGORIES = [
//     "Burgers",
//     "Pizza",
//     "Pasta",
//     "Salads",
//     "Desserts",
//     "Drinks",
//     "Appetizers",
//     "Main Course",
//   ];

//   useEffect(() => {
//     loadFoods();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       loadFoods();
//     }, []),
//   );

//   const loadFoods = async () => {
//     try {
//       const snap = await getDocs(collection(db, "foods"));
//       const foodsList = snap.docs.map((d) => ({
//         id: d.id,
//         ...(d.data() as Omit<FoodItem, "id">),
//       }));
//       setFoods(foodsList);
//       setAvailableFoods(foodsList);
//       loadRemovableItems(foodsList);
//     } catch (error) {
//       console.error("Error loading foods:", error);
//     }
//   };

//   const loadRemovableItems = (foodsList: FoodItem[]) => {
//     try {
//       const removablesSet = new Set<string>();

//       foodsList.forEach((food) => {
//         if (food.removables && Array.isArray(food.removables)) {
//           food.removables.forEach((removable: RemovableItem) => {
//             if (removable.name) removablesSet.add(removable.name);
//           });
//         }
//       });

//       setAvailableRemovables(
//         Array.from(removablesSet).map((name) => ({ name })),
//       );
//     } catch (error) {
//       console.error("Error loading removables:", error);
//     }
//   };

//   const uploadImageToFirebase = async (uri: string): Promise<string> => {
//     try {
//       const response = await fetch(uri);
//       const blob = await response.blob();

//       const filename = `food-images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
//       const storageRef = ref(storage, filename);

//       await uploadBytes(storageRef, blob);
//       const downloadURL = await getDownloadURL(storageRef);

//       return downloadURL;
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       throw error;
//     }
//   };

//   const openAddModal = () => {
//     resetForm();
//     setIsEditMode(false);
//     setCurrentEditId(null);
//     setModalVisible(true);
//   };

//   const openEditModal = (food: FoodItem) => {
//     setIsEditMode(true);
//     setCurrentEditId(food.id);
//     setName(food.name);
//     setDescription(food.description);
//     setPrice(food.price.toString());
//     setImage(food.image);
//     setImageUri(food.image);
//     setCategory(food.category || "");
//     setSelectedAddons(food.addons || []);
//     setSelectedRemovables(food.removables || []);
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     resetForm();
//   };

//   const resetForm = () => {
//     setName("");
//     setDescription("");
//     setPrice("");
//     setImage(null);
//     setImageUri(null);
//     setCategory("");
//     setSelectedAddons([]);
//     setSelectedRemovables([]);
//     setAddonsOpen(false);
//     setRemovableOpen(false);
//     setCategoryOpen(false);
//     setShowNewRemovableInput(false);
//     setNewRemovableName("");
//   };

//   const deleteFood = (id: string) => {
//     Alert.alert(
//       "Confirm",
//       "Delete this food item?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await deleteDoc(doc(db, "foods", id));
//               await loadFoods();
//               Alert.alert("Success", "Food deleted successfully!");
//             } catch (error) {
//               console.error("Error deleting food:", error);
//               Alert.alert("Error", "Error deleting food item");
//             }
//           },
//         },
//       ],
//       { cancelable: true },
//     );
//   };

//   const toggleAddon = (food: FoodItem) => {
//     const isSelected = selectedAddons.some((item) => item.id === food.id);

//     if (isSelected) {
//       setSelectedAddons(selectedAddons.filter((item) => item.id !== food.id));
//     } else {
//       setSelectedAddons([...selectedAddons, food]);
//     }
//   };

//   const toggleRemovable = (item: RemovableItem) => {
//     const isSelected = selectedRemovables.some((i) => i.name === item.name);

//     if (isSelected) {
//       setSelectedRemovables(
//         selectedRemovables.filter((i) => i.name !== item.name),
//       );
//     } else {
//       setSelectedRemovables([...selectedRemovables, item]);
//     }
//   };

//   const addNewRemovable = () => {
//     if (newRemovableName.trim()) {
//       const newRemovable = { name: newRemovableName.trim() };

//       if (!availableRemovables.some((r) => r.name === newRemovable.name)) {
//         setAvailableRemovables([...availableRemovables, newRemovable]);
//       }

//       if (!selectedRemovables.some((r) => r.name === newRemovable.name)) {
//         setSelectedRemovables([...selectedRemovables, newRemovable]);
//       }

//       setNewRemovableName("");
//       setShowNewRemovableInput(false);
//     }
//   };

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       setImageUri(result.assets[0].uri);
//       setImage(result.assets[0].uri);
//     }
//   };

//   const handleSave = async () => {
//     if (!name || !description || !price || !imageUri) {
//       Alert.alert("Error", "Please fill all required fields");
//       return;
//     }

//     setUploading(true);

//     try {
//       let imageUrl = image;

//       // If it's a new image (local URI), upload it to Firebase Storage
//       if (imageUri && imageUri.startsWith("file://")) {
//         imageUrl = await uploadImageToFirebase(imageUri);
//       }

//       const payload = {
//         name,
//         description,
//         price: Number(price),
//         image: imageUrl,
//         category,
//         addons: selectedAddons,
//         removables: selectedRemovables,
//       };

//       if (isEditMode && currentEditId) {
//         await updateDoc(doc(db, "foods", currentEditId), payload);
//         closeModal();
//         await loadFoods();
//         Alert.alert("Success", "Food updated successfully!");
//       } else {
//         await addDoc(collection(db, "foods"), payload);
//         closeModal();
//         await loadFoods();
//         Alert.alert("Success", "Food added successfully!");
//       }
//     } catch (error) {
//       console.error("Error saving:", error);
//       Alert.alert("Error", "Error saving food item");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const renderFoodCheckbox = (food: FoodItem) => {
//     const isSelected = selectedAddons.some((item) => item.id === food.id);

//     // Don't show current food in add-ons list when editing
//     if (isEditMode && currentEditId === food.id) {
//       return null;
//     }

//     return (
//       <TouchableOpacity
//         key={food.id}
//         style={styles.foodRow}
//         onPress={() => toggleAddon(food)}
//         activeOpacity={0.7}
//       >
//         <View style={[styles.checkbox, isSelected && styles.checked]}>
//           {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
//         </View>
//         <Image source={{ uri: food.image }} style={styles.foodThumbnail} />
//         <View style={styles.foodInfo}>
//           <Text style={styles.foodName}>{food.name}</Text>
//           <Text style={styles.foodPrice}>R {food.price}</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderRemovableCheckbox = (item: RemovableItem) => {
//     const isSelected = selectedRemovables.some((i) => i.name === item.name);

//     return (
//       <TouchableOpacity
//         key={item.name}
//         style={styles.row}
//         onPress={() => toggleRemovable(item)}
//         activeOpacity={0.7}
//       >
//         <View style={[styles.checkbox, isSelected && styles.checked]}>
//           {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
//         </View>
//         <Text>{item.name}</Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.title}>manage food</Text>
//         <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
//           <Text style={styles.addButtonText}>Add food</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.sectionTitle}>food</Text>

//       {/* Food List */}
//       <FlatList
//         data={foods}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.listRow}>
//             <Image source={{ uri: item.image }} style={styles.listImage} />
//             <View style={styles.listInfo}>
//               <Text style={styles.listName}>{item.name}</Text>
//               <Text style={styles.listPrice}>R {item.price}</Text>
//             </View>

//             <View style={styles.actions}>
//               <TouchableOpacity onPress={() => openEditModal(item)}>
//                 <Ionicons name="create-outline" size={20} color="#000" />
//               </TouchableOpacity>

//               <TouchableOpacity onPress={() => deleteFood(item.id)}>
//                 <Ionicons name="trash-outline" size={20} color="red" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />

//       {/* Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={closeModal}
//       >
//         <ScrollView
//           contentContainerStyle={styles.modalContainer}
//           keyboardShouldPersistTaps="handled"
//         >
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>
//               {isEditMode ? "Update Food" : "Add Food"}
//             </Text>
//             <TouchableOpacity onPress={closeModal}>
//               <Ionicons name="close" size={28} color="#000" />
//             </TouchableOpacity>
//           </View>

//           {/* Image */}
//           <TouchableOpacity
//             style={styles.imageBox}
//             onPress={pickImage}
//             activeOpacity={0.8}
//             disabled={uploading}
//           >
//             {imageUri ? (
//               <Image source={{ uri: imageUri }} style={styles.imagePreview} />
//             ) : (
//               <Text>Select Image</Text>
//             )}
//           </TouchableOpacity>

//           {/* Name Input */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Name *</Text>
//             <TextInput
//               style={styles.input}
//               value={name}
//               onChangeText={setName}
//               placeholder="Enter food name"
//               placeholderTextColor="#999"
//               editable={!uploading}
//             />
//           </View>

//           {/* Description Input */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Description / Ingredients *</Text>
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               value={description}
//               onChangeText={setDescription}
//               placeholder="Enter description"
//               placeholderTextColor="#999"
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//               editable={!uploading}
//             />
//           </View>

//           {/* Price Input */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Price (R) *</Text>
//             <TextInput
//               style={styles.input}
//               value={price}
//               onChangeText={setPrice}
//               placeholder="Enter price"
//               placeholderTextColor="#999"
//               keyboardType="numeric"
//               editable={!uploading}
//             />
//           </View>

//           {/* Category Dropdown */}
//           <TouchableOpacity
//             style={styles.dropdown}
//             onPress={() => !uploading && setCategoryOpen(!categoryOpen)}
//             activeOpacity={0.7}
//             disabled={uploading}
//           >
//             <Text
//               style={
//                 category ? styles.dropdownSelected : styles.dropdownPlaceholder
//               }
//             >
//               {category || "Select Category"}
//             </Text>
//             <Ionicons
//               name={categoryOpen ? "chevron-up" : "chevron-down"}
//               size={20}
//               color="#000"
//             />
//           </TouchableOpacity>
//           {categoryOpen && (
//             <View style={styles.dropdownContent}>
//               {CATEGORIES.map((cat) => (
//                 <TouchableOpacity
//                   key={cat}
//                   style={styles.row}
//                   onPress={() => {
//                     setCategory(cat);
//                     setCategoryOpen(false);
//                   }}
//                   activeOpacity={0.7}
//                 >
//                   <View
//                     style={[
//                       styles.checkbox,
//                       category === cat && styles.checked,
//                     ]}
//                   >
//                     {category === cat && (
//                       <Ionicons name="checkmark" size={14} color="#fff" />
//                     )}
//                   </View>
//                   <Text>{cat}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}

//           {/* Add-ons Dropdown */}
//           <TouchableOpacity
//             style={styles.dropdown}
//             onPress={() => !uploading && setAddonsOpen(!addonsOpen)}
//             activeOpacity={0.7}
//             disabled={uploading}
//           >
//             <Text>
//               Add-ons - Choose Food Items ({selectedAddons.length} selected)
//             </Text>
//             <Ionicons
//               name={addonsOpen ? "chevron-up" : "chevron-down"}
//               size={20}
//               color="#000"
//             />
//           </TouchableOpacity>
//           {addonsOpen && (
//             <View style={styles.dropdownContent}>
//               {availableFoods.length === 0 ? (
//                 <Text style={styles.emptyText}>
//                   No food items available yet. Add some food first!
//                 </Text>
//               ) : (
//                 availableFoods.map((food) => renderFoodCheckbox(food))
//               )}
//             </View>
//           )}

//           {/* Removables Dropdown */}
//           <TouchableOpacity
//             style={styles.dropdown}
//             onPress={() => !uploading && setRemovableOpen(!removableOpen)}
//             activeOpacity={0.7}
//             disabled={uploading}
//           >
//             <Text>
//               Removable Ingredients ({selectedRemovables.length} selected)
//             </Text>
//             <Ionicons
//               name={removableOpen ? "chevron-up" : "chevron-down"}
//               size={20}
//               color="#000"
//             />
//           </TouchableOpacity>
//           {removableOpen && (
//             <View style={styles.dropdownContent}>
//               {availableRemovables.map((r) => renderRemovableCheckbox(r))}

//               {/* Add new removable button */}
//               {!showNewRemovableInput ? (
//                 <TouchableOpacity
//                   style={styles.addNewBtn}
//                   onPress={() => setShowNewRemovableInput(true)}
//                   activeOpacity={0.7}
//                 >
//                   <Ionicons name="add-circle-outline" size={20} color="#000" />
//                   <Text style={styles.addNewText}>Create New Removable</Text>
//                 </TouchableOpacity>
//               ) : (
//                 <View style={styles.newItemContainer}>
//                   <TextInput
//                     style={styles.newItemInput}
//                     placeholder="Enter removable ingredient name"
//                     placeholderTextColor="#999"
//                     value={newRemovableName}
//                     onChangeText={setNewRemovableName}
//                   />
//                   <TouchableOpacity
//                     style={styles.saveNewBtn}
//                     onPress={addNewRemovable}
//                   >
//                     <Text style={styles.saveNewText}>Add</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.cancelNewBtn}
//                     onPress={() => {
//                       setShowNewRemovableInput(false);
//                       setNewRemovableName("");
//                     }}
//                   >
//                     <Text>Cancel</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>
//           )}

//           <TouchableOpacity
//             style={[styles.saveBtn, uploading && styles.saveBtnDisabled]}
//             onPress={handleSave}
//             activeOpacity={0.8}
//             disabled={uploading}
//           >
//             {uploading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.saveText}>
//                 {isEditMode ? "Update Food" : "Add Food"}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </ScrollView>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#FAFAFA",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#000",
//   },
//   addButton: {
//     backgroundColor: "#E8E8E8",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 4,
//   },
//   addButtonText: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#000",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#000",
//     marginBottom: 16,
//   },
//   listRow: {
//     flexDirection: "row",
//     backgroundColor: "#E8E8E8",
//     padding: 16,
//     borderRadius: 4,
//     marginBottom: 12,
//     alignItems: "center",
//   },
//   listImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 4,
//     marginRight: 12,
//   },
//   listInfo: {
//     flex: 1,
//   },
//   listName: {
//     fontWeight: "600",
//     fontSize: 15,
//     color: "#000",
//     marginBottom: 2,
//   },
//   listPrice: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#666",
//   },
//   actions: {
//     flexDirection: "row",
//     gap: 12,
//     alignItems: "center",
//   },

//   // Modal styles
//   modalContainer: {
//     padding: 16,
//     backgroundColor: "#fff",
//     paddingBottom: 40,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#000",
//   },
//   imageBox: {
//     height: 160,
//     borderWidth: 1,
//     borderColor: "#000",
//     borderRadius: 8,
//     marginBottom: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     overflow: "hidden",
//     backgroundColor: "#f5f5f5",
//   },
//   imagePreview: {
//     width: "100%",
//     height: "100%",
//   },
//   inputContainer: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 6,
//     color: "#000",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#000",
//     borderRadius: 6,
//     padding: 12,
//     fontSize: 15,
//     backgroundColor: "#fff",
//     color: "#000",
//   },
//   textArea: {
//     height: 100,
//     paddingTop: 12,
//   },
//   dropdown: {
//     borderWidth: 1,
//     borderColor: "#000",
//     padding: 12,
//     borderRadius: 6,
//     marginTop: 12,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   dropdownPlaceholder: {
//     color: "#999",
//   },
//   dropdownSelected: {
//     color: "#000",
//   },
//   dropdownContent: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderTopWidth: 0,
//     borderRadius: 6,
//     borderTopLeftRadius: 0,
//     borderTopRightRadius: 0,
//     padding: 8,
//     backgroundColor: "#f9f9f9",
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//     paddingLeft: 12,
//     paddingVertical: 6,
//   },
//   foodRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//     paddingLeft: 12,
//     paddingVertical: 8,
//     paddingRight: 12,
//   },
//   foodThumbnail: {
//     width: 40,
//     height: 40,
//     borderRadius: 6,
//     marginRight: 12,
//     backgroundColor: "#e0e0e0",
//   },
//   foodInfo: {
//     flex: 1,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderWidth: 2,
//     borderColor: "#000",
//     marginRight: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 3,
//     backgroundColor: "#fff",
//   },
//   checked: {
//     backgroundColor: "#000",
//   },
//   foodName: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#000",
//   },
//   foodPrice: {
//     fontSize: 13,
//     color: "#666",
//     fontWeight: "600",
//     marginTop: 2,
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#999",
//     padding: 16,
//     fontStyle: "italic",
//   },
//   addNewBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 12,
//     paddingLeft: 12,
//     gap: 8,
//   },
//   addNewText: {
//     color: "#000",
//     fontWeight: "600",
//   },
//   newItemContainer: {
//     marginTop: 12,
//     paddingLeft: 12,
//     paddingRight: 12,
//   },
//   newItemInput: {
//     borderWidth: 1,
//     borderColor: "#000",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 8,
//     backgroundColor: "#fff",
//     color: "#000",
//   },
//   saveNewBtn: {
//     backgroundColor: "#000",
//     padding: 10,
//     borderRadius: 6,
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   saveNewText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   cancelNewBtn: {
//     padding: 10,
//     alignItems: "center",
//   },
//   saveBtn: {
//     backgroundColor: "#000",
//     padding: 14,
//     borderRadius: 8,
//     marginTop: 24,
//     alignItems: "center",
//   },
//   saveBtnDisabled: {
//     backgroundColor: "#666",
//   },
//   saveText: {
//     color: "#fff",
//     fontWeight: "700",
//   },
// });





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
        <Text style={styles.title}>manage food</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setIsEditMode(false);
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>Add food</Text>
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: "column",
    marginBottom: 24,
    gap: 8,
  },
  addButton: {
    backgroundColor: "black",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
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