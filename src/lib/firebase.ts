// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "smilesurvey-4t0q9",
  "appId": "1:247437941232:web:ce1bc056f8ddede3b96535",
  "storageBucket": "smilesurvey-4t0q9.firebasestorage.app",
  "apiKey": "AIzaSyCI4WC2spkEyxtCGbOmzDD8GrxsbHCAEok",
  "authDomain": "smilesurvey-4t0q9.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "247437941232"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
