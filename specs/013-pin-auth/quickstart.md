# Quickstart: PIN Authentication Layer

**Feature**: 013-pin-auth
**Date**: 2026-01-12

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project with existing `trainers` table
- Environment variables configured (`.env.local`)

## Setup Steps

### 1. Run Database Migration

Apply the PIN fields migration to your Supabase database:

```bash
# Option A: Using the migration script
npm run db:migrate

# Option B: Run SQL directly in Supabase SQL Editor
# Copy contents of sql/011_add_pin_fields.sql
```

### 2. Install Dependencies

No new dependencies required. Uses existing:
- `bcryptjs` - Already installed for API key hashing
- `@supabase/supabase-js` - Database client
- `@supabase/ssr` - Server-side Supabase

### 3. Start Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

## Testing the Feature

### New User Flow

1. Navigate to `http://localhost:3000`
2. Enter a new trainer name and submit
3. You should be redirected to `/pin/create`
4. Enter a 4-digit PIN and confirm it
5. Submit - you should now access the dashboard

### Existing User Flow (No PIN)

1. Clear your browser's localStorage and cookies
2. Log in with an existing trainer name that has no PIN
3. You should be redirected to `/pin/create`
4. Complete PIN creation

### PIN Verification Flow

1. Log out (or clear sessionStorage)
2. Log in with a trainer that has a PIN set
3. You should be redirected to `/pin/verify`
4. Enter your PIN to access the dashboard

### Lockout Testing

1. Log in with a trainer that has a PIN
2. Enter wrong PIN 5 times
3. On the 5th failure, account should lock
4. Verify lockout message shows remaining time
5. Wait 15 minutes (or use admin unlock)

### Admin PIN Management

1. Log in as an admin user
2. Navigate to `/admin`
3. Find a trainer in the list
4. Test each action:
   - **Reset PIN**: Clears PIN, user must create new
   - **Unlock**: Clears lockout if locked
   - **Set Temp PIN**: Sets PIN with change required

### Temporary PIN Flow

1. As admin, set a temporary PIN for a test user
2. Log out and log in as that user
3. Enter the temporary PIN
4. Verify message: "Your PIN was reset by support..."
5. Create a new PIN
6. Verify you can now access the dashboard

## API Testing (curl)

### Check PIN Status
```bash
curl -X GET http://localhost:3000/api/pin/status \
  -H "Cookie: trainer_id=YOUR_TRAINER_ID"
```

### Create PIN
```bash
curl -X POST http://localhost:3000/api/pin/create \
  -H "Content-Type: application/json" \
  -H "Cookie: trainer_id=YOUR_TRAINER_ID" \
  -d '{"pin": "1234", "confirm_pin": "1234"}'
```

### Verify PIN
```bash
curl -X POST http://localhost:3000/api/pin/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: trainer_id=YOUR_TRAINER_ID" \
  -d '{"pin": "1234"}'
```

### Admin Reset (requires admin cookie)
```bash
curl -X POST http://localhost:3000/api/pin/admin/reset \
  -H "Content-Type: application/json" \
  -H "Cookie: trainer_id=ADMIN_TRAINER_ID" \
  -d '{"user_id": "TARGET_USER_UUID"}'
```

## Verification Checklist

- [ ] New users are prompted to create PIN after registration
- [ ] Existing users without PIN are prompted on login
- [ ] PIN verification required on each session
- [ ] Wrong PIN shows error message
- [ ] 5 failed attempts triggers 15-minute lockout
- [ ] Lockout shows remaining time
- [ ] Admin can reset user PIN
- [ ] Admin can unlock locked accounts
- [ ] Admin can set temporary PIN
- [ ] Temporary PIN shows message and forces change
- [ ] API endpoints remain accessible without PIN (existing auth)
- [ ] External API (`/api/external/*`) unaffected by PIN

## Troubleshooting

### "Cannot find PIN fields in database"
Run the migration: `npm run db:migrate` or apply SQL manually.

### "Redirect loop on PIN pages"
Check that `/pin/create` and `/pin/verify` are in the middleware whitelist.

### "Admin actions return 403"
Verify the logged-in user has `role: 'admin'` in the database.

### "PIN verification always fails"
Check bcryptjs is comparing correctly. Verify PIN is stored as hash, not plaintext.
