-- Migration: add optional email column to all three application tables
ALTER TABLE technician_applications ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE company_applications    ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE supplier_applications   ADD COLUMN IF NOT EXISTS email text;
