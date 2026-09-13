import { WebsiteProject } from '../types';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const STORAGE_KEY_FIREBASE = 'scholar_codex_firebase_config';

// Load stored config or environment config
export function getFirebaseConfig(): FirebaseClientConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore error
  }

  // Check Vite environment variables
  const envApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseClientConfig): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_FIREBASE);
}

// Check configuration status
export function isFirebaseConfigured(): boolean {
  const cfg = getFirebaseConfig();
  return Boolean(cfg?.apiKey && cfg?.projectId);
}

// Cloud sync for website projects
export async function syncProjectToFirebase(
  project: WebsiteProject
): Promise<{ success: boolean; message: string; cloudDocId?: string }> {
  const config = getFirebaseConfig();

  if (!config) {
    // Simulated cloud sync with local persistence
    try {
      const localCloudSync = JSON.parse(localStorage.getItem('scholar_codex_cloud_sync') || '{}');
      localCloudSync[project.id] = {
        ...project,
        syncedAt: new Date().toISOString(),
        cloudStatus: 'cached-locally',
      };
      localStorage.setItem('scholar_codex_cloud_sync', JSON.stringify(localCloudSync));
    } catch (err) {
      // Ignore
    }

    return {
      success: true,
      message: 'Project state archived to local Cloud Cache. Add Firebase keys for live Firestore synchronization.',
    };
  }

  try {
    // Dynamically attempt Firebase Firestore import if installed
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');

    const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    const db = getFirestore(app);

    const docRef = doc(db, 'websiteProjects', project.id);
    await setDoc(
      docRef,
      {
        ...project,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      success: true,
      message: `Project successfully synchronized to Firestore collection "websiteProjects/${project.id}"!`,
      cloudDocId: project.id,
    };
  } catch (error: any) {
    console.warn('[Firebase Sync Error]', error);
    return {
      success: false,
      message: `Firebase Sync notice: ${error?.message || 'Could not connect to Firestore instance.'}`,
    };
  }
}

// Fetch all projects from Firebase
export async function fetchProjectsFromFirebase(): Promise<WebsiteProject[]> {
  const config = getFirebaseConfig();
  if (!config) return [];

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');

    const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    const db = getFirestore(app);

    const snapshot = await getDocs(collection(db, 'websiteProjects'));
    const list: WebsiteProject[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as WebsiteProject);
    });
    return list;
  } catch (error) {
    console.warn('[Firebase Fetch Error]', error);
    return [];
  }
}
