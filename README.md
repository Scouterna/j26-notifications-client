# J26 Notifications Client

This is a minimal React/Vite client that talks to the existing FastAPI messaging backend. It assumes that authentication is handled upstream (OIDC) and relies on the backend to validate the browser session via cookies.

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:5173 by default.

## Environment

Copy `.env.example` to `.env` and update the variables. Key settings:

- `VITE_PLATFORM_BASE_URL` – Shared base domain (e.g. `https://app.dev.j26.se`). This host serves both the `/auth/*` routes and the notification APIs.
- `VITE_MESSAGING_API_PREFIX` – Path prefix for notification endpoints (e.g. `/messaging/api/v1`).
- `VITE_DEFAULT_TENANT` – Tenant key the client should load on startup.
- `VITE_NOTIFICATION_POLL_INTERVAL_MS` – Optional poll interval for channel notification refresh (default `30000`). Set to `0` to disable auto-polling.
- `VITE_NOTIFICATION_LIMIT` – Number of notifications to request per poll (default `10`).
- Firebase values + `VITE_FIREBASE_VAPID_KEY` – Required for web push. Leave blank to disable push support.

## Runtime configuration & deployment

At runtime, the app reads `/config/config.json` before rendering. During local dev you can copy `public/config.example.json` to `public/config/config.json` and tweak the values; in production mount a Kubernetes `ConfigMap` at `/usr/share/nginx/html/config/config.json`. Example ConfigMap + Deployment:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: j26-client-runtime-config
data:
  config.json: |
    { "platformBaseUrl": "https://app.dev.j26.se", "messagingApiPrefix": "/messaging/api/v1", ... }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: j26-client
spec:
  replicas: 2
  selector:
    matchLabels:
      app: j26-client
  template:
    metadata:
      labels:
        app: j26-client
    spec:
      containers:
        - name: web
          image: ghcr.io/example/j26-client:latest
          ports:
            - containerPort: 80
          volumeMounts:
            - name: runtime-config
              mountPath: /usr/share/nginx/html/config
              readOnly: true
      volumes:
        - name: runtime-config
          configMap:
            name: j26-client-runtime-config
            items:
              - key: config.json
                path: config.json
```

### CI/CD example (GitHub Actions)

Because configuration is provided at runtime, the Docker build just needs to run `npm run build` and push the resulting Nginx image. A minimal workflow:

```yaml
name: build-and-push
on:
  push:
    branches: [main]

jobs:
  docker:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/<org>/j26-client:${{ github.sha }}
```

Adjust the registry/login step for your environment; additional steps (tests, lint) can run before the `docker/build-push-action` step.

## Features

- Loads the current authenticated user via `/auth/user` and retries requests after `/auth/refresh` on HTTP 401.
- Lists channels for the selected tenant, showing subscription status and letting users join or leave.
- Fetches the current user's subscriptions and polls `/notifications` every 30 seconds (configurable).
- Registers the Firebase service worker, requests notification permission, and includes the FCM token on subscribe calls.
- Displays foreground push notifications via the Firebase SDK; background notifications are handled by the service worker.

## Folder Structure

- `src/api` – Fetch helpers for auth-aware API calls + notification operations.
- `src/components` – Presentational React components.
- `src/push` – Hooks for Firebase messaging + foreground notifications.
- `public/firebase-messaging-sw.js` – Service worker script loaded with Firebase config via query string.
