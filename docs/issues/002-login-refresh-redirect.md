# Issue: Login appears to "refresh" and return to Home without showing logged-in state

## Summary
Clicking Log In submits successfully and routes to Home, but the header still shows "Login" and "Sign Up". This makes it seem like login failed, even though the token and user are saved.

## Root Cause
`Header` does not conditionally render based on the `user` prop, so it always shows the guest navigation (Login/Sign Up). The Login page then navigates to `/`, which is expected after a successful login, but the UI doesn't reflect the authenticated state.

## Acceptance Criteria
- After successful login, the header shows authenticated actions (e.g., Profile and Logout; Upload for admins) instead of Login/Sign Up.
- Logout returns the header to guest state and clears local session.
- No change to the login API.

## Tasks
- Update `src/components/Header.js` to:
  - If `user` is falsy: show Login and Sign Up.
  - If `user` is truthy: show profile link and logout button; optionally show Upload if `user.role === "admin"`.
- Verify localStorage persists session and `App` hydrates `user` on reload.

## Notes
- Backend login flow is working; this is a frontend UI state issue.

