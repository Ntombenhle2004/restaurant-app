// // import { View, Text, StyleSheet } from "react-native";
// // import { router } from "expo-router";
// // import PrimaryButton from "./components/PrimaryButton";

// // export default function IndexScreen() {
// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Restaurant App</Text>
// //       <Text style={styles.subtitle}>Order your favourite meals anytime</Text>

// //       <PrimaryButton
// //         title="Login"
// //         onPress={() => router.push("/login" as any)}
// //       />

// //       <PrimaryButton
// //         title="Browse Menu"
// //         onPress={() => router.replace("/home")}
// //         variant="secondary"
// //       />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: "center",
// //     padding: 24,
// //     backgroundColor: "#fff",
// //   },
// //   title: {
// //     fontSize: 32,
// //     fontWeight: "700",
// //     textAlign: "center",
// //     marginBottom: 8,
// //   },
// //   subtitle: {
// //     fontSize: 16,
// //     textAlign: "center",
// //     marginBottom: 32,
// //     color: "#666",
// //   },
// // });

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   TouchableOpacity,
//   Dimensions,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";

// const { width, height } = Dimensions.get("window");

// export default function LandingPage() {
//   const router = useRouter();

//   return (
//     <View style={styles.container}>
//       <StatusBar style="light" />

//       {/* Background Image - Use a high-quality food or interior shot */}
//       <ImageBackground
//         source={{
//           uri: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
//         }}
//         style={styles.background}
//       >
//         {/* Dark Overlay for readability */}
//         <View style={styles.overlay}>
//           <View style={styles.header}>
//             <Text style={styles.brandName}>AMBROSIA</Text>
//             <View style={styles.divider} />
//             <Text style={styles.tagline}>Taste the Immortality</Text>
//           </View>

//           <View style={styles.buttonContainer}>
//             {/* Main Login Button */}
//             <TouchableOpacity
//               style={styles.loginButton}
//               onPress={() => router.push("/login")}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.loginText}>Sign In</Text>
//             </TouchableOpacity>

//             {/* Ghost Button for Browsing */}
//             <TouchableOpacity
//               style={styles.browseButton}
//               onPress={() => router.push("/(tabs)/home")}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.browseText}>Browse Menu</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ImageBackground>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//   },
//   background: {
//     width: width,
//     height: height,
//     justifyContent: "center",
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.45)", // Soft dark tint
//     justifyContent: "space-between",
//     paddingVertical: 80,
//     paddingHorizontal: 40,
//   },
//   header: {
//     alignItems: "center",
//     marginTop: 50,
//   },
//   brandName: {
//     fontSize: 52,
//     fontWeight: "300",
//     color: "#fff",
//     letterSpacing: 8,
//     fontFamily: Platform.OS === "ios" ? "Optima" : "serif",
//   },
//   divider: {
//     width: 50,
//     height: 1,
//     backgroundColor: "#fff",
//     marginVertical: 15,
//   },
//   tagline: {
//     fontSize: 16,
//     color: "#eee",
//     letterSpacing: 3,
//     textTransform: "uppercase",
//     fontWeight: "300",
//   },
//   buttonContainer: {
//     width: "100%",
//     gap: 15,
//   },
//   loginButton: {
//     backgroundColor: "#fff",
//     paddingVertical: 18,
//     borderRadius: 2, // Sharp corners look more "high-fashion"
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   loginText: {
//     color: "#000",
//     fontSize: 16,
//     fontWeight: "600",
//     letterSpacing: 2,
//     textTransform: "uppercase",
//   },
//   browseButton: {
//     backgroundColor: "transparent",
//     paddingVertical: 18,
//     borderRadius: 2,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.6)",
//     alignItems: "center",
//   },
//   browseText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "400",
//     letterSpacing: 2,
//     textTransform: "uppercase",
//   },
// });

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
        }}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.brandName}>AMBROSIA</Text>
            <View style={styles.divider} />
            <Text style={styles.tagline}>Taste the Immortality</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
              activeOpacity={0.8}
            >
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)/home")}
              activeOpacity={0.7}
            >
              <Text style={styles.browseText}>Browse Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

// ... styles remain the same as your provided code
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  background: { width: width, height: height, justifyContent: "center" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "space-between",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  header: { alignItems: "center", marginTop: 50 },
  brandName: {
    fontSize: 52,
    fontWeight: "300",
    color: "#fff",
    letterSpacing: 8,
    fontFamily: Platform.OS === "ios" ? "Optima" : "serif",
  },
  divider: {
    width: 50,
    height: 1,
    backgroundColor: "#fff",
    marginVertical: 15,
  },
  tagline: {
    fontSize: 16,
    color: "#eee",
    letterSpacing: 3,
    textTransform: "uppercase",
    fontWeight: "300",
  },
  buttonContainer: { width: "100%", gap: 15 },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 2,
    alignItems: "center",
  },
  loginText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  browseButton: {
    backgroundColor: "transparent",
    paddingVertical: 18,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
  },
  browseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});