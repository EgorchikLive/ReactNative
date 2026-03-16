// firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBa25gmtNhj0pqDVpKpwVQI0SzXyTVZY3I",
  authDomain: "reactnative-dc0da.firebaseapp.com",
  projectId: "reactnative-dc0da",
  storageBucket: "reactnative-dc0da.firebasestorage.app",
  messagingSenderId: "444030040702",
  appId: "1:444030040702:web:949dee5d71e5ee3067362f",
  measurementId: "G-K078CJ2KTP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };