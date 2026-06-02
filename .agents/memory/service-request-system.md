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
