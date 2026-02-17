import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = "Please enter both email and password.";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        const msg = "User profile not found. Please register first.";
        Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
        return;
      }

      const userData = userDoc.data();
      if (userData.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error: any) {
      Platform.OS === "web"
        ? alert(error.message)
        : Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>LOGIN</Text>
          <View style={styles.dividerGold} />
        </View>
       
        <View style={styles.form}>
          <InputField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryButton
            title="SIGN IN"
            onPress={handleLogin}
            loading={loading}
          />
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>DON'T HAVE AN ACCOUNT? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.footerLink}>REGISTER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  header: { alignItems: "center", },
  brandTitle: { fontSize: 24, letterSpacing: 6, fontWeight: "300" },
  dividerGold: {
    width: 40,
    height: 2,
    backgroundColor: "#9c8966",
    marginTop: 10,
  },
  brandName: {
    fontSize: 40,
    fontWeight: "300",
    letterSpacing: 10,
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "Optima" : "serif",
  },
  subtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  form: {
    width: "100%",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  footerText: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  footerLink: {
    color: "#000",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1,
    textDecorationLine: "underline",
  },
});