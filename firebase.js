
import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA5t9vlpfp6kDLcV1IhIkMXTQVseRBbgGg",
  authDomain: "primeiro-app-c8771.firebaseapp.com",
  projectId: "primeiro-app-c8771",
  storageBucket: "primeiro-app-c8771.firebasestorage.app",
  messagingSenderId: "45026677286",
  appId: "1:45026677286:web:b268a43302edbd64b58ce7"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export default app;

