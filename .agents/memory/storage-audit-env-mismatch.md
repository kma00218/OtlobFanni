---
name: Auditing storage against the right database
description: Object storage orphan/usage audits must query the production DB, not dev — dev can be nearly empty and produce wildly wrong results.
---

When auditing object storage for orphaned/unreferenced files in a project with separate dev and production databases sharing the same storage bucket, running the audit query against the dev DB (e.g. via the app's default `db` import) can show a near-empty reference set even though production has thousands of real, linked files.

**Why:** Dev and prod DBs are separate but the storage bucket is often shared. An audit that queries dev will report almost everything as "orphaned," which is false and dangerous if acted upon (bulk-deleting real production images).

**How to apply:** Before running any storage-orphan audit or cleanup, confirm which DB it queries. Cross-check the reported linked/total counts against known real production entity counts (e.g. from an admin dashboard screenshot) before trusting the report. For one-off verification, query production directly (e.g. via a read-only `executeSql` with `environment: 'production'`) rather than relying on the app's live `db` connection if there's any doubt about which environment it targets.
