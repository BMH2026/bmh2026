create extension if not exists "pgcrypto";

create table if not exists policy_versions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  effective_at timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  guest_name text not null,
  phone text not null,
  email text,
  check_in_date date not null,
  check_out_date date not null,
  room_type text not null,
  status text not null check (status in ('PENDING_CONFIRMATION', 'CONFIRMED', 'FAILED', 'CANCELLED')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_dates on bookings(check_in_date, check_out_date);
create index if not exists idx_bookings_status on bookings(status);

create table if not exists consent_logs (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('BOOKING', 'LEAD')),
  subject_ref text not null,
  consent_type text not null,
  consent_given boolean not null,
  policy_version text not null,
  source_ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_consent_subject on consent_logs(subject_type, subject_ref);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('SYSTEM', 'ADMIN', 'CUSTOMER')),
  actor_ref text,
  event_type text not null,
  entity_type text not null,
  entity_ref text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_events_entity on audit_events(entity_type, entity_ref, created_at desc);

create table if not exists idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  request_hash text not null,
  status text not null check (status in ('IN_PROGRESS', 'COMPLETED', 'FAILED')),
  response_payload jsonb,
  response_status_code integer,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_idempotency_expires on idempotency_keys(expires_at);

create table if not exists outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null,
  status text not null check (status in ('PENDING', 'PROCESSING', 'DONE', 'FAILED')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  worker_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_outbox_dispatch on outbox_events(status, available_at, created_at);

create table if not exists data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('ACCESS', 'RECTIFY', 'ERASE', 'PORTABILITY')),
  requester_ref text not null,
  status text not null check (status in ('OPEN', 'IN_PROGRESS', 'DONE', 'REJECTED')),
  due_at timestamptz not null,
  result_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Operational hardening: integrity constraints, updated_at triggers, and dispatch indexes.

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Ensure booking dates are always valid.
alter table bookings
  drop constraint if exists chk_bookings_date_range;

alter table bookings
  add constraint chk_bookings_date_range
  check (check_out_date > check_in_date);

-- Auto-update updated_at columns.
drop trigger if exists trg_bookings_set_updated_at on bookings;
create trigger trg_bookings_set_updated_at
before update on bookings
for each row execute function set_updated_at();

drop trigger if exists trg_idempotency_set_updated_at on idempotency_keys;
create trigger trg_idempotency_set_updated_at
before update on idempotency_keys
for each row execute function set_updated_at();

drop trigger if exists trg_outbox_set_updated_at on outbox_events;
create trigger trg_outbox_set_updated_at
before update on outbox_events
for each row execute function set_updated_at();

drop trigger if exists trg_data_subject_requests_set_updated_at on data_subject_requests;
create trigger trg_data_subject_requests_set_updated_at
before update on data_subject_requests
for each row execute function set_updated_at();

-- Improve outbox dispatch and triage queries.
create index if not exists idx_outbox_pending_dispatch
  on outbox_events(available_at asc, created_at asc)
  where status = 'PENDING';

create index if not exists idx_outbox_failed_triage
  on outbox_events(updated_at desc)
  where status = 'FAILED';

-- Improve idempotency cleanup scans.
create index if not exists idx_idempotency_expired_scan
  on idempotency_keys(expires_at asc)
  where status in ('COMPLETED', 'FAILED');
-- Add field for international data transfer consent (ND13/2023)
-- This field will become completely required once Legal reviews the text.
ALTER TABLE consent_logs 
ADD COLUMN IF NOT EXISTS consent_cross_border boolean NOT NULL DEFAULT false;
-- Migration 0003: Vessel Schedules
-- Stores daily ferry schedules that admin can update without code changes.
-- Route context: Ao Tien Port (Van Don) <-> Minh Chau Island

create table if not exists vessel_schedules (
  id          bigserial primary key,
  route       text        not null default 'Ao Tiên ↔ Minh Châu',
  operator    text        not null,
  departure   time        not null,   -- e.g. '07:30'
  direction   text        not null check (direction in ('inbound', 'outbound', 'both')),
  schedule_date date      not null default current_date,
  status      text        not null default 'scheduled'
                check (status in ('scheduled', 'departed', 'arrived', 'cancelled')),
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast daily lookups
create index if not exists idx_vessel_schedules_date
  on vessel_schedules (schedule_date);

-- Seed default schedule for today (can be overridden by admin)
insert into vessel_schedules (operator, departure, direction, schedule_date, status)
values
  ('Havaco',      '07:30', 'inbound',  current_date, 'scheduled'),
  ('Quang Minh',  '10:00', 'both',     current_date, 'scheduled'),
  ('Havaco',      '13:30', 'outbound', current_date, 'scheduled'),
  ('Kalong',      '15:30', 'inbound',  current_date, 'scheduled')
on conflict do nothing;
create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value text not null,
  description text,
  updated_at timestamptz not null default now()
);

-- Insert default pricing settings
insert into app_settings (setting_key, setting_value, description) values
  ('pricing_combo', '3065000', 'Giá Combo 3N2D / khách'),
  ('pricing_room_2_bed', '1600000', 'Căn Phi Thuyền 2 giường gốc'),
  ('pricing_room_1_bed', '1400000', 'Căn Phi Thuyền 1 giường gốc'),
  ('pricing_homestay_2_bed', '1400000', 'Homestay 2 giường gốc'),
  ('pricing_homestay_1_bed', '1200000', 'Homestay 1 giường gốc'),
  ('pricing_weekend_surcharge', '200000', 'Phụ thu cuối tuần (Thứ 6, 7, CN)'),
  ('pricing_holiday_multiplier', '1.0', 'Hệ số tăng giá ngày Lễ (1.0 là không tăng)')
on conflict (setting_key) do nothing;

create index if not exists idx_bookings_created_at on bookings(created_at desc);
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blob_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    size_bytes INT NOT NULL,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster retrieval when sorting by creation date
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at DESC);
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    tags TEXT,
    status TEXT DEFAULT 'PUBLISHED',
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_publish_date ON articles(publish_date DESC);
-- Migration 0007: Chuẩn hoá key giá phòng trong app_settings
-- Lý do: migration 0004 dùng key sai (pricing_room_2_bed) và giá sai thực tế.
-- Migration này upsert lại đúng 8 key weekday/weekend khớp với constants.ts.
-- Giá gốc (constants.ts 2026-04-05):
--   Phi Thuyền 2G: 1.300.000đ (ngày thường) | 1.500.000đ (cuối tuần)
--   Phi Thuyền 1G: 1.200.000đ | 1.400.000đ
--   Homestay 2G:   1.200.000đ | 1.400.000đ
--   Homestay 1G:   1.000.000đ | 1.200.000đ

insert into app_settings (setting_key, setting_value, description) values
  ('pricing_phi_thuyen_2_weekday', '1300000', 'Phi Thuyền 2 giường — Ngày thường (T2–T5)'),
  ('pricing_phi_thuyen_2_weekend', '1500000', 'Phi Thuyền 2 giường — Cuối tuần (T6, T7, CN, Lễ)'),
  ('pricing_phi_thuyen_1_weekday', '1200000', 'Phi Thuyền 1 giường — Ngày thường (T2–T5)'),
  ('pricing_phi_thuyen_1_weekend', '1400000', 'Phi Thuyền 1 giường — Cuối tuần (T6, T7, CN, Lễ)'),
  ('pricing_homestay_2_weekday',   '1200000', 'Homestay 2 giường — Ngày thường (T2–T5)'),
  ('pricing_homestay_2_weekend',   '1400000', 'Homestay 2 giường — Cuối tuần (T6, T7, CN, Lễ)'),
  ('pricing_homestay_1_weekday',   '1000000', 'Homestay 1 giường — Ngày thường (T2–T5)'),
  ('pricing_homestay_1_weekend',   '1200000', 'Homestay 1 giường — Cuối tuần (T6, T7, CN, Lễ)'),
  ('pricing_weekend_surcharge',    '200000',  'Phụ thu cuối tuần so với ngày thường (đ/đêm)'),
  ('pricing_speed_boat',           '220000',  'Vé tàu cao tốc 1 lượt/người'),
  ('pricing_port_ticket',          '55000',   'Vé cảng Ao Tiên 1 lượt/người'),
  ('pricing_electric_car_private', '100000',  'Xe điện bao chuyến từ cảng Minh Châu'),
  ('pricing_electric_car_retail',  '30000',   'Xe điện khách lẻ từ cảng Minh Châu'),
  ('pricing_combo',                '3065000', 'Combo 3N2D Phi Thuyền / khách'),
  ('pricing_tour_den_cau',         '1700000', 'Tour xe Đền Cậu — 2 chiều'),
  ('pricing_tour_eo_gio',          '1500000', 'Tour xe Eo Gió — 2 chiều'),
  ('pricing_tour_doi_vo_cuc',      '1200000', 'Tour xe Đồi Vô Cực — 2 chiều'),
  ('pricing_tour_quan_lan',        '800000',  'Tour xe Quan Lạn — 2 chiều'),
  ('pricing_tour_angsana',         '700000',  'Tour xe Angsana — 2 chiều'),
  ('pricing_tour_song_cat_trang',  '500000',  'Tour xe Dòng Sông Cát Trắng — 2 chiều')
on conflict (setting_key) do update
  set setting_value = excluded.setting_value,
      description = excluded.description,
      updated_at = now();

-- Xoá các key cũ sai schema (tên không nhất quán từ migration 0004)
delete from app_settings where setting_key in (
  'pricing_room_2_bed',
  'pricing_room_1_bed',
  'pricing_homestay_2_bed',
  'pricing_homestay_1_bed',
  'pricing_holiday_multiplier'
);
-- migrations/20260331_add_completed_status.sql
ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN (
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'FAILED',
    'CANCELLED',
    'COMPLETED'
  ));
-- Cần thiết để hỗ trợ xử lý PostgreSQL 23505 cho Cùng loại phòng và thời điểm
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_double_booking_active
  ON bookings(room_type, check_in_date, check_out_date)
  WHERE status IN ('PENDING_CONFIRMATION', 'CONFIRMED');
-- Migration 002: Room Sessions (Guest Auth)
-- Run once against production Postgres database.
-- Uses gen_random_uuid() — available in Postgres 13+ without pgcrypto.

CREATE TABLE IF NOT EXISTS room_sessions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID        NOT NULL,  -- references bookings(id), soft ref (no FK to allow manual sessions)
  room_type      TEXT        NOT NULL,  -- e.g. 'phi-thuyen-2'
  guest_name     TEXT        NOT NULL,
  guest_email    TEXT,                  -- optional, used for Magic Link
  token          UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  check_in       TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out      TIMESTAMPTZ NOT NULL,  -- hard TTL: after this, session is expired
  terminated_at  TIMESTAMPTZ,           -- set by staff for early check-out
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_room_sessions_token     ON room_sessions (token);
CREATE INDEX IF NOT EXISTS idx_room_sessions_booking   ON room_sessions (booking_id);
CREATE INDEX IF NOT EXISTS idx_room_sessions_active    ON room_sessions (check_out) WHERE terminated_at IS NULL;
