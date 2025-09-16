import { User, UserRole, ClerkUserAdapter } from "@/types";

/**
 * Converts a Clerk user object to our internal User interface
 */
export function adaptClerkUser(clerkUser: ClerkUserAdapter): User {
    return {
        id: clerkUser.id,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        fullName: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        emailAddress: clerkUser.primaryEmailAddress?.emailAddress || '',
        imageUrl: clerkUser.imageUrl,
        role: (clerkUser.publicMetadata?.role as UserRole) || UserRole.GUEST,
        companyId: clerkUser.publicMetadata?.companyId,
        createdAt: clerkUser.createdAt || new Date(),
    };
}

/**
 * Creates a mock user for development/testing purposes
 */
export function createMockUser(overrides: Partial<User> = {}): User {
    return {
        id: `mock-${Date.now()}`,
        firstName: 'Mock',
        lastName: 'User',
        fullName: 'Mock User',
        emailAddress: 'mock@example.com',
        imageUrl: undefined,
        role: UserRole.GUEST,
        companyId: undefined,
        createdAt: new Date(),
        ...overrides,
    };
}

/**
 * Gets the display name for a user
 */
export function getUserDisplayName(user: User): string {
    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.emailAddress.split('@')[0];
}
