"use client";

import { useClerkIntegration, useCurrentUserId } from "@/hooks/useClerkIntegration";
import { useUser } from "@clerk/nextjs";
import { getUserDisplayName } from "@/lib/clerkUtils";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";

/**
 * Example component demonstrating Clerk integration with mock API
 */
export function ClerkUserExample() {
    const { isLoaded, isSignedIn, user, isUsingMockApi } = useClerkIntegration();
    const currentUserId = useCurrentUserId();

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <Card className="max-w-md">
            <CardBody className="space-y-4">
                <h3 className="text-lg font-semibold">Clerk Integration Status</h3>

                <div className="space-y-2">
                    <p><strong>Using Mock API:</strong> {isUsingMockApi ? "Yes" : "No"}</p>
                    <p><strong>User Signed In:</strong> {isSignedIn ? "Yes" : "No"}</p>
                    <p><strong>Current User ID:</strong> {currentUserId || "None"}</p>
                </div>

                {isSignedIn && user ? (
                    <div className="space-y-2">
                        <p><strong>Display Name:</strong> {getUserDisplayName({
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            fullName: user.fullName,
                            emailAddress: user.primaryEmailAddress?.emailAddress || '',
                            role: user.publicMetadata?.role as any || 'GUEST',
                            createdAt: user.createdAt || new Date(),
                        })}</p>
                        <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                        <p><strong>Role:</strong> {user.publicMetadata?.role || 'GUEST'}</p>

                        <div className="flex gap-2 items-center">
                            <UserButton />
                            <SignOutButton>
                                <Button color="danger" size="sm">Sign Out</Button>
                            </SignOutButton>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-600 mb-2">Sign in to see Clerk integration in action</p>
                        <SignInButton>
                            <Button color="primary">Sign In</Button>
                        </SignInButton>
                    </div>
                )}

                <div className="text-sm text-gray-500">
                    <p>This component demonstrates:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Clerk user authentication</li>
                        <li>Integration with mock API service</li>
                        <li>Automatic user data synchronization</li>
                        <li>Current user ID management</li>
                    </ul>
                </div>
            </CardBody>
        </Card>
    );
}
