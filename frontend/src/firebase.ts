// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCC3aKW-A-EQngZmDKq0XVLlndNpCk3P0",
  authDomain: "pbl-meeting.firebaseapp.com",
  projectId: "pbl-meeting",
  storageBucket: "pbl-meeting.firebasestorage.app",
  messagingSenderId: "509449851805",
  appId: "1:509449851805:web:240e6ed62a580554321574",
  measurementId: "G-36L34PENGR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);