// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Platform,
//   Dimensions,
// } from "react-native";
// import { useState } from "react";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { auth, db } from "../../services/firebase";
// import { useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";

// const { width } = Dimensions.get("window");

// export default function LoginScreen() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       if (Platform.OS === "web") alert("Please enter email and password");
//       else Alert.alert("Error", "Please enter email and password");
//       return;
//     }

//     try {
//       setLoading(true);
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password,
//       );
//       const uid = userCredential.user.uid;
//       const userDoc = await getDoc(doc(db, "users", uid));

//       if (!userDoc.exists()) {
//         if (Platform.OS === "web")
//           alert(
//             "User profile not found in Firestore. Make sure you created the user document!",
//           );
//         else Alert.alert("Error", "User profile not found");
//         return;
//       }

//       const userData = userDoc.data();
//       if (userData.role === "admin") {
//         router.replace("/admin");
//       } else {
//         router.replace("/(tabs)/home");
//       }
//     } catch (error: any) {
//       if (Platform.OS === "web") alert(error.message);
//       else Alert.alert("Login Failed", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar style="dark" />
//       <View style={styles.content}>
//         <View style={styles.header}>
//           <Text style={styles.brandName}>AMBROSIA</Text>
//           <Text style={styles.subtitle}>Sign in to continue your journey</Text>
//         </View>

//         <View style={styles.form}>
//           <View style={styles.inputWrapper}>
//             <Text style={styles.inputLabel}>Email Address</Text>
//             <TextInput
//               placeholder="e.g. user@ambrosia.com"
//               style={styles.input}
//               autoCapitalize="none"
//               value={email}
//               onChangeText={setEmail}
//               placeholderTextColor="#bbb"
//             />
//           </View>

//           <View style={styles.inputWrapper}>
//             <Text style={styles.inputLabel}>Password</Text>
//             <TextInput
//               placeholder="••••••••"
//               style={styles.input}
//               secureTextEntry
//               value={password}
//               onChangeText={setPassword}
//               placeholderTextColor="#bbb"
//             />
//           </View>

//           <TouchableOpacity
//             style={[styles.button, loading && { opacity: 0.7 }]}
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? "AUTHENTICATING..." : "SIGN IN"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.registerContainer}>
//           <Text style={styles.registerText}>Don't have an account? </Text>
//           <TouchableOpacity onPress={() => router.push("/register")}>
//             <Text style={styles.registerLink}>REGISTER</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 30,
//     justifyContent: "center",
//   },
//   header: {
//     marginBottom: 50,
//     alignItems: "center",
//   },
//   brandName: {
//     fontSize: 40,
//     fontWeight: "300",
//     letterSpacing: 10,
//     color: "#000",
//     fontFamily: Platform.OS === "ios" ? "Optima" : "serif",
//   },
//   subtitle: {
//     fontSize: 13,
//     color: "#888",
//     marginTop: 10,
//     letterSpacing: 1.5,
//     textTransform: "uppercase",
//   },
//   form: {
//     width: "100%",
//   },
//   inputWrapper: {
//     marginBottom: 25,
//   },
//   inputLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: "#000",
//     marginBottom: 8,
//     letterSpacing: 1,
//     textTransform: "uppercase",
//   },
//   input: {
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//     paddingVertical: 12,
//     fontSize: 16,
//     color: "#000",
//     ...Platform.select({
//       web: { outlineStyle: "none" } as any,
//     }),
//   },
//   button: {
//     backgroundColor: "#000",
//     paddingVertical: 18,
//     borderRadius: 2,
//     marginTop: 20,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     letterSpacing: 2,
//     fontSize: 14,
//   },
//   registerContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 40,
//   },
//   registerText: {
//     color: "#888",
//     fontSize: 13,
//   },
//   registerLink: {
//     color: "#000",
//     fontWeight: "700",
//     fontSize: 13,
//     letterSpacing: 1,
//   },
// });

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

// Import your custom components
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
          <Text style={styles.brandName}>AMBROSIA</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Email Address"
            // placeholder="e.g. user@ambrosia.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            label="Password"
            // placeholder="••••••••"
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
  header: {
    marginBottom: 50,
    alignItems: "center",
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