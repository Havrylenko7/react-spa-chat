import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { firebaseConfig } from './firebaseConfig';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage();
