"use client";

import { useEffect, useState, use } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { useHackathon } from "@/hooks/useHackathons";
import { useRouter, usePathname } from "next/navigation";
import { Hackathon } from "@/types";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminHackathonLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ hackathonId: string }>;
}) {
    const { hackathonId } = use(params);
    const { hackathon, loading, error } = useHackathon(hackathonId);
    const router = useRouter();
    const pathname = usePathname();

    // Extract current tab from pathname
    const getCurrentTab = () => {
        if (pathname.includes('/dashboard')) return 'dashboard';
        if (pathname.includes('/teams')) return 'teams';
        if (pathname.includes('/submissions')) return 'submissions';
        if (pathname.includes('/sponsors')) return 'sponsors';
        if (pathname.includes('/prizes')) return 'prizes';
        if (pathname.includes('/issues')) return 'issues';
        return 'dashboard';
    };

    const handleTabChange = (key: string) => {
        router.push(`/admin/${hackathonId}/${key}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">LOADING ADMIN INTERFACE...</span>
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
                {/* Admin Header */}
            <div className="border-b border-hacker-green bg-black/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-hacker-green terminal-text">
                                ADMIN: {hackathon.title}
                            </h1>
                            <p className="text-outer-space text-sm">{hackathon.location}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-hacker-green font-mono font-bold text-lg">
                                    PIN: {hackathon.pinCode}
                                </p>
                                <p className="text-xs text-outer-space">Access Code</p>
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

                    {/* Admin Navigation Tabs */}
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
                        <Tab key="dashboard" title="DASHBOARD">
                        </Tab>
                        <Tab key="teams" title="TEAMS">
                        </Tab>
                        <Tab key="submissions" title="SUBMISSIONS">
                        </Tab>
                        <Tab key="sponsors" title="SPONSORS">
                        </Tab>
                        <Tab key="prizes" title="PRIZES">
                        </Tab>
                        <Tab key="issues" title="ISSUES">
                        </Tab>
                    </Tabs>
                </div>
            </div>

            {children}
        </div>
        </ProtectedRoute>
    );
}
