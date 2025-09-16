"use client";

import { useEffect, useState, use } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useSponsors } from "@/hooks/useSponsors";
import { useHackathon } from "@/hooks/useHackathons";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUser } from "@clerk/nextjs";

export default function SponsorLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ hackathonId: string; sponsorId: string }>;
}) {
    const { hackathonId, sponsorId } = use(params);
    const { hackathon, loading: hackathonLoading, error: hackathonError } = useHackathon(parseInt(hackathonId));
    const { sponsors, loading: sponsorsLoading } = useSponsors(parseInt(hackathonId));
    const { user } = useUser();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    // Check authorization
    useEffect(() => {
        if (!sponsorsLoading && sponsors.length > 0 && user) {
            const sponsor = sponsors.find(s => s.id.toString() === sponsorId);

            if (!sponsor) {
                setIsAuthorized(false);
                return;
            }

            // Check if user is an employee of this sponsor
            const authorized = sponsor.employees.some(emp =>
                emp.email === user.primaryEmailAddress?.emailAddress
            );

            setIsAuthorized(authorized);
        }
    }, [sponsors, sponsorsLoading, user, sponsorId]);

    if (hackathonLoading || sponsorsLoading || isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">VERIFYING ACCESS...</span>
            </div>
        );
    }

    if (hackathonError || !hackathon || !isAuthorized) {
        return (
            <div className="matrix-bg min-h-screen flex items-center justify-center p-6">
                <Card className="hacker-card max-w-md">
                    <CardBody className="text-center space-y-4 py-8">
                        <h1 className="text-2xl font-bold text-warning-red">ACCESS DENIED</h1>
                        <p className="text-outer-space">
                            {hackathonError ? "Hackathon not found" : "You don't have permission to access this sponsor dashboard."}
                        </p>
                        <Button
                            className="cyber-button"
                            onPress={() => router.push('/')}
                        >
                            RETURN TO HOME
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}
