import { doc, getDocFromServer } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// We'll try to load from the config file if it exists, otherwise use empty
let firebaseConfig = {};
try {
  // @ts-ignore
  import config from './firebase-applet-config.json';
  firebaseConfig = config;
} catch (e) {
  console.warn("Firebase config not found. App might not work correctly until Firebase is set up.");
}

const app = initializeApp(firebaseConfig);
// @ts-ignore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (Object.keys(firebaseConfig).length > 0) {
  testConnection();
}
