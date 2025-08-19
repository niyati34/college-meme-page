# Issue: Upload not working (meme not uploaded)

## Symptoms

- Clicking Share on the Upload page does nothing or silently fails.
- No clear error shown to the user.

## Likely Causes

- Route `/api/memes/upload` requires admin: `verifyUser` + `verifyAdmin`.
- Missing Cloudinary env (CLOUDINARY\_\*) causes storage failure.
- Client not showing API error; user thinks it just doesn't work.

## Acceptance Criteria

- Upload page shows a clear error if upload fails (e.g., 401/403/500).
- Non-admins cannot access the upload UI and are informed to login as admin.
- Admin upload succeeds when env is configured.

## Tasks

- Frontend: Add admin guard and error surface in `src/pages/Upload.js`.
- Verify backend env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `JWT_SECRET`, `MONGO_URI`.

