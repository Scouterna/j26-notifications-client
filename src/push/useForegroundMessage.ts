import { useEffect } from 'react';
import { onMessage, type MessagePayload } from 'firebase/messaging';
import { config } from '../config';
import { getMessagingClient } from '../firebase';

function showNotification(payload: MessagePayload) {
  const title = payload.notification?.title || 'New announcement';
  const body = payload.notification?.body || payload.data?.body;
  if (Notification.permission === 'granted') {
    new Notification(title, { body: body || undefined });
  }
}

export function useForegroundMessage(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !config.firebase) {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    getMessagingClient(config.firebase)
      .then((messaging) => {
        if (!messaging) {
          return;
        }
        unsubscribe = onMessage(messaging, (payload) => {
          if (document.visibilityState === 'visible') {
            showNotification(payload);
          }
        });
      })
      .catch((error) => {
        console.error('Foreground messaging failed', error);
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [enabled]);
}
