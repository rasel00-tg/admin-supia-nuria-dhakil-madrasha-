import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJSiOk06CUxxyF-NXH4RCvMPvK1JiyKf8",
  authDomain: "supia-nuria-dhakil-madrasah.firebaseapp.com",
  projectId: "supia-nuria-dhakil-madrasah",
  storageBucket: "supia-nuria-dhakil-madrasah.firebasestorage.app",
  messagingSenderId: "785289009264",
  appId: "1:785289009264:web:75d5dc8158000203a2bcb5",
  measurementId: "G-CVD7EYK638"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
