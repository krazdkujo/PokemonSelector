# API Contracts: Dark Mode Toggle

**Feature Branch**: `014-dark-mode`
**Date**: 2026-01-12

## No API Contracts Required

The dark mode toggle feature is entirely client-side and does not require any new API endpoints or modifications to existing APIs.

### Rationale

- Theme preference is stored in browser localStorage, not on the server
- No user authentication is required to set a theme preference
- No data needs to be synchronized across devices (per-browser preference)
- The feature follows the "Serverless Architecture" constitution principle by using client-side state

### Existing APIs Unaffected

The following existing API endpoints remain unchanged:
- `GET /api/starter` - Public starter lookup
- `GET /api/trainers` - Trainer list
- `POST /api/trainers` - Trainer creation
- All other existing endpoints

### Future Considerations

If theme preference sync across devices is desired in the future:
1. Add `theme_preference` column to `profiles` table
2. Create `GET/PUT /api/user/preferences` endpoint
3. Sync localStorage with server on authenticated sessions

This is out of scope for the current feature.
