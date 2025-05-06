// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBETclwh6uynN_PsSsx11vF-H_IGokB3_c",
  authDomain: "locallegends-c4b58.firebaseapp.com",
  projectId: "locallegends-c4b58",
  storageBucket: "locallegends-c4b58.firebasestorage.app",
  messagingSenderId: "1063581977068",
  appId: "1:1063581977068:web:f80b319af2f655b06c58c9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db };
export { auth };