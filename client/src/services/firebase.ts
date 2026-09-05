import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'life-observatory.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'life-observatory',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'life-observatory.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '135410664968',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:135410664968:web:a52cdf53278fc9098573bd',
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);

// Clean GoogleAuthProvider for identity only (no premature Workspace scopes)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Real Google Authentication:
 * Obtains an unforgeable Firebase user identity token with stable UID.
 * Explicitly does not request Workspace permissions here.
 */
export async function signInWithGoogle(): Promise<User | null> {
  localStorage.removeItem('life_observatory_demo_user');
  sessionStorage.removeItem('life_observatory_signed_out');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google Sign-in popup closed or failed:', error.code, error.message);
    throw error;
  }
}

export async function signInWithGoogleRedirect(): Promise<void> {
  localStorage.removeItem('life_observatory_demo_user');
  sessionStorage.removeItem('life_observatory_signed_out');
  await signInWithRedirect(auth, googleProvider);
}

export { getRedirectResult };

/**
 * Isolated Demo Mode:
 * Strictly used when explicitly clicking "Explore Alex's Journey".
 */
export async function signInAsDemo(): Promise<any> {
  const mockUser = {
    uid: 'demo-observer-local',
    email: 'alex@lifeobservatory.demo',
    displayName: 'Alex Chen',
    getIdToken: async () => 'demo_token_for_demo-observer-local',
  };

  try {
    localStorage.setItem('life_observatory_demo_user', JSON.stringify(mockUser));
  } catch {
    // ignore
  }

  return mockUser;
}

export async function signOutUser(): Promise<void> {
  try {
    localStorage.removeItem('life_observatory_demo_user');
  } catch {
    // ignore
  }
  try {
    await fbSignOut(auth);
  } catch {
    // ignore
  }
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch {
      // ignore
    }
  }
  try {
    const stored = localStorage.getItem('life_observatory_demo_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      return `demo_token_for_${parsed.uid || 'demo-observer-local'}`;
    }
  } catch {
    // ignore
  }
  return null;
}

export { onAuthStateChanged };
