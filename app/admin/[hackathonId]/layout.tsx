"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useHackathon } from "@/hooks/useHackathons";
import { Hackathon } from "@/types";

export default function HackathonLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { hackathonId: string };
}) {
    const { hackathon, loading, error } = useHackathon(params.hackathonId);

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-hacker-green terminal-text">
                                {hackathon.title}
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
                </div>
            </div>

            {children}
        </div>
    );
}

