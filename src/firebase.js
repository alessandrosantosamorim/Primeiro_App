import { getApp, getApps, initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5t9vlpfp6kDLcV1IhIkMXTQVseRBbgGg",
  authDomain: "primeiro-app-c8771.firebaseapp.com",
  projectId: "primeiro-app-c8771",
  storageBucket: "primeiro-app-c8771.firebasestorage.app",
  messagingSenderId: "45026677286",
  appId: "1:45026677286:web:b268a43302edbd64b58ce7"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (error) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;
