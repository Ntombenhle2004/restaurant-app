import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";

export default function ManageFood() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [side1, setSide1] = useState("");
  const [side2, setSide2] = useState("");
  const [extras, setExtras] = useState("");

  const handleAddFood = async () => {
    if (!name || !description || !category || !price || !side1 || !side2) {
      Alert.alert(
        "Error",
        "Please fill all required fields including two sides"
      );
      return;
    }

    try {
      await addDoc(collection(db, "foods"), {
        name,
        description,
        category,
        price: parseFloat(price),
        sides: [side1, side2],
        extras: extras ? extras.split(",") : [],
      });

      Alert.alert("Success", "Food item added");
      // Reset form
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setSide1("");
      setSide2("");
      setExtras("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Food Item</Text>

      <InputField label="Name" value={name} onChangeText={setName} />
      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
      />
      <InputField
        label="Category"
        value={category}
        onChangeText={setCategory}
      />
      <InputField label="Price" value={price} onChangeText={setPrice} />
      <InputField label="Side 1" value={side1} onChangeText={setSide1} />
      <InputField label="Side 2" value={side2} onChangeText={setSide2} />
      <InputField
        label="Extras (comma separated)"
        value={extras}
        onChangeText={setExtras}
      />

      <PrimaryButton title="Add Food" onPress={handleAddFood} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
});
