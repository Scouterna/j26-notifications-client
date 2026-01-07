import type { Notification } from '../types';

type NotificationFeedProps = {
  notifications: Notification[];
  isLoading: boolean;
  channelNames: Map<string, string>;
};

function formatChannelList(notification: Notification, channelNames: Map<string, string>): string | null {
  const ids = notification.channel_id ? [notification.channel_id] : [];
  const keys = (notification as { channel_keys?: string[] }).channel_keys ?? [];
  const combined = [...ids, ...keys];
  if (!combined.length) {
    return null;
  }
  const labels = combined.map((channelId) => channelNames.get(channelId) || channelId);
  return Array.from(new Set(labels)).join(', ');
}

export function NotificationFeed({ notifications, isLoading, channelNames }: NotificationFeedProps) {
  if (isLoading && !notifications.length) {
    return <p>Loading notifications…</p>;
  }

  if (!notifications.length) {
    return <p>No notifications yet.</p>;
  }

  return (
    <div className="notification-feed">
      {isLoading && <div className="refresh-indicator">Refreshing…</div>}
      {notifications.map((notification) => {
        const channelLabel = formatChannelList(notification, channelNames);
        const channelIds = notification.channel_id ? notification.channel_id : null;
        return (
          <article className="notification-card" key={notification.id}>
            <div className="notification-meta">
              <time dateTime={notification.sent_at}>{new Date(notification.sent_at).toLocaleString()}</time>
              {channelLabel || channelIds ? (
                <time dateTime={notification.sent_at}>({channelLabel ?? channelIds})</time>
              ) : null}
            </div>
            <h4>{notification.title}</h4>
            <p>{notification.body}</p>
            {notification.sent_by && <span className="badge">Sent by {notification.sent_by}</span>}
          </article>
        );
      })}
    </div>
  );
}
