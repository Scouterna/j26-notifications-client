import { useCallback, useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { config, type FirebaseConfig } from '../config';
import { getMessagingClient } from '../firebase';

function buildServiceWorkerUrl(firebaseConfig: FirebaseConfig): string {
  const cfg = btoa(JSON.stringify(firebaseConfig));
  const swUrl = new URL('firebase-messaging-sw.js', window.location.href);
  swUrl.searchParams.set('cfg', cfg);
  return swUrl.toString();
}

type UsePushTokenResult = {
  pushToken: string | null;
  pushError: string | null;
  isRegistering: boolean;
  requestPermission: () => void;
};

export function usePushToken(): UsePushTokenResult {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const register = useCallback(
    async (shouldRequestPermission: boolean) => {
      if (!config.firebase || !config.firebaseVapidKey) {
        setPushError('Firebase push is not fully configured');
        return;
      }
      if (!('Notification' in window) || !navigator.serviceWorker) {
        setPushError('Notifications are unavailable in this browser');
        return;
      }

      try {
        setIsRegistering(true);
        let permission = Notification.permission;
        if (shouldRequestPermission && permission !== 'granted') {
          permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') {
          setPushError('Notifications permission denied');
          return;
        }

        const messaging = await getMessagingClient(config.firebase!);
        if (!messaging) {
          setPushError('Firebase messaging not supported');
          return;
        }

        const registration = await navigator.serviceWorker.register(buildServiceWorkerUrl(config.firebase!));
        const token = await getToken(messaging, {
          vapidKey: config.firebaseVapidKey,
          serviceWorkerRegistration: registration,
        });

        setPushToken(token || null);
        setPushError(null);
      } catch (error) {
        console.error('Failed to register push notifications', error);
        setPushError('Failed to register push notifications');
      } finally {
        setIsRegistering(false);
      }
    },
    []
  );

  const requestPermission = useCallback(() => {
    void register(true);
  }, [register]);

  useEffect(() => {
    if (!config.firebase || !config.firebaseVapidKey) {
      return;
    }
    if (!('Notification' in window) || !navigator.serviceWorker) {
      return;
    }
    if (Notification.permission === 'granted' && !pushToken && !isRegistering) {
      void register(false);
    }
  }, [register, pushToken, isRegistering]);

  return { pushToken, pushError, isRegistering, requestPermission };
}
