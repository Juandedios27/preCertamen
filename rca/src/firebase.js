// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXzmBYRMtRh4wRSnU2Su1Lnrh6p6FXpHY",
  authDomain: "reactfb-a69c0.firebaseapp.com",
  projectId: "reactfb-a69c0",
  storageBucket: "reactfb-a69c0.firebasestorage.app",
  messagingSenderId: "781292606257",
  appId: "1:781292606257:web:ecd443a33342c01c4f5610"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);