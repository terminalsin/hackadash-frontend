"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useHackathons } from "@/hooks/useHackathons";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const { hackathons, loading } = useHackathons();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">LOADING ADMIN PANEL...</span>
            </div>
        );
    }

    return (
        <div className="matrix-bg min-h-screen">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold terminal-text glitch text-hacker-green mb-4" data-text="ADMIN CONTROL">
                        ADMIN CONTROL
                    </h1>
                    <p className="text-fluorescent-cyan text-xl mb-2">HACKATHON MANAGEMENT INTERFACE</p>
                    <p className="text-outer-space">Manage hackathons and monitor system status</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="hacker-card text-center">
                        <CardBody className="py-6">
                            <p className="text-3xl font-bold text-hacker-green">{hackathons.length}</p>
                            <p className="text-sm text-outer-space">TOTAL HACKATHONS</p>
                        </CardBody>
                    </Card>

                    <Card className="hacker-card text-center">
                        <CardBody className="py-6">
                            <p className="text-3xl font-bold text-fluorescent-cyan">
                                {hackathons.filter(h => h.isStarted).length}
                            </p>
                            <p className="text-sm text-outer-space">ACTIVE EVENTS</p>
                        </CardBody>
                    </Card>

                    <Card className="hacker-card text-center">
                        <CardBody className="py-6">
                            <p className="text-3xl font-bold text-white">
                                {hackathons.reduce((total, h) => total + h.teams.length, 0)}
                            </p>
                            <p className="text-sm text-outer-space">TOTAL TEAMS</p>
                        </CardBody>
                    </Card>

                    <Card className="hacker-card text-center">
                        <CardBody className="py-6">
                            <p className="text-3xl font-bold text-warning-red">
                                {hackathons.reduce((total, h) => total + h.submissions.length, 0)}
                            </p>
                            <p className="text-sm text-outer-space">SUBMISSIONS</p>
                        </CardBody>
                    </Card>
                </div>

                {/* Hackathons Management */}
                <Card className="hacker-card neon-border">
                    <CardHeader>
                        <div className="flex justify-between items-center w-full">
                            <h2 className="text-2xl font-bold text-hacker-green terminal-text">
                                HACKATHON MANAGEMENT
                            </h2>
                            <Button
                                className="cyber-button"
                                onPress={() => {/* TODO: Implement create hackathon */ }}
                            >
                                CREATE HACKATHON
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            {hackathons.map((hackathon) => (
                                <div
                                    key={hackathon.id}
                                    className="flex items-center justify-between p-4 border border-outer-space rounded hover:border-hacker-green transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white">
                                                {hackathon.title}
                                            </h3>
                                            <Chip
                                                color={hackathon.isStarted ? "success" : "warning"}
                                                variant="shadow"
                                                className="font-mono"
                                                size="sm"
                                            >
                                                {hackathon.isStarted ? "LIVE" : "PENDING"}
                                            </Chip>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-outer-space">
                                            <span>📍 {hackathon.location}</span>
                                            <span>👥 {hackathon.teams.length} teams</span>
                                            <span>🏆 {hackathon.prizes.length} prizes</span>
                                            <span>💼 {hackathon.sponsors.length} sponsors</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-outer-space mt-1">
                                            <span>📅 {new Date(hackathon.startTime).toLocaleDateString()}</span>
                                            <span>🔢 PIN: {hackathon.pinCode}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            className="cyber-button"
                                            size="sm"
                                            onPress={() => router.push(`/admin/${hackathon.id}/dashboard`)}
                                        >
                                            MANAGE
                                        </Button>

                                        {!hackathon.isStarted && (
                                            <Button
                                                className="cyber-button"
                                                variant="bordered"
                                                size="sm"
                                                onPress={() => {/* TODO: Start hackathon */ }}
                                            >
                                                START
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {hackathons.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-outer-space text-lg mb-4">NO HACKATHONS CREATED</p>
                                    <p className="text-sm text-outer-space mb-4">Create your first hackathon to get started</p>
                                    <Button
                                        className="cyber-button"
                                        onPress={() => {/* TODO: Implement create hackathon */ }}
                                    >
                                        CREATE FIRST HACKATHON
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* System Status */}
                <Card className="hacker-card mt-6">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-hacker-green terminal-text">
                            SYSTEM STATUS
                        </h2>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🟢</div>
                                <p className="text-hacker-green font-bold">OPERATIONAL</p>
                                <p className="text-xs text-outer-space">All systems running</p>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl mb-2">📊</div>
                                <p className="text-fluorescent-cyan font-bold">MONITORING</p>
                                <p className="text-xs text-outer-space">Real-time analytics</p>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl mb-2">🔒</div>
                                <p className="text-white font-bold">SECURE</p>
                                <p className="text-xs text-outer-space">Data protected</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
