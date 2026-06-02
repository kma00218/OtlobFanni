---
name: Service Requests lead system
description: The "أرسل طلب" / "Request Service" feature — all components and where they live
---

## Fully implemented — do not re-implement

- **DB table:** lib/db/src/schema/service_requests.ts — fields: id, ownerId, ownerType, customerName, phone, cityName, requestType, description, preferredDatetime, photoUrls[], status, createdAt
- **API routes (public.ts):** POST /api/service-requests (create), GET /api/service-requests/mine (pro), PATCH /api/service-requests/:id/status, GET /api/service-requests/by-ids
- **API routes (admin.ts):** GET /api/admin/service-requests (with filters), PATCH /api/admin/service-requests/:id/status, DELETE /api/admin/service-requests/:id
- **api.js methods:** api.createServiceRequest(), api.myServiceRequests(type, id), api.updateServiceRequest(id, status), api.admin.serviceRequests.list/update/delete
- **Frontend modal:** src/components/RequestFormModal.jsx — sends to API + opens WhatsApp, supports photo upload, all 3 entity types (technician/company/supplier)
- **Profile page buttons:** TechnicianDetails, CompanyDetails, SupplierDetails — all have setShowRequest state + RequestFormModal mounted
- **Pro dashboard:** ProDashboard.jsx "الطلبات" tab — fetches, displays, status controls
- **Admin page:** admin/pages/AdminServiceRequests.jsx — registered in AdminLayout route + AdminSidebar nav

**Why:** This was implemented in a prior session and should not be duplicated.
