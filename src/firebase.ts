import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAeSg3MfsiixhVUiYSsxOHyPERidjmcwgI",
  authDomain: "inf04-4d0f2.firebaseapp.com",
  projectId: "inf04-4d0f2",
  storageBucket: "inf04-4d0f2.firebasestorage.app",
  messagingSenderId: "1032730960823",
  appId: "1:1032730960823:web:c30d62f520ae71fca0be32"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
