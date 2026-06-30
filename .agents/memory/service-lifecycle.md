---
name: Service lifecycle system
description: Full request lifecycle on service_requests table — start work, customer confirm, complete, customer confirm/dispute
---

## Overview
A single `confirmation_token` (48-hex chars) is used for both phases of the lifecycle. The customer's page (`/service-confirm/:token`) reads the status to decide which phase to show.

## Status flow
new/contacted → (pro: "بدأت العمل") → in_progress
  → (customer confirms) → customer_confirmed_started
  → (pro: "إنهاء الخدمة") → pending_customer_completion_confirmation
  → (customer: confirm) → completed_confirmed
  → (customer: amount dispute) → amount_disputed
  → (customer: not done) → completion_disputed

## New columns on service_requests
work_started_at, confirmation_token, customer_started_confirmed_at,
service_amount, completion_notes, completion_token (unused — kept for future),
platform_commission (2% of service_amount), customer_dispute_note,
completed_confirmed_at, customer_rating, customer_comment, owner_name

## API endpoints (all in public.ts)
- PATCH /api/service-requests/:id/start-work — generates token, sets in_progress
- GET /api/service-confirm/:token — public, returns safe fields only (no phone)
- POST /api/service-confirm/:token/confirm-started
- PATCH /api/service-requests/:id/complete — requires serviceAmount, calculates 2% commission
- POST /api/service-confirm/:token/confirm-completed — action: confirm|amount_dispute|completion_dispute

## Frontend
- ServiceConfirm.jsx — public page at /service-confirm/:token (no header/nav)
- ProDashboard RequestCard — "بدأت العمل" button (new/contacted), "إنهاء الخدمة" (in_progress/customer_confirmed_started)
- WhatsApp messages built client-side, opened via wa.me — no API

**Why:** WA API not used by design — pro manually sends message via standard wa.me link.
**How to apply:** commission_token column exists but is unused — the same confirmation_token covers both phases.
