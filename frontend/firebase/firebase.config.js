// TODO: Replace the following with your app's Firebase project configuration
import { initializeApp } from "firebase/app";

// Optionally import the services that you want to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkB-ZHI_-Sj3HZC1-_DKq-dqHjQF279NY",
  authDomain: "instagram-9f9a9.firebaseapp.com",
  projectId: "instagram-9f9a9",
  storageBucket: "instagram-9f9a9.appspot.com",
  messagingSenderId: "308580089337",
  appId: "1:308580089337:web:6ea971e7d55d1fbd941128",
  measurementId: "G-F9BXDMBX8Y",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(firebaseApp);

// Initialize Cloud Firestore and get a reference to the service
export const firestore = getFirestore(firebaseApp);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(firebaseApp);
