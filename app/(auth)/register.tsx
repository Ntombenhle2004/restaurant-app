import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [password, setPassword] = useState("");

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length >= 3) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handleRegister = async () => {
    // Validations
    if (
      !name ||
      !surname ||
      !email ||
      !contact ||
      !address ||
      !cardNumber ||
      !expiry ||
      !cvv ||
      !password
    ) {
      const msg = "Please complete all fields.";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Missing Info", msg);
      return;
    }

    if (contact.length !== 10 || cardNumber.length !== 16 || cvv.length !== 3) {
      const msg =
        "Please check your number formats (Phone: 10, Card: 16, CVV: 3).";
      Platform.OS === "web" ? alert(msg) : alert(msg);
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        surname,
        email: email.trim(),
        contact,
        address,
        cardDetails: { number: cardNumber.slice(-4), expiry },
        role: "user",
        createdAt: new Date().toISOString(),
      });

      router.replace("/(tabs)/home");
    } catch (error: any) {
      Platform.OS === "web" ? alert(error.message) : alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.header}>
                  <Text style={styles.brandTitle}>REGISTER</Text>
                  <View style={styles.dividerGold} />
                </View>

        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <InputField label="Name" value={name} onChangeText={setName} />
          </View>
          <View style={{ flex: 1 }}>
            <InputField
              label="Surname"
              value={surname}
              onChangeText={setSurname}
            />
          </View>
        </View>

        <InputField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <InputField
          label="Contact Number"
          value={contact}
          onChangeText={(t) => setContact(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="xxx xxx xxxx"
        />

        <InputField
          label="Delivery Address"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Payment Details
        </Text>

        <InputField
          label="Card Number"
          value={cardNumber}
          onChangeText={(t) => setCardNumber(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          maxLength={16}
          placeholder="xxxx xxxx xxxx xxxx"
        />

        <View style={styles.row}>
          <View style={{ flex: 2, marginRight: 10 }}>
            <InputField
              label="Expiry"
              value={expiry}
              onChangeText={handleExpiryChange}
              maxLength={5}
              placeholder="MM/YY"
            />
          </View>
          <View style={{ flex: 1 }}>
            <InputField
              label="CVV"
              value={cvv}
              onChangeText={(t) => setCvv(t.replace(/[^0-9]/g, ""))}
              secureTextEntry
              maxLength={3}
              placeholder="123"
            />
          </View>
        </View>

        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>ALREADY HAVE AN ACCOUNT? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 30, paddingVertical: 60 },
  header: { alignItems: "center", marginBottom: 20 },
  brandTitle: { fontSize: 24, letterSpacing: 6, fontWeight: "300" },
  dividerGold: {
    width: 50,
    height: 2,
    backgroundColor: "#9c8966",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: "uppercase",
    borderLeftWidth: 2,
    paddingLeft: 10,
  },
  row: { flexDirection: "row" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  footerText: { color: "#888", fontSize: 11, fontWeight: "600" },
  footerLink: {
    color: "#000",
    fontSize: 11,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});