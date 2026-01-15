import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { router } from "expo-router";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [card, setCard] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (
      !name ||
      !surname ||
      !email ||
      !contact ||
      !address ||
      !card ||
      !password
    ) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        surname,
        email,
        contact,
        address,
        card,
        role: "user",
      });

      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      <InputField label="Name" value={name} onChangeText={setName} />
      <InputField label="Surname" value={surname} onChangeText={setSurname} />
      <InputField label="Email" value={email} onChangeText={setEmail} />
      <InputField
        label="Contact Number"
        value={contact}
        onChangeText={setContact}
      />
      <InputField label="Address" value={address} onChangeText={setAddress} />
      <InputField label="Card Details" value={card} onChangeText={setCard} />
      <InputField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <PrimaryButton title="Create Account" onPress={handleRegister} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
});
