// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoTY4qSdn6jhilkhhSbHnPzy6OkurwAzo",
  authDomain: "likhai-ba48e.firebaseapp.com",
  projectId: "likhai-ba48e",
  storageBucket: "likhai-ba48e.appspot.com",
  messagingSenderId: "945456427929",
  appId: "1:945456427929:web:9ad30df06af83877d59908",
  measurementId: "G-G7RPJ85B54"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)