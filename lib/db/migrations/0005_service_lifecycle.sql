-- Service lifecycle columns
ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
  ADD COLUMN IF NOT EXISTS customer_started_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS service_amount TEXT,
  ADD COLUMN IF NOT EXISTS completion_notes TEXT,
  ADD COLUMN IF NOT EXISTS completion_token TEXT,
  ADD COLUMN IF NOT EXISTS platform_commission TEXT,
  ADD COLUMN IF NOT EXISTS customer_dispute_note TEXT,
  ADD COLUMN IF NOT EXISTS completed_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_rating TEXT,
  ADD COLUMN IF NOT EXISTS customer_comment TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT;
