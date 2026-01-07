/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

function getConfig() {
  const params = new URL(self.location).searchParams;
  const cfg = params.get('cfg');
  if (!cfg) return null;
  try {
    return JSON.parse(atob(cfg));
  } catch (error) {
    console.error('Failed to parse Firebase config', error);
    return null;
  }
}

const firebaseConfig = getConfig();

if (firebaseConfig) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'New announcement';
    const options = {
      body: payload.notification?.body,
      data: payload.data || {},
    };
    self.registration.showNotification(title, options);
  });

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';
    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          const matchingClient = clientList.find((client) => client.url.includes(self.location.origin));
          if (matchingClient) {
            return matchingClient.focus();
          }
          return clients.openWindow(targetUrl);
        })
        .catch((error) => {
          console.error('notificationclick handler failed', error);
        })
    );
  });
} else {
  console.warn('firebase-messaging-sw: missing Firebase configuration.');
}
