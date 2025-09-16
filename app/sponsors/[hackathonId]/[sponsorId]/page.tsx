"use client";

import { useState, useEffect, use } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Progress } from "@heroui/progress";
import { Link } from "@heroui/link";
import { useHackathon } from "@/hooks/useHackathons";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useTeams } from "@/hooks/useTeams";
import { usePrizes } from "@/hooks/usePrizes";
import { useSponsors } from "@/hooks/useSponsors";
import { Sponsor, Submission, SubmissionState, Prize, Team } from "@/types";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SponsorStats {
    totalSubmissions: number;
    submissionsUsingTool: number;
    usagePercentage: number;
    totalTeams: number;
    teamsUsingTool: number;
    teamUsagePercentage: number;
    prizesOffered: number;
    totalPrizeValue: string;
}

export default function SponsorDashboard({
    params,
}: {
    params: Promise<{ hackathonId: string; sponsorId: string }>;
}) {
    const resolvedParams = use(params);
    const { hackathon, loading: hackathonLoading } = useHackathon(parseInt(resolvedParams.hackathonId));
    const { submissions, loading: submissionsLoading } = useSubmissions(parseInt(resolvedParams.hackathonId));
    const { teams, loading: teamsLoading } = useTeams(parseInt(resolvedParams.hackathonId));
    const { prizes, loading: prizesLoading, createPrize } = usePrizes(parseInt(resolvedParams.hackathonId));
    const { sponsors, loading: sponsorsLoading } = useSponsors(parseInt(resolvedParams.hackathonId));
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user } = useUser();
    const router = useRouter();

    const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
    const [sponsorStats, setSponsorStats] = useState<SponsorStats>({
        totalSubmissions: 0,
        submissionsUsingTool: 0,
        usagePercentage: 0,
        totalTeams: 0,
        teamsUsingTool: 0,
        teamUsagePercentage: 0,
        prizesOffered: 0,
        totalPrizeValue: "0",
    });
    const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
    const [prizeFormData, setPrizeFormData] = useState({
        title: "",
        description: "",
        value: "",
    });

    // Find current sponsor and check if user has access
    useEffect(() => {
        if (sponsors.length > 0 && user) {
            const sponsor = sponsors.find(s => s.id.toString() === resolvedParams.sponsorId);
            if (!sponsor) {
                router.push('/');
                return;
            }

            // Check if user is an employee of this sponsor
            const isAuthorized = sponsor.employees.some(emp =>
                emp.email === user.primaryEmailAddress?.emailAddress
            );

            if (!isAuthorized) {
                router.push('/');
                return;
            }

            setCurrentSponsor(sponsor);
        }
    }, [sponsors, user, resolvedParams.sponsorId, router]);

    // Calculate statistics
    useEffect(() => {
        if (currentSponsor && submissions.length > 0 && teams.length > 0) {
            // Find submissions that use this sponsor's tools
            const submissionsUsingSponsor = submissions.filter(submission =>
                submission.sponsors_used.some(sponsor => sponsor.id === currentSponsor.id)
            );

            // Find teams that have submissions using this sponsor
            const teamsUsingSponsor = teams.filter(team =>
                submissions.some(submission =>
                    submission.team_id === team.id &&
                    submission.sponsors_used.some(sponsor => sponsor.id === currentSponsor.id)
                )
            );

            // Find prizes offered by this sponsor
            const sponsorPrizes = prizes.filter(prize => prize.sponsor_id === currentSponsor.id);
            const totalPrizeValue = sponsorPrizes.reduce((total, prize) => {
                // Extract numeric value from prize value string (simple approach)
                const match = prize.value.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                const value = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
                return total + value;
            }, 0);

            setSponsorStats({
                totalSubmissions: submissions.length,
                submissionsUsingTool: submissionsUsingSponsor.length,
                usagePercentage: submissions.length > 0 ? (submissionsUsingSponsor.length / submissions.length) * 100 : 0,
                totalTeams: teams.length,
                teamsUsingTool: teamsUsingSponsor.length,
                teamUsagePercentage: teams.length > 0 ? (teamsUsingSponsor.length / teams.length) * 100 : 0,
                prizesOffered: sponsorPrizes.length,
                totalPrizeValue: totalPrizeValue > 0 ? `$${totalPrizeValue.toLocaleString()}` : "$0",
            });

            setFilteredSubmissions(submissionsUsingSponsor);
        }
    }, [currentSponsor, submissions, teams, prizes]);

    const handleCreatePrize = async () => {
        if (!currentSponsor) return;

        try {
            await createPrize({
                title: prizeFormData.title,
                description: prizeFormData.description,
                value: prizeFormData.value,
                sponsor_id: currentSponsor.id,
            });
            setPrizeFormData({ title: "", description: "", value: "" });
            onClose();
        } catch (error) {
            console.error("Failed to create prize:", error);
        }
    };

    const getSubmissionStateColor = (state: SubmissionState) => {
        switch (state) {
            case SubmissionState.DRAFT:
                return "warning";
            case SubmissionState.READY_TO_DEMO:
                return "primary";
            case SubmissionState.PRESENTED:
                return "success";
            default:
                return "default";
        }
    };

    const getTeamName = (teamId: number) => {
        const team = teams.find(t => t.id === teamId);
        return team?.name || "Unknown Team";
    };

    if (hackathonLoading || submissionsLoading || teamsLoading || prizesLoading || sponsorsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">LOADING SPONSOR DASHBOARD...</span>
            </div>
        );
    }

    if (!currentSponsor || !hackathon) {
        return (
            <div className="matrix-bg min-h-screen flex items-center justify-center p-6">
                <Card className="hacker-card max-w-md">
                    <CardBody className="text-center space-y-4 py-8">
                        <h1 className="text-2xl font-bold text-warning-red">ACCESS DENIED</h1>
                        <p className="text-outer-space">You don't have permission to access this sponsor dashboard.</p>
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
            <div className="matrix-bg min-h-screen">
                {/* Header */}
                <div className="border-b border-hacker-green bg-black/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                {currentSponsor.logo && (
                                    <img
                                        src={currentSponsor.logo}
                                        alt={currentSponsor.name}
                                        className="w-12 h-12 object-contain rounded"
                                    />
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-hacker-green terminal-text">
                                        {currentSponsor.name} DASHBOARD
                                    </h1>
                                    <p className="text-outer-space text-sm">{hackathon.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Chip
                                    color="success"
                                    variant="shadow"
                                    className="font-mono"
                                >
                                    SPONSOR ACCESS
                                </Chip>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="hacker-card text-center">
                                <CardBody className="py-6">
                                    <p className="text-3xl font-bold text-hacker-green">{sponsorStats.submissionsUsingTool}</p>
                                    <p className="text-sm text-outer-space">SUBMISSIONS USING YOUR TOOLS</p>
                                    <p className="text-xs text-fluorescent-cyan mt-1">
                                        {sponsorStats.usagePercentage.toFixed(1)}% of all submissions
                                    </p>
                                </CardBody>
                            </Card>

                            <Card className="hacker-card text-center">
                                <CardBody className="py-6">
                                    <p className="text-3xl font-bold text-fluorescent-cyan">{sponsorStats.teamsUsingTool}</p>
                                    <p className="text-sm text-outer-space">TEAMS USING YOUR TOOLS</p>
                                    <p className="text-xs text-fluorescent-cyan mt-1">
                                        {sponsorStats.teamUsagePercentage.toFixed(1)}% of all teams
                                    </p>
                                </CardBody>
                            </Card>

                            <Card className="hacker-card text-center">
                                <CardBody className="py-6">
                                    <p className="text-3xl font-bold text-warning-red">{sponsorStats.prizesOffered}</p>
                                    <p className="text-sm text-outer-space">PRIZES OFFERED</p>
                                    <p className="text-xs text-fluorescent-cyan mt-1">
                                        {sponsorStats.totalPrizeValue} total value
                                    </p>
                                </CardBody>
                            </Card>

                            <Card className="hacker-card text-center">
                                <CardBody className="py-6">
                                    <p className="text-3xl font-bold text-white">{currentSponsor.employees.length}</p>
                                    <p className="text-sm text-outer-space">REPRESENTATIVES</p>
                                    <p className="text-xs text-fluorescent-cyan mt-1">
                                        Active in hackathon
                                    </p>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Usage Analytics */}
                        <Card className="hacker-card">
                            <CardHeader>
                                <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                    TOOL ADOPTION ANALYTICS
                                </h2>
                            </CardHeader>
                            <CardBody className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-outer-space">Submission Usage Rate</span>
                                        <span className="text-hacker-green font-mono">
                                            {sponsorStats.submissionsUsingTool}/{sponsorStats.totalSubmissions}
                                        </span>
                                    </div>
                                    <Progress
                                        value={sponsorStats.usagePercentage}
                                        className="h-3"
                                        color="success"
                                        showValueLabel={true}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-outer-space">Team Adoption Rate</span>
                                        <span className="text-fluorescent-cyan font-mono">
                                            {sponsorStats.teamsUsingTool}/{sponsorStats.totalTeams}
                                        </span>
                                    </div>
                                    <Progress
                                        value={sponsorStats.teamUsagePercentage}
                                        className="h-3"
                                        color="primary"
                                        showValueLabel={true}
                                    />
                                </div>
                            </CardBody>
                        </Card>

                        {/* Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Prize Management */}
                            <Card className="hacker-card">
                                <CardHeader>
                                    <div className="flex justify-between items-center w-full">
                                        <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                            PRIZE MANAGEMENT
                                        </h2>
                                        <Button
                                            className="cyber-button"
                                            size="sm"
                                            onPress={onOpen}
                                        >
                                            ADD PRIZE
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <div className="space-y-3">
                                        {prizes.filter(p => p.sponsor_id === currentSponsor.id).map((prize) => (
                                            <div
                                                key={prize.id}
                                                className="flex items-center justify-between p-3 border border-outer-space rounded"
                                            >
                                                <div className="flex-1">
                                                    <h4 className="text-white font-semibold">{prize.title}</h4>
                                                    <p className="text-sm text-outer-space line-clamp-1">{prize.description}</p>
                                                </div>
                                                <Chip
                                                    color="success"
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {prize.value}
                                                </Chip>
                                            </div>
                                        ))}

                                        {prizes.filter(p => p.sponsor_id === currentSponsor.id).length === 0 && (
                                            <div className="text-center py-6">
                                                <p className="text-outer-space">No prizes offered yet</p>
                                                <Button
                                                    className="cyber-button mt-2"
                                                    size="sm"
                                                    onPress={onOpen}
                                                >
                                                    CREATE FIRST PRIZE
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Company Info */}
                            <Card className="hacker-card">
                                <CardHeader>
                                    <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                        COMPANY PRESENCE
                                    </h2>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-hacker-green mb-2">DESCRIPTION</h4>
                                        <p className="text-sm text-outer-space">{currentSponsor.description}</p>
                                    </div>

                                    {currentSponsor.website && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-hacker-green mb-2">WEBSITE</h4>
                                            <Link
                                                href={currentSponsor.website}
                                                isExternal
                                                className="text-fluorescent-cyan text-sm"
                                            >
                                                {currentSponsor.website}
                                            </Link>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-sm font-semibold text-hacker-green mb-2">REPRESENTATIVES</h4>
                                        <div className="space-y-2">
                                            {currentSponsor.employees.map((employee) => (
                                                <div key={employee.id} className="flex items-center gap-2">
                                                    <Avatar
                                                        size="sm"
                                                        name={employee.name}
                                                        className="bg-fluorescent-cyan text-black"
                                                    />
                                                    <div>
                                                        <p className="text-sm text-white">{employee.name}</p>
                                                        <p className="text-xs text-outer-space">{employee.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Submissions Using Your Tools */}
                        <Card className="hacker-card">
                            <CardHeader>
                                <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                    SUBMISSIONS USING YOUR TOOLS
                                </h2>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-4">
                                    {filteredSubmissions.map((submission) => (
                                        <div
                                            key={submission.id}
                                            className="flex items-start justify-between p-4 border border-outer-space rounded hover:border-hacker-green transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-white">
                                                        {submission.title}
                                                    </h3>
                                                    <Chip
                                                        color={getSubmissionStateColor(submission.state)}
                                                        variant="flat"
                                                        size="sm"
                                                    >
                                                        {submission.state.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </div>

                                                <p className="text-sm text-outer-space mb-2">
                                                    Team: {getTeamName(submission.team_id)}
                                                </p>

                                                <p className="text-sm text-outer-space line-clamp-2 mb-3">
                                                    {submission.description}
                                                </p>

                                                <div className="flex items-center gap-4 text-sm">
                                                    <Link
                                                        href={submission.github_link}
                                                        isExternal
                                                        className="text-hacker-green"
                                                    >
                                                        GitHub Repository
                                                    </Link>
                                                    {submission.presentation_link && (
                                                        <Link
                                                            href={submission.presentation_link}
                                                            isExternal
                                                            className="text-fluorescent-cyan"
                                                        >
                                                            Presentation
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right ml-4">
                                                <p className="text-xs text-outer-space">Updated</p>
                                                <p className="text-sm text-white font-mono">
                                                    {new Date(submission.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredSubmissions.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-outer-space text-lg mb-2">NO SUBMISSIONS USING YOUR TOOLS</p>
                                            <p className="text-sm text-outer-space">
                                                Teams haven't started using your technologies yet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Create Prize Modal */}
                        <Modal
                            isOpen={isOpen}
                            onClose={onClose}
                            className="hacker-card"
                            backdrop="blur"
                            size="2xl"
                        >
                            <ModalContent>
                                {(onClose) => (
                                    <>
                                        <ModalHeader className="flex flex-col gap-1">
                                            <h2 className="text-xl font-bold terminal-text text-hacker-green">
                                                CREATE SPONSOR PRIZE
                                            </h2>
                                            <p className="text-sm text-outer-space">
                                                Add a prize for teams using your technology
                                            </p>
                                        </ModalHeader>
                                        <ModalBody>
                                            <div className="space-y-4">
                                                <Input
                                                    label="Prize Title"
                                                    placeholder="Best Use of [Your Technology]"
                                                    value={prizeFormData.title}
                                                    onChange={(e) => setPrizeFormData({ ...prizeFormData, title: e.target.value })}
                                                    className="font-mono"
                                                    variant="bordered"
                                                />

                                                <Textarea
                                                    label="Prize Description"
                                                    placeholder="Describe what this prize recognizes"
                                                    value={prizeFormData.description}
                                                    onChange={(e) => setPrizeFormData({ ...prizeFormData, description: e.target.value })}
                                                    className="font-mono"
                                                    variant="bordered"
                                                    rows={3}
                                                />

                                                <Input
                                                    label="Prize Value"
                                                    placeholder="$1000, MacBook Pro, API Credits, etc."
                                                    value={prizeFormData.value}
                                                    onChange={(e) => setPrizeFormData({ ...prizeFormData, value: e.target.value })}
                                                    className="font-mono"
                                                    variant="bordered"
                                                />
                                            </div>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button
                                                className="cyber-button"
                                                variant="bordered"
                                                onPress={onClose}
                                            >
                                                CANCEL
                                            </Button>
                                            <Button
                                                className="cyber-button"
                                                onPress={handleCreatePrize}
                                                disabled={!prizeFormData.title || !prizeFormData.description || !prizeFormData.value}
                                            >
                                                CREATE PRIZE
                                            </Button>
                                        </ModalFooter>
                                    </>
                                )}
                            </ModalContent>
                        </Modal>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
