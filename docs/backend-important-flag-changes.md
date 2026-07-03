# Backend changes for "clear important" (j26-notifications)

Handoff spec for a feature in the **j26-notifications-client** (Notifications Sender) UI.

## Goal

A notification can be sent with `important: true`. The receiving app (j26-app) always
shows important notifications above the rest. Once a notification is no longer
important, a user with the **`notification-sender`** role must be able to un-mark it, so
it drops back into the normal ordering.

The sender UI is getting a new "Important" tab that lists the still-important
notifications and offers a **"Clear important"** action per row. That tab needs two
endpoints from this service. Both live under the existing tenant scope and reuse the
current auth (Keycloak JWT cookie + `notification-sender` role — same gate as the send
and groups endpoints).

## Prerequisite: persist sent notifications

Today the send endpoint may be effectively fire-and-forget (dispatch to FCM, keep no
record). This feature only works if sent notifications are **stored** with:

- a **stable `id`** (used to target the clear call),
- their **`important`** state (mutable),
- their **content** and **`sent_at`** timestamp (to render and sort the list).

If nothing is persisted, the list endpoint has nothing to return and the clear endpoint
has nothing to mutate. **Persistence is the real prerequisite** and worth surfacing to
the product owner.

Note: "important" here is display-ordering metadata for the app's notification feed. If
the current design only forwards `important` to FCM at send time and doesn't retain it,
that retention needs to be added.

## Endpoint 1 — list currently-important notifications

```
GET /api/tenants/{tenant}/notifications/important
```

Returns notifications where `important == true` (excluding any already cleared). Array,
newest first (or return `sent_at` and let the client sort):

```jsonc
[
  {
    "id": "…",                     // stable id, used by the PATCH below
    "notification": {              // same shape the sender POSTs
      "sv": { "title": "…", "body": "…" },
      "en": { "title": "…", "body": "…" }
    },
    "important": true,
    "sent_at": "2026-07-03T12:00:00Z",
    "channels": ["@all"]           // optional, for context in the row
  }
]
```

- `200` with the array (empty array when there are none).
- `401` when unauthenticated (the UI already retries after a token refresh on 401).
- `403` when the caller lacks `notification-sender`.

## Endpoint 2 — clear the important flag

```
PATCH /api/tenants/{tenant}/notifications/{id}
Body: { "important": false }
```

- Sets `important` to the supplied value on the stored notification. Using PATCH with a
  body (rather than a dedicated `/clear` action) leaves room to support toggling back to
  `true` later without a new endpoint.
- This is a **state change only — it must NOT re-send or re-dispatch** the notification.
- `200` or `204` on success.
- `404` when `id` is unknown.
- `403` when the caller may not modify it.

## Open decisions (backend's call)

- **Ownership scope:** should a sender see/modify only their own notifications, or all of
  the tenant's? Scoping to the sender requires storing sender identity (`sub` from the
  JWT) per notification. The UI works either way — it just renders whatever the list
  returns.
- **Retention window:** whether the list returns all important notifications ever, or only
  within some recent window. Not required for the first version.
- **Effect of clearing on the feed:** confirm that flipping `important` to `false` only
  affects ordering in the receiving app and does not trigger any new push.

## Not needed

- No new fields in the **send** payload for this feature (manual clear only; no
  server-side expiry / "important until" in scope).
- No changes to the groups or send endpoints.
