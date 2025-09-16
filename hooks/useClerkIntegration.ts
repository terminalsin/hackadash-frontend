import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { apiService } from "@/services";
import { MockApiService } from "@/services/mockApi";

/**
 * Hook to integrate Clerk user data with our mock API service
 * This ensures that the current Clerk user is available in our mock data
 */
export function useClerkIntegration() {
    const { isLoaded, isSignedIn, user } = useUser();

    useEffect(() => {
        // Only proceed if Clerk is loaded, user is signed in, and we're using the mock API
        if (isLoaded && isSignedIn && user && apiService instanceof MockApiService) {
            try {
                // Add or update the current Clerk user in our mock data
                (apiService as MockApiService).addOrUpdateClerkUser(user);
                // Set the current user ID for API operations
                (apiService as MockApiService).setCurrentUserId(user.id);
            } catch (error) {
                console.warn("Failed to sync Clerk user with mock API:", error);
            }
        }
    }, [isLoaded, isSignedIn, user]);

    return {
        isLoaded,
        isSignedIn,
        user,
        isUsingMockApi: apiService instanceof MockApiService,
    };
}

/**
 * Hook to get the current user ID for API operations
 * Works with both Clerk users and mock users
 */
export function useCurrentUserId(): string | null {
    const { isLoaded, isSignedIn, user } = useUser();

    if (isLoaded && isSignedIn && user) {
        return user.id;
    }

    // Fallback to mock user if using mock API
    if (apiService instanceof MockApiService) {
        return (apiService as MockApiService).getCurrentUserId();
    }

    return null;
}
