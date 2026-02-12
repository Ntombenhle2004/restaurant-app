// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Platform,
//   ScrollView,
// } from "react-native";
// import { useState } from "react";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { auth, db } from "../../services/firebase";
// import { useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";

// export default function RegisterScreen() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   // User Details
//   const [name, setName] = useState("");
//   const [surname, setSurname] = useState("");
//   const [email, setEmail] = useState("");
//   const [contact, setContact] = useState("");
//   const [address, setAddress] = useState("");
//   const [password, setPassword] = useState("");

//   // Card Details
//   const [cardNumber, setCardNumber] = useState("");
//   const [expiry, setExpiry] = useState("");
//   const [cvv, setCvv] = useState("");

//   // HELPER: Auto-format MM/YY
//   const handleExpiryChange = (text: string) => {
//     // Remove any non-numeric characters
//     const cleaned = text.replace(/[^0-9]/g, "");

//     // Add the slash after the first 2 digits
//     if (cleaned.length >= 3) {
//       setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
//     } else {
//       setExpiry(cleaned);
//     }
//   };

//   const handleRegister = async () => {
//     // 1. Basic Empty Check
//     if (
//       !name ||
//       !surname ||
//       !email ||
//       !contact ||
//       !address ||
//       !password ||
//       !cardNumber ||
//       !expiry ||
//       !cvv
//     ) {
//       const msg = "Please complete all fields.";
//       Platform.OS === "web" ? alert(msg) : Alert.alert("Missing Info", msg);
//       return;
//     }

//     // 2. Strict Length Validations
//     if (contact.length !== 10) {
//       const msg = "Contact number must be exactly 10 digits.";
//       Platform.OS === "web" ? alert(msg) : Alert.alert("Invalid Input", msg);
//       return;
//     }
//     if (cardNumber.length !== 16) {
//       const msg = "Card number must be exactly 16 digits.";
//       Platform.OS === "web" ? alert(msg) : Alert.alert("Invalid Input", msg);
//       return;
//     }
//     if (expiry.length !== 5) {
//       // 2 digits + 1 slash + 2 digits
//       const msg = "Expiry date must be in MM/YY format.";
//       Platform.OS === "web" ? alert(msg) : Alert.alert("Invalid Input", msg);
//       return;
//     }
//     if (cvv.length !== 3) {
//       const msg = "CVV must be exactly 3 digits.";
//       Platform.OS === "web" ? alert(msg) : Alert.alert("Invalid Input", msg);
//       return;
//     }

//     try {
//       setLoading(true);
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email.trim(),
//         password,
//       );
//       const uid = userCredential.user.uid;

//       await setDoc(doc(db, "users", uid), {
//         uid,
//         name,
//         surname,
//         email: email.trim(),
//         contact,
//         address,
//         cardDetails: {
//           number: cardNumber.slice(-4), // Store only last 4 for security usually
//           expiry,
//           // Never store CVV in real db, but for this demo:
//           cvv: "***",
//         },
//         role: "user",
//         createdAt: new Date().toISOString(),
//       });

//       router.replace("/(tabs)/home");
//     } catch (error: any) {
//       Platform.OS === "web"
//         ? alert(error.message)
//         : Alert.alert("Registration Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <StatusBar style="dark" />
//       <View style={styles.content}>
//         <View style={styles.header}>
//           <Text style={styles.brandName}>AMBROSIA</Text>
//           <Text style={styles.subtitle}>Create your distinguished account</Text>
//         </View>

//         <View>
//           <Text style={styles.sectionTitle}>Personal Details</Text>
//           <View style={styles.row}>
//             <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
//               <Text style={styles.inputLabel}>Name</Text>
//               <TextInput
//                 style={styles.input}
//                 value={name}
//                 onChangeText={setName}
//               />
//             </View>
//             <View style={[styles.inputWrapper, { flex: 1 }]}>
//               <Text style={styles.inputLabel}>Surname</Text>
//               <TextInput
//                 style={styles.input}
//                 value={surname}
//                 onChangeText={setSurname}
//               />
//             </View>
//           </View>

//           <View style={styles.inputWrapper}>
//             <Text style={styles.inputLabel}>Email Address</Text>
//             <TextInput
//               style={styles.input}
//               value={email}
//               onChangeText={setEmail}
//               autoCapitalize="none"
//               keyboardType="email-address"
//             />
//           </View>

//           <View style={styles.inputWrapper}>
//             <Text style={styles.inputLabel}>Contact Number</Text>
//             <TextInput
//               style={styles.input}
//               value={contact}
//               onChangeText={(text) => setContact(text.replace(/[^0-9]/g, ""))}
//               keyboardType="number-pad"
//               maxLength={10}
//               placeholder="0820000000"
//               placeholderTextColor="#ccc"
//             />
//           </View>

//           <View style={styles.inputWrapper}>
//             <Text style={styles.inputLabel}>Delivery Address</Text>
//             <TextInput
//               style={styles.input}
//               value={address}
//               onChangeText={setAddress}
//               multiline
//             />
//           </View>

//           <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
//             Secure Payment
//           </Text>
//           <View style={styles.inputWrapper}>
//             <Text style={styles.inputLabel}>Card Number</Text>
//             <TextInput
//               style={styles.input}
//               value={cardNumber}
//               onChangeText={(text) =>
//                 setCardNumber(text.replace(/[^0-9]/g, ""))
//               }
//               keyboardType="number-pad"
//               maxLength={16}
//               placeholder="xxxx xxxx xxxx xxxx"
//               placeholderTextColor="#ccc"
//             />
//           </View>

//           <View style={styles.row}>
//             <View style={[styles.inputWrapper, { flex: 2, marginRight: 10 }]}>
//               <Text style={styles.inputLabel}>Expiry Date</Text>
//               <TextInput
//                 style={styles.input}
//                 value={expiry}
//                 onChangeText={handleExpiryChange}
//                 keyboardType="number-pad"
//                 maxLength={5}
//                 placeholder="MM/YY"
//                 placeholderTextColor="#ccc"
//               />
//             </View>
//             <View style={[styles.inputWrapper, { flex: 1 }]}>
//               <Text style={styles.inputLabel}>CVV</Text>
//               <TextInput
//                 style={styles.input}
//                 value={cvv}
//                 onChangeText={(text) => setCvv(text.replace(/[^0-9]/g, ""))}
//                 secureTextEntry
//                 keyboardType="number-pad"
//                 maxLength={3}
//                 placeholder="123"
//                 placeholderTextColor="#ccc"
//               />
//             </View>
//           </View>

//           <View style={[styles.inputWrapper, { marginTop: 10 }]}>
//             <Text style={styles.inputLabel}>Password</Text>
//             <TextInput
//               style={styles.input}
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry
//             />
//           </View>

//           <TouchableOpacity
//             style={[styles.button, loading && { opacity: 0.7 }]}
//             onPress={handleRegister}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? "CREATING..." : "CREATE ACCOUNT"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Footer Link Update: Text is static, only "SIGN IN" is clickable */}
//         <View style={styles.footerContainer}>
//           <Text style={styles.footerText}>ALREADY HAVE AN ACCOUNT? </Text>
//           <TouchableOpacity onPress={() => router.push("/login")}>
//             <Text style={styles.footerLink}>SIGN IN</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   content: { paddingHorizontal: 30, paddingVertical: 60 },
//   header: { marginBottom: 40, alignItems: "center" },
//   brandName: {
//     fontSize: 32,
//     fontWeight: "300",
//     letterSpacing: 8,
//     color: "#000",
//     fontFamily: Platform.OS === "ios" ? "Optima" : "serif",
//   },
//   subtitle: {
//     fontSize: 11,
//     color: "#888",
//     marginTop: 8,
//     letterSpacing: 1.5,
//     textTransform: "uppercase",
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#000",
//     marginBottom: 20,
//     letterSpacing: 1,
//     textTransform: "uppercase",
//     borderLeftWidth: 2,
//     paddingLeft: 10,
//   },
//   row: { flexDirection: "row" },
//   inputWrapper: { marginBottom: 20 },
//   inputLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: "#000",
//     marginBottom: 5,
//     letterSpacing: 1,
//     textTransform: "uppercase",
//   },
//   input: {
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//     paddingVertical: 8,
//     fontSize: 15,
//     color: "#000",
//     ...Platform.select({ web: { outlineStyle: "none" } as any }),
//   },
//   button: {
//     backgroundColor: "#000",
//     paddingVertical: 18,
//     borderRadius: 2,
//     marginTop: 30,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     letterSpacing: 2,
//     fontSize: 14,
//   },
//   // NEW FOOTER STYLES
//   footerContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 40,
//     alignItems: "center",
//   },
//   footerText: {
//     color: "#888",
//     fontSize: 11,
//     fontWeight: "600",
//     letterSpacing: 1,
//   },
//   footerLink: {
//     color: "#000",
//     fontSize: 11,
//     fontWeight: "800", // Bolder than the rest
//     letterSpacing: 1,
//     textDecorationLine: "underline",
//   },
// });

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
          <Text style={styles.brandName}>AMBROSIA</Text>
          <Text style={styles.subtitle}>Create your distinguished account</Text>
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
  header: { marginBottom: 40, alignItems: "center" },
  brandName: {
    fontSize: 32,
    fontWeight: "300",
    letterSpacing: 8,
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "Optima" : "serif",
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