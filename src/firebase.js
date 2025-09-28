// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaGcEZPeMBWCqUNbrl-L-jO4JZd0e86sk",
  authDomain: "emclab-2dfd9.firebaseapp.com",
  projectId: "emclab-2dfd9",
  storageBucket: "emclab-2dfd9.firebasestorage.app",
  messagingSenderId: "177039570807",
  appId: "1:177039570807:web:5d2c5ea1830646379d9372"
};

// Firebase init
const app = initializeApp(firebaseConfig);

// Firestore init
export const db = getFirestore(app);
