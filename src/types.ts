export type Channel = {
  id: string;
  key?: string;
  tenant_id: string;
  name: string;
  description?: string;
  is_open: boolean;
  is_private: boolean;
  parent_keys?: string[];
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
};

export type Subscription = {
  id: string;
  tenant_id: string;
  channel_id: string;
  channel_key?: string;
  user_id: string;
  device_tokens?: string[];
  created_at: string;
};

export type Notification = {
  id: string;
  tenant_id: string;
  channel_id?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sent_by?: string;
  sent_at: string;
};

export type ApiError = {
  status: number;
  message: string;
};

export type SessionUser = {
  name: string;
};
