import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal, 
} from "react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Toast from "react-native-root-toast";
import InputField from "../components/InputField";

interface UserProfile {
  name: string;
  surname: string;
  contact: string;
  address: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Logout confirmation state
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    surname: "",
    contact: "",
    address: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(
    null,
  );

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/login");
    } else {
      fetchUserProfile();
    }
  }, []);

  const showToast = (message: string) => {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      backgroundColor: "#000",
      textColor: "#fff",
      containerStyle: { borderRadius: 2, paddingHorizontal: 20 }, // Matching your sharp-corner style
    });
  };

  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        const mappedData: UserProfile = {
          name: data.name || "",
          surname: data.surname || "",
          contact: data.contact || "",
          address: data.address || "",
          cardNumber: data.cardDetails?.number || "",
          expiry: data.cardDetails?.expiry || "",
          cvv: data.cardDetails?.cvv || "",
        };
        setProfile(mappedData);
        setOriginalProfile(mappedData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const hasChanges =
      JSON.stringify(profile) !== JSON.stringify(originalProfile);
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          name: profile.name,
          surname: profile.surname,
          contact: profile.contact,
          address: profile.address,
          cardDetails: {
            number: profile.cardNumber,
            expiry: profile.expiry,
            cvv: profile.cvv,
          },
        });
        setOriginalProfile(profile);
        setIsEditing(false);
        showToast("PROFILE UPDATED");
      }
    } catch (error) {
      showToast("UPDATE FAILED");
    } finally {
      setLoading(false);
    }
  };

  const performLogout = async () => {
    try {
      setShowLogoutModal(false);
      await signOut(auth);
      router.replace("/");
    } catch (e) {
      showToast("LOGOUT FAILED");
    }
  };

  if (loading && !isEditing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#000" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* --- CUSTOM LOGOUT MODAL --- */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>LOG OUT</Text>
            <Text style={styles.modalSub}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={performLogout}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                  LOG OUT
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            <Ionicons
              name={isEditing ? "checkmark-sharp" : "create-outline"}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {profile.name[0]}
            {profile.surname[0]}
          </Text>
        </View>
        <Text style={styles.userName}>
          {profile.name} {profile.surname}
        </Text>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View>
            <InputField
              label="NAME"
              value={profile.name}
              onChangeText={(v) => setProfile({ ...profile, name: v })}
            />
            <InputField
              label="SURNAME"
              value={profile.surname}
              onChangeText={(v) => setProfile({ ...profile, surname: v })}
            />
            <InputField
              label="PHONE"
              value={profile.contact}
              maxLength={10}
              keyboardType="number-pad"
              onChangeText={(v) =>
                setProfile({ ...profile, contact: v.replace(/[^0-9]/g, "") })
              }
            />
            <InputField
              label="ADDRESS"
              value={profile.address}
              onChangeText={(v) => setProfile({ ...profile, address: v })}
            />
            <InputField
              label="CARD"
              value={profile.cardNumber}
              maxLength={16}
              keyboardType="number-pad"
              onChangeText={(v) =>
                setProfile({ ...profile, cardNumber: v.replace(/[^0-9]/g, "") })
              }
            />
            <View style={{ flexDirection: "row", gap: 15 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="EXPIRY"
                  value={profile.expiry}
                  maxLength={5}
                  keyboardType="number-pad"
                  onChangeText={(v) => setProfile({ ...profile, expiry: v })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="CVV"
                  value={profile.cvv}
                  maxLength={3}
                  keyboardType="number-pad"
                  onChangeText={(v) =>
                    setProfile({ ...profile, cvv: v.replace(/[^0-9]/g, "") })
                  }
                />
              </View>
            </View>
          </View>
        ) : (
          <View>
            <DetailItem label="Contact" value={profile.contact} />
            <DetailItem label="Address" value={profile.address} />
            <DetailItem
              label="Payment"
              // Bigger dots for the payment display
              value={
                profile.cardNumber
                  ? `●●●●${profile.cardNumber.slice(-3)}`
                  : "Not set"
              }
              isPayment
            />

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => setShowLogoutModal(true)}
            >
              <Text style={styles.logoutText}>LOG OUT</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function DetailItem({
  label,
  value,
  isPayment,
}: {
  label: string;
  value: string;
  isPayment?: boolean;
}) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          isPayment && { letterSpacing: 2, fontWeight: "700" },
        ]}
      >
        {value || "Not set"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    alignItems: "center",
    paddingVertical: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f4",
  },
  topActions: { position: "absolute", right: 25, top: 25 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "300" },
  userName: { fontSize: 22, fontWeight: "600" },
  content: { padding: 30 },
  infoBox: { marginBottom: 25 },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "black",
    textTransform: "uppercase",
    marginBottom: 5,
    letterSpacing: 1,
  },
  infoValue: { fontSize: 16, color: "#ccc" },
  logoutBtn: { marginTop: 20, paddingVertical: 10, alignItems: "center" },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },

  // Custom Logout Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 2,
   
  },
  modalSub: { fontSize: 14, color: "#666", marginBottom: 25, lineHeight: 20 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 15 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 15 },
  modalBtnPrimary: { backgroundColor: "#000" },
  modalBtnText: { fontSize: 12, fontWeight: "700", letterSpacing: 1 },
});