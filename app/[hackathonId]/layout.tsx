"use client";

import { useEffect, useState, use } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { useHackathon } from "@/hooks/useHackathons";
import { useTeams } from "@/hooks/useTeams";
import { useRouter, usePathname } from "next/navigation";
import { Hackathon } from "@/types";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import { useDisclosure } from "@heroui/modal";

export default function UserHackathonLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ hackathonId: string }>;
}) {
    const { hackathonId } = use(params);
    const { hackathon, loading, error } = useHackathon(parseInt(hackathonId));
    const { teams, loading: teamsLoading } = useTeams(parseInt(hackathonId));
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const { isOpen: isReportIssueOpen, onOpen: onReportIssueOpen, onClose: onReportIssueClose } = useDisclosure();

    // Check if user is in a team
    const userTeam = teams.find(team =>
        team.members.some(member =>
            member.email === user?.primaryEmailAddress?.emailAddress
        )
    );
    const isUserInTeam = !!userTeam;

    // Extract current tab from pathname
    const getCurrentTab = () => {
        if (pathname.includes('/team-details')) return 'team-details';
        if (pathname.includes('/leaderboard')) return 'leaderboard';
        if (pathname.includes('/issues')) return 'issues';
        return 'teams';
    };

    const handleTabChange = (key: string) => {
        if (key === 'teams') {
            router.push(`/${hackathonId}/teams`);
        } else if (key === 'team-details') {
            router.push(`/${hackathonId}/team-details`);
        } else if (key === 'leaderboard') {
            router.push(`/${hackathonId}/leaderboard`);
        } else if (key === 'issues') {
            router.push(`/${hackathonId}/issues`);
        }
    };

    // Handle default routing based on team membership
    useEffect(() => {
        if (!loading && !teamsLoading && user) {
            const currentPath = pathname;
            const isOnRootPath = currentPath === `/${hackathonId}` || currentPath === `/${hackathonId}/`;

            if (isOnRootPath) {
                if (isUserInTeam) {
                    router.replace(`/${hackathonId}/team-details`);
                } else {
                    router.replace(`/${hackathonId}/teams`);
                }
            }
        }
    }, [loading, teamsLoading, user, isUserInTeam, pathname, hackathonId, router]);

    if (loading || teamsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">LOADING HACKATHON...</span>
            </div>
        );
    }

    if (error || !hackathon) {
        return (
            <div className="matrix-bg min-h-screen flex items-center justify-center p-6">
                <Card className="hacker-card max-w-md">
                    <CardBody className="text-center space-y-4 py-8">
                        <h1 className="text-2xl font-bold text-warning-red">HACKATHON NOT FOUND</h1>
                        <p className="text-outer-space">The requested hackathon does not exist or has been terminated.</p>
                        <p className="text-sm text-outer-space">Error: {error || "Invalid hackathon ID"}</p>
                        <Button
                            className="cyber-button"
                            onPress={() => router.push('/')}
                        >
                            RETURN TO BASE
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="matrix-bg min-h-screen">
                {/* Hackathon Header */}
                <div className="border-b border-hacker-green bg-black/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-hacker-green terminal-text">
                                    {hackathon.title}
                                </h1>
                                <p className="text-outer-space text-sm">{hackathon.location}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-outer-space">Time Remaining</p>
                                    <p className="text-hacker-green font-mono font-bold">
                                        {Math.ceil((new Date(hackathon.end_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} DAYS
                                    </p>
                                </div>
                                <Button
                                    className="cyber-button"
                                    size="sm"
                                    variant="bordered"
                                    onPress={() => router.push(`/admin/${hackathonId}/dashboard`)}
                                >
                                    ADMIN
                                </Button>
                                <Chip
                                    color={hackathon.is_started ? "success" : "warning"}
                                    variant="shadow"
                                    className="font-mono"
                                >
                                    {hackathon.is_started ? "LIVE" : "PENDING"}
                                </Chip>
                                <Button
                                    className="cyber-button"
                                    size="sm"
                                    onPress={onReportIssueOpen}
                                >
                                    REPORT ISSUE
                                </Button>
                                <UserButton />
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <Tabs
                            selectedKey={getCurrentTab()}
                            onSelectionChange={(key) => handleTabChange(key as string)}
                            className="w-full"
                            classNames={{
                                tabList: "bg-black/20 border border-hacker-green/20",
                                cursor: "bg-hacker-green/20 border border-hacker-green",
                                tab: "text-outer-space data-[selected=true]:text-hacker-green",
                                tabContent: "font-mono text-sm"
                            }}
                        >
                            {!isUserInTeam && (
                                <Tab key="teams" title="TEAMS">
                                </Tab>
                            )}
                            {isUserInTeam && (
                                <Tab key="team-details" title="MY TEAM">
                                </Tab>
                            )}
                            <Tab key="leaderboard" title="LEADERBOARD">
                            </Tab>
                            <Tab key="issues" title="ISSUES">
                            </Tab>
                        </Tabs>
                    </div>
                </div>

                {children}

                {/* Report Issue Modal */}
                <ReportIssueModal
                    isOpen={isReportIssueOpen}
                    onClose={onReportIssueClose}
                    hackathonId={parseInt(hackathonId)}
                />
            </div>
        </ProtectedRoute>
    );
}
