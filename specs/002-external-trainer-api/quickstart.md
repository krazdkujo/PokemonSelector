# Quickstart: External Trainer API

## For Students

### Prerequisites

1. You have registered on the Pokemon Starter Selector app
2. You have your trainer name (the name you entered when registering)
3. Your instructor has given you the API secret key

### Making a Request

#### Using curl

```bash
curl -X GET "https://your-app.vercel.app/api/external/trainer" \
  -H "X-API-Key: YOUR_SECRET_KEY" \
  -H "X-Trainer-Name: YourName"
```

#### Using Python

```python
import requests

response = requests.get(
    "https://your-app.vercel.app/api/external/trainer",
    headers={
        "X-API-Key": "YOUR_SECRET_KEY",
        "X-Trainer-Name": "YourName"
    }
)

data = response.json()
print(f"Trainer ID: {data['trainer_id']}")
print(f"Pokemon: {data['pokemon']['name'] if data['pokemon'] else 'None selected'}")
```

#### Using JavaScript/Node.js

```javascript
const response = await fetch("https://your-app.vercel.app/api/external/trainer", {
  headers: {
    "X-API-Key": "YOUR_SECRET_KEY",
    "X-Trainer-Name": "YourName"
  }
});

const data = await response.json();
console.log("Trainer ID:", data.trainer_id);
console.log("Pokemon:", data.pokemon?.name ?? "None selected");
```

### Response Format

**Success (200)**:
```json
{
  "trainer_id": "550e8400-e29b-41d4-a716-446655440000",
  "trainer_name": "Ash",
  "pokemon": {
    "number": 25,
    "name": "Pikachu",
    "types": ["Electric"]
  }
}
```

**Trainer without Pokemon (200)**:
```json
{
  "trainer_id": "550e8400-e29b-41d4-a716-446655440001",
  "trainer_name": "Gary",
  "pokemon": null
}
```

**Error (401, 404)**:
```json
{
  "error": "TRAINER_NOT_FOUND",
  "message": "No trainer found with that name"
}
```

---

## For Instructors

### Setup

1. Generate a secret key (any random string):
   ```bash
   openssl rand -base64 32
   ```

2. Add to Vercel environment variables:
   - Go to Project Settings > Environment Variables
   - Add `EXTERNAL_API_SECRET_KEY` with your generated key
   - Redeploy for changes to take effect

3. For local development, add to `.env.local`:
   ```
   EXTERNAL_API_SECRET_KEY=your-secret-key-here
   ```

4. Share the secret key with students (securely)

### Endpoint Details

| Property | Value |
|----------|-------|
| URL | `/api/external/trainer` |
| Method | GET |
| Auth Header | `X-API-Key: <secret>` |
| Name Header | `X-Trainer-Name: <name>` |

### Rotating the Secret Key

If the key is compromised:
1. Generate a new key
2. Update in Vercel environment variables
3. Redeploy
4. Distribute new key to students

---

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid or missing API key | Check `X-API-Key` header matches instructor's key |
| 404 Not Found | Trainer name not in database | Verify spelling matches exactly (case doesn't matter) |
| 400 Bad Request | Missing trainer name | Add `X-Trainer-Name` header |
