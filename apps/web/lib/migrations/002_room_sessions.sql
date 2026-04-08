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
