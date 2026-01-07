# Research: External Trainer API

**Date**: 2026-01-07
**Branch**: `002-external-trainer-api`

## Research Tasks

### 1. Secret Key Authentication Pattern

**Decision**: Use `X-API-Key` header for secret key authentication

**Rationale**:
- Industry-standard header name for API key authentication
- Separate from `Authorization` header (reserved for bearer tokens/OAuth)
- Easy for students to include in curl, Postman, or code
- Clear distinction between external API auth and internal session auth

**Alternatives considered**:
- `Authorization: Bearer <key>` - More complex, implies token-based auth
- Query parameter `?api_key=xxx` - Insecure (logged in URLs, browser history)
- Custom header - Less discoverable than standard `X-API-Key`

### 2. Trainer Name Header Format

**Decision**: Use `X-Trainer-Name` header for trainer name

**Rationale**:
- Custom header clearly indicates purpose
- Avoids URL encoding issues with special characters in names
- Keeps endpoint URL simple (`/api/external/trainer`)
- Can handle spaces and special characters via UTF-8 header encoding

**Alternatives considered**:
- URL path parameter `/api/external/trainer/{name}` - Complex URL encoding for names with spaces
- Query parameter `?name=xxx` - Works but mixes auth (header) with data (query)
- Request body - Requires POST method, complicates simple GET lookup

### 3. Response Format

**Decision**: JSON with consistent structure for success and error cases

**Rationale**:
- Predictable parsing for students' code
- Includes all trainer fields plus nested Pokemon object
- Error responses include machine-readable code and human message

**Response Schema**:
```json
// Success (200)
{
  "trainer_id": "uuid-string",
  "trainer_name": "string",
  "pokemon": {
    "number": 25,
    "name": "Pikachu",
    "types": ["Electric"]
  } | null
}

// Error (401, 404, 500)
{
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```

### 4. Case-Insensitive Name Matching

**Decision**: Use PostgreSQL `ILIKE` for case-insensitive matching

**Rationale**:
- Students may not remember exact capitalization of their name
- Supabase/PostgreSQL natively supports `ILIKE`
- No performance concern at classroom scale

**Implementation**:
```sql
SELECT * FROM trainers WHERE name ILIKE $1 LIMIT 1
```

### 5. Environment Variable Naming

**Decision**: Use `EXTERNAL_API_SECRET_KEY` for the secret

**Rationale**:
- Descriptive name indicates purpose
- Follows existing `.env.local` conventions
- Distinct from Supabase keys

### 6. Error Codes

**Decision**: Use specific error codes for different failure modes

| HTTP Status | Error Code | Meaning |
|-------------|------------|---------|
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 404 | `TRAINER_NOT_FOUND` | No trainer with that name |
| 400 | `BAD_REQUEST` | Missing trainer name header |
| 500 | `INTERNAL_ERROR` | Server error |

## No Outstanding Clarifications

All technical decisions resolved. Ready for Phase 1.
