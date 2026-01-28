import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { Input, Button } from "react-native-elements";
import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

const APP_COLOR = "#000";

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔐 Protect page
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setEmail(data.email || user.email || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setCardNumber(data.cardNumber || "");
      } else {
        setEmail(user.email || "");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          email,
          address,
          phone,
          cardNumber,
        },
        { merge: true }
      );

      Alert.alert("Success", "Profile updated");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile");
    }
  };

  if (loading) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <Input label="Name" value={name} onChangeText={setName} />
      <Input label="Email" value={email} disabled />
      <Input label="Address" value={address} onChangeText={setAddress} />
      <Input
        label="Contact Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Input
        label="Card Number"
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
        secureTextEntry
      />

      <Button
        title="Save Profile"
        buttonStyle={styles.button}
        onPress={saveProfile}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: APP_COLOR,
  },
  button: {
    backgroundColor: APP_COLOR,
    borderRadius: 8,
    marginTop: 10,
  },
});
