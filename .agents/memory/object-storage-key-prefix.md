---
name: Object storage bucket key prefix gotcha
description: DB-stored object paths need the private-dir prefix reconstructed before you can check/delete them directly in the bucket.
---

Object paths saved in the database (e.g. `/objects/uploads/<uuid>`) are stripped of the storage service's private-directory prefix (e.g. `.private/`). The actual GCS object key is `<privateDir>/uploads/<uuid>`.

**Why:** Comparing or operating on bucket files using the DB-style path directly (without reconstructing the prefix) makes every real, linked file look "missing" — a false negative that could trigger safety aborts or, worse, be silently ignored.

**How to apply:** Before checking existence or deleting objects by path, derive the private dir from `PRIVATE_OBJECT_DIR` (or by sampling one real file's `.name` from a bucket listing) and prepend it to any path taken from the DB. Always sanity-check a small sample of known-real, "linked" paths against the bucket before running any bulk/destructive operation.
