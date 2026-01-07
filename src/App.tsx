import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { config } from './config';
import type { Channel, Notification, Subscription, SessionUser } from './types';
import { getCurrentUser } from './api/http';
import {
  fetchChannels,
  fetchNotifications,
  fetchSubscriptions,
  registerDeviceToken,
  subscribeToChannel,
  unsubscribeFromChannel,
} from './api/messaging';
import { ChannelList } from './components/ChannelList';
import { NotificationFeed } from './components/NotificationFeed';
import { usePushToken } from './push/usePushToken';
import { useForegroundMessage } from './push/useForegroundMessage';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

function areNotificationsEqual(prev: Notification[], next: Notification[]): boolean {
  if (prev.length !== next.length) {
    return false;
  }
  for (let i = 0; i < prev.length; i += 1) {
    if (prev[i].id !== next[i].id) {
      return false;
    }
  }
  return true;
}

export default function App() {
  const tenantKey = config.defaultTenant;
  const [user, setUser] = useState<SessionUser | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyChannelKey, setBusyChannelKey] = useState<string | null>(null);
  const [subscriptionsReady, setSubscriptionsReady] = useState(false);
  const sessionRequestedRef = useRef(false);

  const sessionReady = Boolean(user);
  const { pushToken, pushError, requestPermission, isRegistering } = usePushToken();
  const canSubscribe = Boolean(pushToken);
  useForegroundMessage(canSubscribe);
  const handleEnablePush = useCallback(() => {
    void requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (!sessionReady || !pushToken) {
      return;
    }
    let didCancel = false;
    void (async () => {
      try {
        await registerDeviceToken(tenantKey, pushToken);
      } catch (error) {
        if (!didCancel) {
          console.error('Failed to register device token', error);
          setErrorMessage((prev) => prev ?? 'Failed to register device for notifications.');
        }
      }
    })();
    return () => {
      didCancel = true;
    };
  }, [sessionReady, pushToken, tenantKey]);

  useEffect(() => {
    async function loadSession() {
      try {
        setLoadState('loading');
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoadState('ready');
      } catch (error) {
        setLoadState('error');
        setErrorMessage('Failed to load the current session.');
        console.error(error);
      }
    }
    if (sessionRequestedRef.current) {
      return;
    }
    sessionRequestedRef.current = true;
    loadSession();
  }, []);

  const loadTenantData = useCallback(async () => {
    if (!sessionReady) {
      return;
    }
    setErrorMessage(null);
    const [channelsResult, subscriptionsResult] = await Promise.allSettled([
      fetchChannels(tenantKey),
      fetchSubscriptions(tenantKey),
    ]);

    if (channelsResult.status === 'fulfilled') {
      const sortedChannels = [...channelsResult.value].sort((a, b) => a.name.localeCompare(b.name));
      setChannels(sortedChannels);
    } else {
      console.error('Failed to load channels', channelsResult.reason);
      setChannels([]);
      setErrorMessage('Failed to load channels.');
    }

    if (subscriptionsResult.status === 'fulfilled') {
      setSubscriptions(subscriptionsResult.value);
    } else {
      console.error('Failed to load subscriptions', subscriptionsResult.reason);
      setSubscriptions([]);
      setErrorMessage((prev) => prev ?? 'Failed to load subscriptions.');
    }
    setSubscriptionsReady(true);
  }, [sessionReady, tenantKey]);

  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);

  const subscribedChannelKeys = useMemo(() => {
    return new Set(
      subscriptions
        .map((sub) => sub.channel_key || sub.channel_id)
        .filter((key): key is string => Boolean(key))
    );
  }, [subscriptions]);

  const channelNameMap = useMemo(() => {
    const map = new Map<string, string>();
    channels.forEach((channel) => {
      map.set(channel.id, channel.name);
      if (channel.key) {
        map.set(channel.key, channel.name);
      }
    });
    return map;
  }, [channels]);

  const loadNotifications = useCallback(async () => {
    if (!sessionReady || !subscriptionsReady) {
      return;
    }
    setNotificationsLoading(true);
    try {
      const channelKeysFilter = Array.from(subscribedChannelKeys);
      const notificationData = await fetchNotifications(tenantKey, {
        channelKeys: channelKeysFilter.length ? channelKeysFilter : undefined,
        limit: config.notificationLimit,
      });
      const sortedNotifications = [...notificationData].sort(
        (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      );
      setNotifications((prev) => (areNotificationsEqual(prev, sortedNotifications) ? prev : sortedNotifications));
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  }, [sessionReady, subscriptionsReady, tenantKey, subscribedChannelKeys]);

  useEffect(() => {
    if (!subscriptionsReady) {
      return;
    }
    loadNotifications();
    if (config.notificationPollIntervalMs <= 0) {
      return;
    }
    const interval = window.setInterval(loadNotifications, config.notificationPollIntervalMs);
    return () => window.clearInterval(interval);
  }, [loadNotifications, subscriptionsReady]);

  const refreshSubscriptions = useCallback(async () => {
    try {
      const subs = await fetchSubscriptions(tenantKey);
      setSubscriptions(subs);
      setSubscriptionsReady(true);
    } catch (error) {
      console.error('Failed to refresh subscriptions', error);
      setErrorMessage((prev) => prev ?? 'Failed to refresh subscriptions.');
    }
  }, [tenantKey]);

  const handleSubscribe = useCallback(
    async (channel: Channel) => {
      const channelKey = channel.id;
      setBusyChannelKey(channelKey);
      try {
        if (!pushToken) {
          setErrorMessage('Enable push notifications before joining channels.');
          return;
        }
        await subscribeToChannel(tenantKey, channelKey);
        await refreshSubscriptions();
        await loadNotifications();
      } catch (error) {
        console.error(error);
        setErrorMessage(`Failed to join ${channel.name}.`);
      } finally {
        setBusyChannelKey(null);
      }
    },
    [tenantKey, pushToken, refreshSubscriptions, loadNotifications]
  );

  const handleUnsubscribe = useCallback(
    async (channel: Channel) => {
      const channelKey = channel.id;
      setBusyChannelKey(channelKey);
      try {
        await unsubscribeFromChannel(tenantKey, channelKey);
        await refreshSubscriptions();
        await loadNotifications();
      } catch (error) {
        console.error(error);
        setErrorMessage(`Failed to leave ${channel.name}.`);
      } finally {
        setBusyChannelKey(null);
      }
    },
    [tenantKey, refreshSubscriptions, loadNotifications]
  );

  if (!sessionReady) {
    return (
      <div className="app-shell">
        <header className="page-header">
          <h1>J26 Notifications</h1>
          <p>Checking your session…</p>
        </header>
        {loadState === 'error' ? (
          <div className="error-banner">
            {errorMessage || 'Unable to verify your session. Please refresh to try again.'}
          </div>
        ) : (
          <p>Loading…</p>
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="page-header">
        <p className="badge">Signed in as {user?.name || 'loading…'} · Tenant {tenantKey}</p>
        <h1>J26 Notifications</h1>
        <p>Subscribe to channels to receive announcements and push notifications.</p>
        <div className="push-actions">
          {pushToken ? (
            <span className="status-pill active">Push enabled</span>
          ) : (
            <button onClick={handleEnablePush} disabled={!sessionReady || isRegistering}>
              {isRegistering ? 'Enabling…' : 'Enable push notifications'}
            </button>
          )}
        </div>
      </header>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}
      {pushError && <div className="error-banner">Push notifications: {pushError}</div>}

      <section className="panel" aria-live="polite">
        <h2>Channels</h2>
        {loadState === 'loading' && <p>Loading session…</p>}
        <ChannelList
          channels={channels}
          subscribedChannelKeys={subscribedChannelKeys}
          busyChannelKey={busyChannelKey}
          onSubscribe={handleSubscribe}
          onUnsubscribe={handleUnsubscribe}
          canSubscribe={canSubscribe}
        />
      </section>

      <section className="panel" style={{ marginTop: '1.5rem' }}>
        <h2>Latest notifications</h2>
        <NotificationFeed notifications={notifications} isLoading={notificationsLoading} channelNames={channelNameMap} />
      </section>
    </div>
  );
}
