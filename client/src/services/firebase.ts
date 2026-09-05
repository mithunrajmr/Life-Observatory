import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User,
  signInAnonymously
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google Sign-in failed or cancelled:', error.message);
    throw error;
  }
}

export async function signInAsDemo(): Promise<any> {
  const mockUser = {
    uid: 'demo-observer-local',
    email: 'alex@lifeobservatory.demo',
    displayName: 'Alex Chen',
    getIdToken: async () => 'demo_token_for_demo-observer-local',
  };

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-api-key') {
    try {
      localStorage.setItem('life_observatory_demo_user', JSON.stringify(mockUser));
    } catch {
      // ignore
    }
    return mockUser;
  }

  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (err: any) {
    try {
      localStorage.setItem('life_observatory_demo_user', JSON.stringify(mockUser));
    } catch {
      // ignore
    }
    return mockUser;
  }
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
