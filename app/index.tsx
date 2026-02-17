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
import { Image } from "react-native";

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/images/ChatGPT Image Feb 17, 2026, 01_54_40 PM.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Image
              source={require("../assets/images/ChatGPT_Image_Feb_17__2026__12_56_27_PM__1_-removebg-preview.png")}
              style={styles.logo}
            />
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
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  background: { width: width, height: height, justifyContent: "center" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "space-between",
    paddingTop: 40, 
    paddingBottom: 80,
    paddingHorizontal: 40,
  },
  logo: {
    width: 390, 
    height: 180, 
    marginBottom: 10,
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