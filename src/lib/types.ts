// Mirrors agroai_crops-agent-api src/admin/schemas.py.

export type Bucket = { key: string; count: number };

export type Overview = {
  generated_at: string;
  window_days: number;
  since: string;
  users: {
    total: number;
    active: number;
    inactive: number;
    enrolled: number;
    pending_onboarding: number;
    new_in_window: number;
    by_role: Bucket[];
    dau: number;
    wau: number;
    mau: number;
    active_in_window: number;
    byok_configured: number;
    byok_missing: number;
  };
  accounts: {
    total: number;
    new_in_window: number;
    avg_users_per_account: number;
    multi_user: number;
    with_fields: number;
    with_activity_in_window: number;
  };
  profiles: { profile: Bucket[]; experience: Bucket[]; goal: Bucket[]; risk: Bucket[]; philosophy: Bucket[] };
  photos: {
    total: number;
    in_window: number;
    uploads: number;
    layout_photos: number;
    used_in_chat: number;
    users_with_photos: number;
    by_type: Bucket[];
    by_status: Bucket[];
    diagnosis_success_rate: number | null;
  };
  conversations: {
    total: number;
    in_window: number;
    archived: number;
    messages_total: number;
    user_messages: number;
    user_messages_in_window: number;
    avg_messages_per_conversation: number;
    median_messages_per_conversation: number;
    users_with_conversations: number;
  };
  sessions: {
    gap_minutes: number;
    total: number;
    users: number;
    avg_minutes: number;
    median_minutes: number;
    p90_minutes: number;
    avg_turns: number;
    median_turns: number;
    sessions_per_user: number;
    length_buckets: Bucket[];
  };
  agent: {
    tool_calls: number;
    tool_calls_failed: number;
    turns_with_tools: number;
    turns_with_search: number;
    tools: { name: string; calls: number; failed: number }[];
    memories_active: number;
    memories_in_window: number;
  };
  farm: {
    fields_total: number;
    fields_in_window: number;
    fields_with_area: number;
    area_total_m2: number;
    area_avg_m2: number | null;
    area_median_m2: number | null;
    area_min_m2: number | null;
    area_max_m2: number | null;
    area_buckets: Bucket[];
    fields_with_location: number;
    fields_with_boundary: number;
    fields_with_layout: number;
    avg_fields_per_account: number;
    crop_cycles_total: number;
    crop_cycles_active: number;
    crop_cycles_in_window: number;
    cycles_by_status: Bucket[];
    top_crops: Bucket[];
    events_total: number;
    events_in_window: number;
    events_by_type: Bucket[];
    events_by_source: Bucket[];
  };
  alerts: { total: number; in_window: number; unacknowledged: number; by_source: Bucket[]; by_severity: Bucket[] };
  modules: { module: string; accounts: number; records: number }[];
  system: {
    database: string;
    last_forecast_issued_at: string | null;
    last_weather_observation_at: string | null;
    last_report_at: string | null;
    last_message_at: string | null;
  };
};

export type DailyPoint = {
  day: string;
  signups: number;
  active_users: number;
  user_messages: number;
  conversations: number;
  sessions: number;
  photos: number;
  events: number;
};

export type Timeseries = { days: number; timezone: string; points: DailyPoint[] };

export type AdminUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  account_id: string;
  account_name: string;
  role: string;
  is_active: boolean;
  is_enrolled: boolean;
  profile: string | null;
  byok_configured: boolean;
  created_at: string;
  last_active_at: string | null;
  conversations: number;
  user_messages: number;
  sessions: number;
  chat_minutes: number;
  photos: number;
  events: number;
};

export type AdminAccount = {
  id: string;
  name: string;
  created_at: string;
  users: number;
  active_users: number;
  owners: number;
  tecnicos: number;
  staff: number;
  fields: number;
  area_m2: number;
  crop_cycles: number;
  crop_cycles_active: number;
  photos: number;
  conversations: number;
  user_messages: number;
  events: number;
  last_active_at: string | null;
};

export type AdminMe = { id: string; email: string; first_name: string | null; last_name: string | null };
