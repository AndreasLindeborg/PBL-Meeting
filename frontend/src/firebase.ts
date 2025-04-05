import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA63ijLJ9es4yK8Jka9RMs-ncE4yU0GC0Y",
  authDomain: "pbl-meeting2.firebaseapp.com",
  projectId: "pbl-meeting2",
  storageBucket: "pbl-meeting2.firebasestorage.app", 
  messagingSenderId: "212477088625",
  appId: "1:212477088625:web:a7252f3cf3c4e9f4351cd0",
  measurementId: "G-15H2GXC46X"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);