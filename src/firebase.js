// src/firebase.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB3UvrU7sa6io5KY4jMvkoXuz2-urswMro",
  authDomain: "lost-and-found-portal-a4a12.firebaseapp.com",
  projectId: "lost-and-found-portal-a4a12",
  messagingSenderId: "240170980054",
  appId: "1:240170980054:web:43c6fee885004353d7af77",
  measurementId: "G-MFHM1F5BPH",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);