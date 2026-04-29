import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "../firebase-applet-config.json";

if (!admin.apps.length) {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  console.log(`[Firebase Admin] Initializing with Project ID: ${projectId}`);
  admin.initializeApp({
    projectId: projectId,
  });
}

const app = admin.apps[0]!;
const databaseId = process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId;

console.log(`[Firebase Admin] Using Database ID: ${databaseId || '(default)'}`);

// Use explicit databaseId if provided via environment or local config
export const adminDb = databaseId 
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export const adminAuth = admin.auth();
