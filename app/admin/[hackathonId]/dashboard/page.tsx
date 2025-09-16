"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { useTeams } from "@/hooks/useTeams";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useIssues } from "@/hooks/useIssues";
import { SubmissionState } from "@/types";
import Link from "next/link";

export default function HackathonDashboard({
    params,
}: {
    params: { hackathonId: string };
}) {
    const { teams, loading: teamsLoading } = useTeams(params.hackathonId);
    const { submissions, loading: submissionsLoading } = useSubmissions(params.hackathonId);
    const { issues, loading: issuesLoading } = useIssues(params.hackathonId);

    const submissionStats = {
        draft: submissions.filter(s => s.state === SubmissionState.DRAFT).length,
        ready: submissions.filter(s => s.state === SubmissionState.READY_TO_DEMO).length,
        presented: submissions.filter(s => s.state === SubmissionState.PRESENTED).length,
    };

    const issueStats = {
        open: issues.filter(i => i.status === "open").length,
        inProgress: issues.filter(i => i.status === "in_progress").length,
        resolved: issues.filter(i => i.status === "resolved").length,
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold terminal-text glitch" data-text="COMMAND CENTER">
                        COMMAND CENTER
                    </h1>
                    <p className="text-fluorescent-cyan mt-2">HACKATHON CONTROL INTERFACE</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Submission Stats */}
                    <Card className="hacker-card">
                        <CardHeader>
                            <h3 className="text-lg font-bold text-hacker-green terminal-text">
                                SUBMISSION STATUS
                            </h3>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-outer-space">DRAFT</span>
                                    <span className="text-white">{submissionStats.draft}</span>
                                </div>
                                <Progress
                                    value={(submissionStats.draft / Math.max(submissions.length, 1)) * 100}
                                    className="h-2"
                                    color="warning"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-outer-space">READY TO DEMO</span>
                                    <span className="text-white">{submissionStats.ready}</span>
                                </div>
                                <Progress
                                    value={(submissionStats.ready / Math.max(submissions.length, 1)) * 100}
                                    className="h-2"
                                    color="primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-outer-space">PRESENTED</span>
                                    <span className="text-white">{submissionStats.presented}</span>
                                </div>
                                <Progress
                                    value={(submissionStats.presented / Math.max(submissions.length, 1)) * 100}
                                    className="h-2"
                                    color="success"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Issue Stats */}
                    <Card className="hacker-card">
                        <CardHeader>
                            <h3 className="text-lg font-bold text-warning-red terminal-text">
                                SYSTEM STATUS
                            </h3>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-outer-space">OPEN ISSUES</span>
                                <Chip size="sm" color="danger" variant="flat">
                                    {issueStats.open}
                                </Chip>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-outer-space">IN PROGRESS</span>
                                <Chip size="sm" color="warning" variant="flat">
                                    {issueStats.inProgress}
                                </Chip>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-outer-space">RESOLVED</span>
                                <Chip size="sm" color="success" variant="flat">
                                    {issueStats.resolved}
                                </Chip>
                            </div>

                            <Divider />

                            <div className="text-center">
                                <p className="text-sm text-outer-space">SYSTEM HEALTH</p>
                                <p className={`text-lg font-bold ${issueStats.open === 0 ? 'status-online' : 'status-warning'}`}>
                                    {issueStats.open === 0 ? 'OPTIMAL' : 'DEGRADED'}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="hacker-card">
                        <CardHeader>
                            <h3 className="text-lg font-bold text-fluorescent-cyan terminal-text">
                                QUICK ACCESS
                            </h3>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <Link href={`/${params.hackathonId}/teams`}>
                                <Button
                                    className="w-full cyber-button"
                                    size="sm"
                                    as="div"
                                >
                                    MANAGE TEAMS
                                </Button>
                            </Link>

                            <Link href={`/${params.hackathonId}/sponsors`}>
                                <Button
                                    className="w-full cyber-button"
                                    variant="bordered"
                                    size="sm"
                                    as="div"
                                >
                                    ADD SPONSORS
                                </Button>
                            </Link>

                            <Link href={`/${params.hackathonId}/prizes`}>
                                <Button
                                    className="w-full cyber-button"
                                    variant="bordered"
                                    size="sm"
                                    as="div"
                                >
                                    MANAGE PRIZES
                                </Button>
                            </Link>

                            <Link href={`/${params.hackathonId}/issues`}>
                                <Button
                                    className="w-full cyber-button"
                                    variant="bordered"
                                    size="sm"
                                    as="div"
                                >
                                    VIEW ISSUES
                                </Button>
                            </Link>
                        </CardBody>
                    </Card>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="hacker-card text-center">
                        <CardBody className="py-6">
                            <p className="text-3xl font-bold text-fluorescent-cyan">{teams.length}</p>
                            <p className="text-sm text-outer-space">ACTIVE TEAMS</p>
                        </CardBody>
                    </Card>

                    <Card className="hacker-card text-center">
                        <CardBody className="py-6">
                            <p className="text-3xl font-bold text-white">{submissions.length}</p>
                            <p className="text-sm text-outer-space">SUBMISSIONS</p>
                        </CardBody>
                    </Card>

                    <Card className="hacker-card text-center">
                        <CardBody className="py-6">
                            <p className="text-3xl font-bold text-hacker-green">{submissionStats.presented}</p>
                            <p className="text-sm text-outer-space">PRESENTED</p>
                        </CardBody>
                    </Card>

                    <Card className="hacker-card text-center">
                        <CardBody className="py-6">
                            <p className="text-3xl font-bold text-warning-red">{issues.length}</p>
                            <p className="text-sm text-outer-space">TOTAL ISSUES</p>
                        </CardBody>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card className="hacker-card">
                    <CardHeader>
                        <h3 className="text-lg font-bold text-hacker-green terminal-text">
                            RECENT ACTIVITY
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {submissions.slice(0, 5).map((submission, index) => (
                                <div key={submission.id} className="flex justify-between items-center p-2 border border-outer-space rounded">
                                    <div>
                                        <p className="text-white font-medium">{submission.title}</p>
                                        <p className="text-sm text-outer-space">Team submission updated</p>
                                    </div>
                                    <Chip
                                        size="sm"
                                        color={
                                            submission.state === SubmissionState.PRESENTED ? "success" :
                                                submission.state === SubmissionState.READY_TO_DEMO ? "primary" : "warning"
                                        }
                                        variant="flat"
                                    >
                                        {submission.state.replace('_', ' ').toUpperCase()}
                                    </Chip>
                                </div>
                            ))}

                            {submissions.length === 0 && (
                                <p className="text-center text-outer-space py-4">
                                    NO RECENT ACTIVITY
                                </p>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

