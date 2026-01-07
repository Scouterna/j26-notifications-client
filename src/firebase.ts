import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';
import type { FirebaseConfig } from './config';

let firebaseApp: FirebaseApp | null = null;

export async function getMessagingClient(config: FirebaseConfig): Promise<Messaging | null> {
  const supported = await isSupported().catch(() => false);
  if (!supported) {
    console.warn('Firebase messaging is not supported in this browser');
    return null;
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(config);
  }

  return getMessaging(firebaseApp);
}
