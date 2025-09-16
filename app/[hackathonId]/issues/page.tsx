"use client";

import { useState, use } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Tabs, Tab } from "@heroui/tabs";
import { useIssues } from "@/hooks/useIssues";
import { Issue } from "@/types";
import { useUser } from "@clerk/nextjs";

export default function IssuesPage({
    params,
}: {
    params: Promise<{ hackathonId: string }>;
}) {
    const resolvedParams = use(params);
    const { issues, loading, error } = useIssues(parseInt(resolvedParams.hackathonId));
    const { user } = useUser();
    const [selectedTab, setSelectedTab] = useState("all");

    const getStatusColor = (status: Issue["status"]) => {
        switch (status) {
            case "open":
                return "danger";
            case "in_progress":
                return "warning";
            case "resolved":
                return "success";
            default:
                return "default";
        }
    };

    const getStatusText = (status: Issue["status"]) => {
        switch (status) {
            case "open":
                return "OPEN";
            case "in_progress":
                return "IN PROGRESS";
            case "resolved":
                return "RESOLVED";
            default:
                return "UNKNOWN";
        }
    };

    const getPriorityFromAge = (createdAt: Date) => {
        const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated > 7) return "high";
        if (daysSinceCreated > 3) return "medium";
        return "low";
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "danger";
            case "medium":
                return "warning";
            case "low":
                return "success";
            default:
                return "default";
        }
    };

    const filterIssues = (issues: Issue[]) => {
        switch (selectedTab) {
            case "open":
                return issues.filter(issue => issue.status === "open");
            case "in_progress":
                return issues.filter(issue => issue.status === "in_progress");
            case "resolved":
                return issues.filter(issue => issue.status === "resolved");
            case "my_reports":
                return issues.filter(issue => issue.reporter_user_id === user?.id);
            default:
                return issues;
        }
    };

    const filteredIssues = filterIssues(issues);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">LOADING ISSUES...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="hacker-card">
                        <CardBody className="text-center py-12">
                            <h2 className="text-2xl font-bold text-warning-red mb-4">ERROR LOADING ISSUES</h2>
                            <p className="text-outer-space mb-4">{error}</p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold terminal-text text-hacker-green">
                        ISSUE TRACKER
                    </h1>
                    <p className="text-outer-space">Track and monitor hackathon issues and support requests</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="hacker-card">
                        <CardBody className="text-center py-4">
                            <p className="text-2xl font-bold text-warning-red font-mono">
                                {issues.filter(i => i.status === "open").length}
                            </p>
                            <p className="text-xs text-outer-space">OPEN ISSUES</p>
                        </CardBody>
                    </Card>
                    <Card className="hacker-card">
                        <CardBody className="text-center py-4">
                            <p className="text-2xl font-bold text-warning font-mono">
                                {issues.filter(i => i.status === "in_progress").length}
                            </p>
                            <p className="text-xs text-outer-space">IN PROGRESS</p>
                        </CardBody>
                    </Card>
                    <Card className="hacker-card">
                        <CardBody className="text-center py-4">
                            <p className="text-2xl font-bold text-hacker-green font-mono">
                                {issues.filter(i => i.status === "resolved").length}
                            </p>
                            <p className="text-xs text-outer-space">RESOLVED</p>
                        </CardBody>
                    </Card>
                    <Card className="hacker-card">
                        <CardBody className="text-center py-4">
                            <p className="text-2xl font-bold text-fluorescent-cyan font-mono">
                                {issues.length}
                            </p>
                            <p className="text-xs text-outer-space">TOTAL ISSUES</p>
                        </CardBody>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <Tabs
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)}
                    className="w-full mb-6"
                    classNames={{
                        tabList: "bg-black/20 border border-hacker-green/20",
                        cursor: "bg-hacker-green/20 border border-hacker-green",
                        tab: "text-outer-space data-[selected=true]:text-hacker-green",
                        tabContent: "font-mono text-sm"
                    }}
                >
                    <Tab key="all" title={`ALL (${issues.length})`}>
                    </Tab>
                    <Tab key="open" title={`OPEN (${issues.filter(i => i.status === "open").length})`}>
                    </Tab>
                    <Tab key="in_progress" title={`IN PROGRESS (${issues.filter(i => i.status === "in_progress").length})`}>
                    </Tab>
                    <Tab key="resolved" title={`RESOLVED (${issues.filter(i => i.status === "resolved").length})`}>
                    </Tab>
                    {user && (
                        <Tab key="my_reports" title={`MY REPORTS (${issues.filter(i => i.reporter_user_id === user.id).length})`}>
                        </Tab>
                    )}
                </Tabs>

                {/* Issues List */}
                <div className="space-y-4">
                    {filteredIssues.length > 0 ? (
                        filteredIssues.map((issue) => {
                            const priority = getPriorityFromAge(issue.created_at);
                            const daysSinceCreated = Math.floor((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24));

                            return (
                                <Card key={issue.id} className="hacker-card neon-border">
                                    <CardHeader>
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-white">
                                                        {issue.title}
                                                    </h3>
                                                    <Chip
                                                        color={getStatusColor(issue.status)}
                                                        variant="shadow"
                                                        size="sm"
                                                        className="font-mono"
                                                    >
                                                        {getStatusText(issue.status)}
                                                    </Chip>
                                                    <Chip
                                                        color={getPriorityColor(priority)}
                                                        variant="flat"
                                                        size="sm"
                                                        className="font-mono"
                                                    >
                                                        {priority.toUpperCase()} PRIORITY
                                                    </Chip>
                                                </div>
                                                <p className="text-sm text-outer-space">
                                                    Issue #{issue.id} • Reported {daysSinceCreated} day{daysSinceCreated !== 1 ? 's' : ''} ago
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="space-y-4">
                                            <p className="text-outer-space">
                                                {issue.description}
                                            </p>

                                            <Divider />

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-hacker-green font-semibold mb-1">STATUS</p>
                                                    <Chip
                                                        color={getStatusColor(issue.status)}
                                                        variant="flat"
                                                        size="sm"
                                                    >
                                                        {getStatusText(issue.status)}
                                                    </Chip>
                                                </div>
                                                <div>
                                                    <p className="text-hacker-green font-semibold mb-1">CREATED</p>
                                                    <p className="text-outer-space font-mono">
                                                        {new Date(issue.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-hacker-green font-semibold mb-1">LAST UPDATED</p>
                                                    <p className="text-outer-space font-mono">
                                                        {new Date(issue.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress Indicator */}
                                            <div className="mt-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-hacker-green font-semibold text-sm">PROGRESS</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${issue.status === "open" ? "bg-danger" : "bg-success"}`}></div>
                                                    <div className="flex-1 h-1 bg-outer-space rounded">
                                                        <div
                                                            className={`h-full rounded transition-all duration-300 ${issue.status === "resolved" ? "bg-success w-full" :
                                                                    issue.status === "in_progress" ? "bg-warning w-1/2" :
                                                                        "bg-danger w-1/4"
                                                                }`}
                                                        ></div>
                                                    </div>
                                                    <div className={`w-3 h-3 rounded-full ${issue.status === "in_progress" || issue.status === "resolved" ? "bg-warning" : "bg-outer-space"}`}></div>
                                                    <div className={`w-3 h-3 rounded-full ${issue.status === "resolved" ? "bg-success" : "bg-outer-space"}`}></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-outer-space mt-1">
                                                    <span>REPORTED</span>
                                                    <span>IN PROGRESS</span>
                                                    <span>RESOLVED</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })
                    ) : (
                        <Card className="hacker-card">
                            <CardBody className="text-center py-12">
                                <h3 className="text-xl font-bold text-outer-space mb-2">
                                    NO ISSUES FOUND
                                </h3>
                                <p className="text-outer-space">
                                    {selectedTab === "all"
                                        ? "No issues have been reported for this hackathon yet."
                                        : `No ${selectedTab.replace('_', ' ')} issues found.`
                                    }
                                </p>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
