import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtK1rrdbZ8kQNGkJuJOQgZwF67X8g0g7I",
  authDomain: "lakshyastar-d1ff9.firebaseapp.com",
  projectId: "lakshyastar-d1ff9",
  storageBucket: "lakshyastar-d1ff9.firebasestorage.app",
  messagingSenderId: "77291292610",
  appId: "1:77291292610:web:a7d73578ddb75bf642385b"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);