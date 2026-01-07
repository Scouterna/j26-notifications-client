export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export type AppConfig = {
  platformBaseUrl: string;
  messagingApiPrefix: string;
  defaultTenant: string;
  notificationPollIntervalMs: number;
  notificationLimit: number;
  firebase?: FirebaseConfig;
  firebaseVapidKey?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`;
}

const env = import.meta.env;

export const config: AppConfig = {
  platformBaseUrl: env.VITE_PLATFORM_BASE_URL ? trimTrailingSlash(env.VITE_PLATFORM_BASE_URL) : window.location.origin,
  messagingApiPrefix: ensureLeadingSlash(env.VITE_MESSAGING_API_PREFIX || '/api'),
  defaultTenant: env.VITE_DEFAULT_TENANT || 'jamboree26',
  notificationPollIntervalMs: Number(env.VITE_NOTIFICATION_POLL_INTERVAL_MS || '30000'),
  notificationLimit: Number(env.VITE_NOTIFICATION_LIMIT || '10'),
  firebase: env.VITE_FIREBASE_API_KEY
    ? {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
      }
    : undefined,
  firebaseVapidKey: env.VITE_FIREBASE_VAPID_KEY,
};

export function applyRuntimeConfig(partial?: Partial<AppConfig>) {
  if (!partial) {
    return;
  }
  if (partial.platformBaseUrl) {
    config.platformBaseUrl = trimTrailingSlash(partial.platformBaseUrl);
  }
  if (partial.messagingApiPrefix) {
    config.messagingApiPrefix = ensureLeadingSlash(partial.messagingApiPrefix);
  }
  if (partial.defaultTenant) {
    config.defaultTenant = partial.defaultTenant;
  }
  if (typeof partial.notificationPollIntervalMs === 'number') {
    config.notificationPollIntervalMs = partial.notificationPollIntervalMs;
  }
  if (typeof partial.notificationLimit === 'number') {
    config.notificationLimit = partial.notificationLimit;
  }
  if (partial.firebase) {
    config.firebase = partial.firebase;
  }
  if (partial.firebaseVapidKey) {
    config.firebaseVapidKey = partial.firebaseVapidKey;
  }
}

export function requirePlatformBaseUrl(): string {
  if (config.platformBaseUrl) {
    return config.platformBaseUrl;
  }
  throw new Error('Platform base URL is not configured');
}
