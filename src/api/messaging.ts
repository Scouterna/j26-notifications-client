import { config, requirePlatformBaseUrl } from '../config';
import { apiFetch } from './http';
import type { Channel, Notification, Subscription } from '../types';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function messagingUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = trimTrailingSlash(requirePlatformBaseUrl());
  const prefix = trimTrailingSlash(config.messagingApiPrefix || '');
  return `${base}${prefix}${normalizedPath}`;
}

export async function fetchChannels(tenantKey: string): Promise<Channel[]> {
  return (await apiFetch<Channel[]>(messagingUrl(`/tenants/${tenantKey}/channels`), { method: 'GET' })) ?? [];
}

export async function fetchSubscriptions(tenantKey: string): Promise<Subscription[]> {
  return (await apiFetch<Subscription[]>(messagingUrl(`/tenants/${tenantKey}/subscriptions/me`), {
    method: 'GET',
  })) ?? [];
}

export async function fetchNotifications(
  tenantKey: string,
  params: { channelKeys?: string[]; limit?: number } = {}
): Promise<Notification[]> {
  const search = new URLSearchParams();
  if (params.limit) {
    search.set('limit', params.limit.toString());
  }
  params.channelKeys?.forEach((key) => search.append('channel', key));
  const query = search.toString();
  const suffix = query ? `?${query}` : '';
  return (await apiFetch<Notification[]>(messagingUrl(`/tenants/${tenantKey}/notifications${suffix}`), {
    method: 'GET',
  })) ?? [];
}

export async function subscribeToChannel(
  tenantKey: string,
  channelKey: string
): Promise<void> {
  return apiFetch<void>(messagingUrl(`/tenants/${tenantKey}/channels/${channelKey}/subscriptions`), {
    method: 'POST',
  });
}

export async function unsubscribeFromChannel(tenantKey: string, channelKey: string): Promise<void> {
  return apiFetch<void>(messagingUrl(`/tenants/${tenantKey}/channels/${channelKey}/subscriptions`), {
    method: 'DELETE',
    skipJson: true,
  });
}

export async function registerDeviceToken(tenantKey: string, token: string): Promise<void> {
  return apiFetch<void>(messagingUrl(`/tenants/${tenantKey}/tokens`), {
    method: 'POST',
    body: JSON.stringify({ device_tokens: [token] }),
  });
}
