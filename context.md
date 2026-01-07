# Codex Context

This repository is a minimal React/Vite client for the J26 messaging system,
updated to present notifications and talk to the current backend APIs.

## Runtime Configuration

The app reads runtime config from `/config/config.json` before rendering.
Values can be provided via `.env` during local dev or via a mounted ConfigMap
in production. Keys in use:

- `platformBaseUrl` (or `VITE_PLATFORM_BASE_URL`)
- `messagingApiPrefix` (or `VITE_MESSAGING_API_PREFIX`)
- `defaultTenant` (or `VITE_DEFAULT_TENANT`)
- `notificationPollIntervalMs` (or `VITE_NOTIFICATION_POLL_INTERVAL_MS`)
- `notificationLimit` (or `VITE_NOTIFICATION_LIMIT`)
- Firebase config + `firebaseVapidKey` (optional for push)

## API Paths

All APIs use the same base host. Notification endpoints are under the
messaging prefix, while auth endpoints use `/auth`.

Notifications endpoint:

- `GET /tenants/{tenant_id}/notifications`

Token registry:

- `POST /tenants/{tenant_id}/tokens` with payload
  `{ "device_tokens": ["<fcm-token>"] }`

Channel subscription:

- `POST /tenants/{tenant_id}/channels/{channel_id}/subscriptions`
- `DELETE /tenants/{tenant_id}/channels/{channel_id}/subscriptions`

The subscription endpoint no longer accepts `device_tokens`. Tokens are
registered once via the token registry API when an FCM token is available.

## Notification UI

- UI labels use "Notifications" (not "Messaging/Messages").
- The history list polls the notifications endpoint and only updates state
  when the fetched list differs by id order.
- During polling, the list stays visible; a subtle "Refreshing…" indicator
  appears instead of replacing the list.
- Each notification shows its channel name (or channel id) in parentheses
  after the timestamp on the same row.

## Recent Changes (high level)

- Renamed message concepts to notification across UI, config, and API calls.
- `/notifications` is now the history endpoint.
- `notificationPollIntervalMs` and `notificationLimit` replace message vars.
- Token registration moved to `/tenants/{tenant_id}/tokens`.
- Channel subscriptions no longer include device tokens.
