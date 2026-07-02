---
name: Service request system
description: Complete lead/request system — RequestFormModal, 3 profile pages, ProDashboard tab, admin page — already fully built
---

## What exists
- DB: `service_requests` table with id, owner_id, owner_type, customer_name, phone, whatsapp_phone, city_name, request_type, description, preferred_datetime, photo_urls, status, created_at
- API (public.ts): POST /service-requests, GET /service-requests/mine, GET /service-requests/by-ids, PATCH /service-requests/:id/status
- API (admin.ts): GET /admin/service-requests (with filters), PATCH /admin/service-requests/:id/status, DELETE /admin/service-requests/:id
- Frontend: RequestFormModal.jsx (with photo upload, WhatsApp integration)
- Profile pages: TechnicianDetails.jsx, CompanyDetails.jsx, SupplierDetails.jsx all have the orange "اطلب خدمة الآن" button
- Pro dashboard: ProDashboard.jsx has "الطلبات" tab with RequestCard, badge count
- Admin: AdminServiceRequests.jsx registered at /admin/service-requests in AdminLayout.jsx

**Why:** Fully implemented. Do not re-implement.

**How to apply:** If asked to add/modify service requests, edit these existing files rather than creating new ones.

## Simplified lifecycle (as of 2026-07-02)
- Statuses in active use: `new, contacted, in_progress, awaiting_customer_confirmation, completed_confirmed, amount_disputed, completion_disputed, cancelled`. Legacy `completed` and `pending_customer_completion_confirmation`/`customer_confirmed_started` are old data only — kept in DB, grouped into the "completed" bucket in the UI, never produced by current code.
- "Start work" no longer opens WhatsApp to the customer or generates a confirmation token — it just flips status to `in_progress`. The confirmation token is generated later, only when the pro marks the job `awaiting_customer_confirmation` via the complete-service action.
- `/service-confirm/:token` (ServiceConfirm.jsx) has a single phase now (confirm completion) — the old "confirm work started" phase/route was removed entirely.
- Deep-link scheme: WhatsApp message to the pro includes `${origin}/pro?requestId=<id>`. ProDashboard reads `?requestId=` on mount, switches to the requests tab, and auto-expands/highlights/scrolls to that card. If not logged in, it redirects to `/pro-login` while preserving the full query string; ProLogin forwards `requestId` back to `/pro?requestId=<id>` after a successful login.

**Why:** Keeps the pro's WhatsApp-driven workflow low-friction (one less confirmation round-trip) while still letting the customer verify work was actually completed before it's marked done.
