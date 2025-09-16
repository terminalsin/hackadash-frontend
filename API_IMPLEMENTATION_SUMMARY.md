# API Implementation Summary

This document outlines the changes made to implement the FastAPI backend specification in the frontend application.

## Overview

The frontend has been updated to match the FastAPI backend specification provided. The implementation includes:

1. Updated TypeScript types to match backend schemas
2. New API service interface aligned with backend endpoints
3. Real API service implementation for production use
4. Updated mock API service for development
5. Updated React hooks to use new API interface
6. Service abstraction layer for easy switching between mock and real APIs

## Key Changes

### 1. Type System Updates (`/types/index.ts`)

**Updated Enums:**
- `UserRole`: Changed values to uppercase (`ORGANISER`, `GUEST`, `SPONSOR`)

**Updated Interfaces:**
- Changed ID types from `string` to `number` for entities
- Updated property names to use snake_case to match backend:
  - `createdAt` → `created_at`
  - `updatedAt` → `updated_at`
  - `hackathonId` → `hackathon_id`
  - `startTime` → `start_time`
  - `endTime` → `end_time`
  - `pinCode` → `pin_code`
  - `isStarted` → `is_started`
  - `githubLink` → `github_link`
  - `presentationLink` → `presentation_link`
  - `sponsorsUsed` → `sponsors_used`
  - `teamId` → `team_id`
  - `reportedBy` → `reporter_user_id`

**New Request/Response Types:**
- `JoinRequest`
- `InviteRequest`
- `HackathonCreate`
- `HackathonUpdate`
- `TeamCreate`
- `TeamUpdate`
- `SubmissionCreate`
- `SubmissionUpdate`
- `SponsorCreate`
- `PrizeCreate`
- `IssueCreate`

### 2. API Service Interface (`/services/api.ts`)

**Removed Methods:**
- `getHackathons()` - Not available in backend
- `startHackathon()` - Not available in backend
- `generatePinCode()` - Not available in backend
- Individual entity getters (`getTeam`, `getSubmission`, etc.)
- Update methods for sponsors, prizes, issues
- `joinTeam`, `leaveTeam` - Not available in backend

**Updated Methods:**
- All methods now use numeric IDs instead of string IDs
- Methods now use the new request/response types
- API matches the exact endpoint structure from FastAPI backend

### 3. Real API Service (`/services/realApi.ts`)

**Features:**
- HTTP client implementation using fetch API
- Automatic authentication header injection (Clerk token)
- Error handling with proper error messages
- Configurable API base URL via environment variable
- Type-safe request/response handling

**Configuration:**
- `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:8000`)

### 4. Mock API Service (`/services/mockApi.ts`)

**Updates:**
- Updated to implement the new API interface
- Mock data updated to match new schema (snake_case, numeric IDs)
- Maintains compatibility for development and testing

### 5. Service Abstraction (`/services/index.ts`)

**Features:**
- Automatic service selection based on environment
- Uses MockApiService in development when no API URL is configured
- Uses RealApiService when API URL is provided
- Centralized export point for all API services

### 6. React Hooks Updates

**Updated Hooks:**
- `useHackathons`: Updated for new API interface, added `joinHackathon` and `inviteUser`
- `useHackathon`: Changed ID parameter from string to number
- `useTeams`: Updated for new API interface, removed unsupported operations
- `useSubmissions`: Updated for new API interface
- `useSponsors`: Updated for new API interface, removed unsupported operations
- `usePrizes`: Updated for new API interface, removed unsupported operations
- `useIssues`: Updated for new API interface, removed unsupported operations

**Removed Features:**
- Individual entity hooks (`useTeam`, `useSubmission`, etc.) as backend doesn't support these endpoints
- Update operations not supported by backend (updateSponsor, deletePrize, etc.)

## Environment Configuration

Create a `.env.local` file with:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Clerk Authentication (if using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

## Usage Examples

### Creating a Hackathon
```typescript
import { apiService } from '@/services';

const hackathon = await apiService.createHackathon({
  title: "My Hackathon",
  description: "A great hackathon",
  location: "San Francisco",
  start_time: "2024-10-15T09:00:00Z",
  end_time: "2024-10-17T18:00:00Z"
});
```

### Joining a Hackathon
```typescript
const result = await apiService.joinHackathon({
  pin_code: "1337"
});
```

### Creating a Team
```typescript
const team = await apiService.createTeam(hackathonId, {
  name: "Team Awesome",
  description: "We build awesome things"
});
```

### Creating a Submission
```typescript
const submission = await apiService.createSubmission(teamId, {
  title: "My Project",
  description: "An amazing project",
  github_link: "https://github.com/user/repo",
  sponsor_ids: [1, 2] // Optional sponsor IDs
});
```

## Migration Notes

### Breaking Changes
1. **ID Types**: All entity IDs are now numbers instead of strings
2. **Property Names**: All properties use snake_case instead of camelCase
3. **API Methods**: Several methods have been removed or changed signatures
4. **Enum Values**: UserRole enum values are now uppercase

### Backwards Compatibility
- Mock API service maintains the new interface for development
- Service abstraction allows easy switching between implementations
- All existing functionality is preserved where supported by backend

## Testing

The implementation includes:
- Type safety throughout the application
- Error handling for all API calls
- Mock service for development and testing
- Proper loading and error states in hooks

## Next Steps

1. Set up environment variables for your deployment
2. Test integration with the actual FastAPI backend
3. Update any existing components that use the old API interface
4. Consider adding any missing endpoints to the backend if needed
5. Update authentication integration (Clerk tokens) as needed

## Notes

- Some functionality from the original API is not available in the new backend (individual entity fetching, certain update operations)
- The implementation prioritizes matching the backend specification exactly
- Mock data has been updated to match the new schema for consistent development experience
