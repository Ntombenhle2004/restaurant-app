import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCWSYnW3zLk8mJ6LBM89iCvHxwOrpYgsU4",
  authDomain: "symmetric-blade-466812-s3.firebaseapp.com",
  projectId: "symmetric-blade-466812-s3",
  storageBucket: "symmetric-blade-466812-s3.firebasestorage.app",
  messagingSenderId: "1038634868705",
  appId: "1:1038634868705:web:e30d3d910bf6a79b873ca0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
