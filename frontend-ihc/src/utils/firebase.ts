'use client'

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBX4ciSN6fgNoAL3ZU8-QzugFqKedqLkDQ",
  authDomain: "iot-monitoring-a8444.firebaseapp.com",
  projectId: "iot-monitoring-a8444",
  storageBucket: "iot-monitoring-a8444.firebasestorage.app",
  messagingSenderId: "1018108764755",
  appId: "1:1018108764755:web:29aaab4578855f8b695ca6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);