# Feature Specification: External Trainer API

**Feature Branch**: `002-external-trainer-api`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "All API's should be internal except the one external API users can connect to using their trainer name in the header and they are returned their pokemon and trainer ID. This will be a serverless function in Vercel the students will call. We need a secret key to provide them to secure the endpoint."

## Overview

This feature creates a single external-facing API endpoint that students can call to retrieve their trainer information. All other existing APIs remain internal (not publicly documented or intended for external use). The endpoint is secured with a shared secret key that instructors provide to students.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Student Retrieves Their Trainer Data (Priority: P1)

A student who has already registered and selected a starter Pokemon wants to programmatically retrieve their trainer information from an external application or script. They use the provided secret key and their trainer name to make an authenticated request to the external API endpoint.

**Why this priority**: This is the core functionality - the entire feature exists to enable this use case. Without this, students cannot access their data programmatically.

**Independent Test**: Can be fully tested by making an HTTP request with valid credentials and verifying the correct trainer data is returned.

**Acceptance Scenarios**:

1. **Given** a registered trainer with a selected starter Pokemon, **When** the student makes a request with valid secret key and their trainer name, **Then** they receive their trainer ID, trainer name, and selected Pokemon details.

2. **Given** a registered trainer without a starter Pokemon, **When** the student makes a request with valid secret key and their trainer name, **Then** they receive their trainer ID and name with Pokemon details as null.

3. **Given** valid secret key but non-existent trainer name, **When** the student makes a request, **Then** they receive a "trainer not found" error response.

---

### User Story 2 - Unauthorized Access Prevention (Priority: P1)

The system prevents unauthorized access to trainer data by requiring a valid secret key for all requests.

**Why this priority**: Security is critical - the API must not expose student data to unauthorized parties.

**Independent Test**: Can be tested by making requests with missing, invalid, or malformed secret keys and verifying access is denied.

**Acceptance Scenarios**:

1. **Given** a request without a secret key, **When** the request is made to the external API, **Then** the system returns an unauthorized error.

2. **Given** a request with an invalid secret key, **When** the request is made to the external API, **Then** the system returns an unauthorized error.

3. **Given** a request with the correct secret key, **When** the request is made to the external API, **Then** the system processes the request normally.

---

### Edge Cases

- What happens when trainer name contains special characters or spaces?
  - System handles URL-encoded names and matches against stored trainer names (case-insensitive)
- What happens when multiple trainers have the same name?
  - System returns the first matching trainer (trainer names are not unique per the original spec)
- What happens when the secret key is compromised?
  - Instructor can generate a new secret key via environment variable update
- What happens when request rate is excessive?
  - Standard Vercel serverless function rate limits apply

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a single external API endpoint for retrieving trainer data
- **FR-002**: System MUST require a valid secret key in the request header for authentication
- **FR-003**: System MUST accept trainer name as a request header parameter
- **FR-004**: System MUST return trainer ID, trainer name, and selected Pokemon details on successful request
- **FR-005**: System MUST return appropriate error responses for invalid or missing credentials
- **FR-006**: System MUST return appropriate error response when trainer is not found
- **FR-007**: All other existing API endpoints MUST remain undocumented for external use (internal only)
- **FR-008**: System MUST use a configurable secret key stored as an environment variable
- **FR-009**: System MUST return Pokemon details including name, number, and types when trainer has a starter
- **FR-010**: System MUST perform case-insensitive matching on trainer names

### Response Format

The external API returns data in a consistent format:
- **Success**: Trainer ID, trainer name, and Pokemon object (or null if not selected)
- **Error**: Error code and human-readable message

### Key Entities

- **ExternalTrainerResponse**: The data structure returned by the external API containing trainer ID, name, and Pokemon details
- **SecretKey**: A shared secret string used to authenticate requests, stored as environment variable

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can retrieve their trainer data in a single API call
- **SC-002**: Unauthorized requests are rejected 100% of the time
- **SC-003**: Valid requests return complete trainer data within 2 seconds
- **SC-004**: API response format is consistent and predictable for all request types
- **SC-005**: Zero trainer data exposed without valid secret key authentication

## Assumptions

- Students have already registered and may or may not have selected a starter Pokemon
- The secret key is distributed to students through a secure channel (e.g., classroom instruction)
- The secret key is the same for all students (shared secret model)
- Trainer name matching is case-insensitive for better user experience
- The endpoint will be deployed on Vercel as a serverless function (same infrastructure as the main application)

## Out of Scope

- Individual API keys per student
- Rate limiting beyond Vercel defaults
- API documentation portal
- Trainer data modification via external API (read-only)
- Authentication rotation or key expiry mechanisms
