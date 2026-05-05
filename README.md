# J26 Notifications Sender

This is a complete rewrite of the messaging client service and now focuses on a user interface for sending messages for the J26 platform.
The Firebase service worker that receives notifications is removed along with the ability to view sent notifications.

It is built as a TanStack Start service so it can live inside the same app-shell model as the other J26 applications. The browser only renders the send form and submits to the notification backend over the same domain. Authorization is enforced by the backend from the platform JWT cookie.

## Behavior

- In local development, the sender UI runs at `/`.
- In deployed environments, the sender UI is mounted under `/_services/notification-client`.
- The app-shell navigation entry is served from `/app-config` inside the service.
- Notification submits are sent to a same-origin notifications path and include cookies.
- The backend remains the real authorization boundary.
- The sender UI may decode the JWT cookie for display and UX gating, but not for security.

## Configuration

These variables control the sender service:

- `J26_SERVICE_BASE_PATH`: app base path. Defaults to `/` in local development and `/_services/notification-client` outside development.
- `J26_NOTIFICATIONS_PROXY_PREFIX`: same-origin prefix used for notification API calls. Default: `/notifications`
- `J26_NOTIFICATIONS_TENANT`: tenant slug used for submit requests. Default: `jamboree26`
- `J26_NOTIFICATIONS_UPSTREAM`: optional override for the local development upstream. Defaults to `http://localhost:8000` in development and is unset outside development.

The app base path is environment-driven so local development can run at `/` while deployed environments still use the app-shell mount point.

For local development, copy `.env.local.template` to `.env.local` and adjust values as needed.

## Local Development

The dev server runs on port `3000`.

With the default configuration, the sender app is available at `http://localhost:3000/`.

In local development, the service proxies `/notifications/**` to `http://localhost:8000` unless `J26_NOTIFICATIONS_UPSTREAM` overrides it. In Kubernetes, the same-origin `/notifications` path should be handled by the platform ingress/backend routing instead.

## Kubernetes

The manifests are controlled by ArgoCD and assumes:

- the sender service is exposed at `/_services/notification-client`
- `J26_SERVICE_BASE_PATH` is set to `/_services/notification-client` in the deployment environment
- ingress rewrites preserve that base path for the Node app
- the service listens on container port `3000`
- the Kubernetes Service exposes port `80`
- same-domain routing for `/notifications` is handled outside this service

## Notes

This repo intentionally keeps the sender focused on composing and submitting notifications. Push registration, notification feeds, and receiver-specific behavior belong elsewhere.