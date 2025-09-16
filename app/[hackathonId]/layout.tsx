"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { useHackathon } from "@/hooks/useHackathons";
import { useRouter, usePathname } from "next/navigation";
import { Hackathon } from "@/types";

export default function UserHackathonLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { hackathonId: string };
}) {
    const { hackathon, loading, error } = useHackathon(params.hackathonId);
    const router = useRouter();
    const pathname = usePathname();

    // Extract current tab from pathname
    const getCurrentTab = () => {
        if (pathname.includes('/team-details')) return 'team-details';
        if (pathname.includes('/leaderboard')) return 'leaderboard';
        return 'teams';
    };

    const handleTabChange = (key: string) => {
        if (key === 'teams') {
            router.push(`/${params.hackathonId}/teams`);
        } else if (key === 'team-details') {
            router.push(`/${params.hackathonId}/team-details`);
        } else if (key === 'leaderboard') {
            router.push(`/${params.hackathonId}/leaderboard`);
        }
    };

    if (loading) {
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
                                    {Math.ceil((new Date(hackathon.endTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} DAYS
                                </p>
                            </div>
                            <Chip
                                color={hackathon.isStarted ? "success" : "warning"}
                                variant="shadow"
                                className="font-mono"
                            >
                                {hackathon.isStarted ? "LIVE" : "PENDING"}
                            </Chip>
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
                        <Tab key="teams" title="TEAMS">
                        </Tab>
                        <Tab key="team-details" title="MY TEAM">
                        </Tab>
                        <Tab key="leaderboard" title="LEADERBOARD">
                        </Tab>
                    </Tabs>
                </div>
            </div>

            {children}
        </div>
    );
}
