import admin from "firebase-admin";
import path from "path";

// Initialize Admin SDK
const serviceAccount = require(path.resolve("./firebase-admin-key.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Admin user data
const adminData = {
  email: "admin@example.com",
  password: "admin123",
  displayName: "Ntombenhle Ngcobo",
  contact: "0767814774",
  address: "Durban",
  card: "4111 1111 1111 1111",
  role: "admin",
};

async function createAdmin() {
  try {
    // 1️⃣ Create Auth User
    const userRecord = await admin.auth().createUser({
      email: adminData.email,
      password: adminData.password,
      displayName: adminData.displayName,
    });

    console.log("✅ Admin Auth user created:", userRecord.uid);

    // 2️⃣ Add Firestore document
    const db = admin.firestore();
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: "Ntombenhle",
      surname: "Ngcobo",
      email: adminData.email,
      contact: adminData.contact,
      address: adminData.address,
      card: adminData.card,
      role: adminData.role,
    });

    console.log("✅ Admin Firestore doc created");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
