import * as admin from 'firebase-admin';
import { ENV } from '../config/env';

let isInitialized = false;

export function initializeFirebaseAdmin(): admin.app.App {
  if (isInitialized && admin.apps.length > 0) {
    return admin.app();
  }

  if (admin.apps.length === 0) {
    const config: admin.AppOptions = {};
    if (ENV.GCP_PROJECT_ID) {
      config.projectId = ENV.GCP_PROJECT_ID;
    }
    admin.initializeApp(config);
  }

  isInitialized = true;
  return admin.app();
}

export function getDb(): admin.firestore.Firestore {
  initializeFirebaseAdmin();
  return admin.firestore();
}

export function getAuth(): admin.auth.Auth {
  initializeFirebaseAdmin();
  return admin.auth();
}

/**
 * Returns a typed subcollection reference under /users/{uid}/{collectionName}
 * Enforces strict user isolation on the server.
 */
export function getUserSubcollection(uid: string, collectionName: string): admin.firestore.CollectionReference {
  if (!uid || typeof uid !== 'string') {
    throw new Error('Invalid UID supplied for user subcollection');
  }
  const db = getDb();
  return db.collection('users').doc(uid).collection(collectionName);
}
