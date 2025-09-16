# Sponsors Route

This directory contains the sponsor dashboard functionality for the hackathon platform.

## Routes

### `/sponsors/[hackathonId]`
- **Purpose**: Sponsor selection and access page
- **Features**:
  - Lists all sponsors for a hackathon
  - Shows user's associated companies (if any)
  - Provides access request functionality
  - Direct access for sponsor employees

### `/sponsors/[hackathonId]/[sponsorId]`
- **Purpose**: Individual sponsor dashboard
- **Features**:
  - Comprehensive analytics and statistics
  - Tool adoption metrics (submissions and teams using sponsor tools)
  - Prize management (create and view sponsor prizes)
  - Submissions filtering (view only submissions using sponsor tools)
  - Company information and representatives

## Authentication & Access Control

- **Employee Access**: Users who are listed as employees of a sponsor get direct access
- **Access Codes**: Non-employees can request access using sponsor-provided codes
- **Protected Routes**: All routes require authentication via Clerk

## Key Features

### Analytics Dashboard
- **Usage Statistics**: Shows how many submissions and teams use sponsor tools
- **Adoption Rates**: Percentage of total participants using sponsor technologies
- **Prize Tracking**: Total value and count of prizes offered by sponsor
- **Representative Count**: Number of sponsor employees in the hackathon

### Prize Management
- **Create Prizes**: Sponsors can add prizes specific to their technology
- **Prize Categories**: Support for sponsor-specific and general prizes
- **Value Tracking**: Automatic calculation of total prize value offered

### Submissions View
- **Filtered Display**: Only shows submissions that use sponsor tools
- **Team Information**: Links submissions to their respective teams
- **Project Details**: GitHub links, presentations, and descriptions
- **Status Tracking**: Current state of each submission (draft, ready, presented)

## Data Structure

### Sponsor Model
```typescript
interface Sponsor {
  id: number;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  hackathon_id: number;
  employees: User[];
  created_at: Date;
}
```

### Key Relationships
- **Sponsors ↔ Users**: Many-to-many (employees)
- **Sponsors ↔ Prizes**: One-to-many (sponsor-specific prizes)
- **Sponsors ↔ Submissions**: Many-to-many (via sponsors_used field)

## UI Components

### Statistics Cards
- Clean, cyberpunk-themed cards showing key metrics
- Progress bars for adoption rates
- Color-coded status indicators

### Prize Management
- Modal-based prize creation
- List view of existing prizes
- Value and description display

### Submissions Table
- Filtered list of relevant submissions
- Team name linking
- External links to GitHub and presentations
- Status chips with appropriate colors

## Mock Data

The system includes comprehensive mock data for testing:
- 3 sponsor companies with employees
- Multiple submissions using different sponsor tools
- Sponsor-specific prizes
- Realistic descriptions and branding

## Navigation

- **From Main Page**: "SPONSOR ACCESS" button on hackathon cards
- **Between Sponsors**: Selection page lists all available sponsors
- **Dashboard Access**: Direct links for employees, access codes for others

## Security Considerations

- **Role-based Access**: Only sponsor employees or authorized users can access dashboards
- **Hackathon Scoping**: All data is scoped to specific hackathons
- **Authentication Required**: All routes protected by Clerk authentication
