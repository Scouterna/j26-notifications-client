import type { Channel } from '../types';

type ChannelListProps = {
  channels: Channel[];
  subscribedChannelKeys: Set<string>;
  busyChannelKey?: string | null;
  onSubscribe: (channel: Channel) => Promise<void>;
  onUnsubscribe: (channel: Channel) => Promise<void>;
  canSubscribe: boolean;
};

export function ChannelList({
  channels,
  subscribedChannelKeys,
  busyChannelKey,
  onSubscribe,
  onUnsubscribe,
  canSubscribe,
}: ChannelListProps) {
  if (!channels.length) {
    return <p>No channels available for this tenant.</p>;
  }

  return (
    <div className="channel-grid">
      {channels.map((channel) => {
        const channelKey = channel.id;
        const isSubscribed = subscribedChannelKeys.has(channelKey);
        return (
          <div className="channel-card" key={channelKey || channel.name}>
            <div>
              <h3>{channel.name}</h3>
              {channel.description && <p className="badge">{channel.description}</p>}
            </div>
            <div className={`status-pill ${isSubscribed ? 'active' : 'inactive'}`}>
              {isSubscribed ? 'Subscribed' : 'Not subscribed'}
            </div>
            <button
              className={isSubscribed ? 'leave' : undefined}
              disabled={busyChannelKey === channelKey || (!isSubscribed && !canSubscribe)}
              onClick={() => (isSubscribed ? onUnsubscribe(channel) : onSubscribe(channel))}
            >
              {isSubscribed ? 'Leave channel' : 'Join channel'}
            </button>
            {!isSubscribed && !canSubscribe && (
              <p className="badge">Enable push notifications to join</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
