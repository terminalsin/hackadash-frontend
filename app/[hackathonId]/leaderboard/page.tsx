"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Tabs, Tab } from "@heroui/tabs";
import { useTeams } from "@/hooks/useTeams";
import { useSubmissions } from "@/hooks/useSubmissions";
import { usePrizes } from "@/hooks/usePrizes";
import { Team, Submission, SubmissionState, Prize } from "@/types";

interface TeamScore {
    team: Team;
    submission?: Submission;
    score: number;
    rank: number;
}

export default function LeaderboardPage({
    params,
}: {
    params: { hackathonId: string };
}) {
    const { teams, loading: teamsLoading } = useTeams(params.hackathonId);
    const { submissions, loading: submissionsLoading } = useSubmissions(params.hackathonId);
    const { prizes, loading: prizesLoading } = usePrizes(params.hackathonId);
    const [selectedTab, setSelectedTab] = useState("overall");
    const [teamScores, setTeamScores] = useState<TeamScore[]>([]);

    // Calculate team scores and rankings
    useEffect(() => {
        if (teams.length > 0 && submissions.length > 0) {
            const scores: TeamScore[] = teams.map((team) => {
                const teamSubmission = submissions.find(s => s.teamId === team.id);

                // Simple scoring algorithm
                let score = 0;

                if (teamSubmission) {
                    // Base score for having a submission
                    score += 10;

                    // Bonus for submission state
                    switch (teamSubmission.state) {
                        case SubmissionState.DRAFT:
                            score += 5;
                            break;
                        case SubmissionState.READY_TO_DEMO:
                            score += 15;
                            break;
                        case SubmissionState.PRESENTED:
                            score += 25;
                            break;
                    }

                    // Bonus for using sponsors
                    score += teamSubmission.sponsorsUsed.length * 5;

                    // Bonus for having presentation link
                    if (teamSubmission.presentationLink) {
                        score += 10;
                    }
                }

                // Bonus for team size
                score += team.members.length * 2;

                return {
                    team,
                    submission: teamSubmission,
                    score,
                    rank: 0, // Will be set after sorting
                };
            });

            // Sort by score and assign ranks
            scores.sort((a, b) => b.score - a.score);
            scores.forEach((teamScore, index) => {
                teamScore.rank = index + 1;
            });

            setTeamScores(scores);
        }
    }, [teams, submissions]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return "🥇";
            case 2:
                return "🥈";
            case 3:
                return "🥉";
            default:
                return `#${rank}`;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "warning"; // Gold
            case 2:
                return "default"; // Silver
            case 3:
                return "secondary"; // Bronze
            default:
                return "primary";
        }
    };

    const getSubmissionStateText = (submission?: Submission) => {
        if (!submission) return "No Submission";
        return submission.state.replace('_', ' ').toUpperCase();
    };

    const getSubmissionStateColor = (submission?: Submission) => {
        if (!submission) return "danger";
        switch (submission.state) {
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

    if (teamsLoading || submissionsLoading || prizesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">CALCULATING RANKINGS...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold terminal-text text-hacker-green">
                        LEADERBOARD
                    </h1>
                    <p className="text-outer-space">Current team rankings and competition status</p>
                </div>

                {/* Navigation Tabs */}
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
                    <Tab key="overall" title="OVERALL RANKING">
                    </Tab>
                    <Tab key="prizes" title="PRIZE CATEGORIES">
                    </Tab>
                </Tabs>

                {selectedTab === "overall" && (
                    <div className="space-y-4">
                        {/* Top 3 Podium */}
                        {teamScores.length >= 3 && (
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {/* 2nd Place */}
                                <Card className="hacker-card neon-border">
                                    <CardBody className="text-center py-6">
                                        <div className="text-4xl mb-2">🥈</div>
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            {teamScores[1].team.name}
                                        </h3>
                                        <p className="text-2xl font-bold text-fluorescent-cyan">
                                            {teamScores[1].score} PTS
                                        </p>
                                        <Chip
                                            color={getSubmissionStateColor(teamScores[1].submission)}
                                            variant="flat"
                                            size="sm"
                                            className="mt-2"
                                        >
                                            {getSubmissionStateText(teamScores[1].submission)}
                                        </Chip>
                                    </CardBody>
                                </Card>

                                {/* 1st Place */}
                                <Card className="hacker-card neon-border scale-110">
                                    <CardBody className="text-center py-8">
                                        <div className="text-6xl mb-3">🥇</div>
                                        <h3 className="text-xl font-bold text-hacker-green mb-2">
                                            {teamScores[0].team.name}
                                        </h3>
                                        <p className="text-3xl font-bold text-warning-red">
                                            {teamScores[0].score} PTS
                                        </p>
                                        <Chip
                                            color={getSubmissionStateColor(teamScores[0].submission)}
                                            variant="shadow"
                                            className="mt-2"
                                        >
                                            {getSubmissionStateText(teamScores[0].submission)}
                                        </Chip>
                                    </CardBody>
                                </Card>

                                {/* 3rd Place */}
                                <Card className="hacker-card neon-border">
                                    <CardBody className="text-center py-6">
                                        <div className="text-4xl mb-2">🥉</div>
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            {teamScores[2].team.name}
                                        </h3>
                                        <p className="text-2xl font-bold text-fluorescent-cyan">
                                            {teamScores[2].score} PTS
                                        </p>
                                        <Chip
                                            color={getSubmissionStateColor(teamScores[2].submission)}
                                            variant="flat"
                                            size="sm"
                                            className="mt-2"
                                        >
                                            {getSubmissionStateText(teamScores[2].submission)}
                                        </Chip>
                                    </CardBody>
                                </Card>
                            </div>
                        )}

                        {/* Full Rankings */}
                        <Card className="hacker-card">
                            <CardHeader>
                                <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                    COMPLETE RANKINGS
                                </h2>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-3">
                                    {teamScores.map((teamScore) => (
                                        <div
                                            key={teamScore.team.id}
                                            className={`flex items-center gap-4 p-4 border rounded ${teamScore.rank <= 3 ? 'border-hacker-green' : 'border-outer-space'
                                                }`}
                                        >
                                            {/* Rank */}
                                            <div className="flex items-center justify-center w-12 h-12">
                                                <Chip
                                                    color={getRankColor(teamScore.rank)}
                                                    variant="shadow"
                                                    className="font-mono font-bold"
                                                >
                                                    {getRankIcon(teamScore.rank)}
                                                </Chip>
                                            </div>

                                            {/* Team Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-white">
                                                        {teamScore.team.name}
                                                    </h3>
                                                    <Chip
                                                        color={getSubmissionStateColor(teamScore.submission)}
                                                        variant="flat"
                                                        size="sm"
                                                    >
                                                        {getSubmissionStateText(teamScore.submission)}
                                                    </Chip>
                                                </div>

                                                <p className="text-sm text-outer-space line-clamp-1">
                                                    {teamScore.team.description}
                                                </p>

                                                {/* Team Members */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex -space-x-2">
                                                        {teamScore.team.members.slice(0, 4).map((member) => (
                                                            <Avatar
                                                                key={member.id}
                                                                size="sm"
                                                                name={member.name}
                                                                className="bg-hacker-green text-black border-2 border-black"
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-outer-space">
                                                        {teamScore.team.members.length} member{teamScore.team.members.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-hacker-green font-mono">
                                                    {teamScore.score}
                                                </p>
                                                <p className="text-xs text-outer-space">POINTS</p>
                                            </div>
                                        </div>
                                    ))}

                                    {teamScores.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-outer-space text-lg mb-2">NO TEAMS YET</p>
                                            <p className="text-sm text-outer-space">Rankings will appear as teams join and submit projects</p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {selectedTab === "prizes" && (
                    <div className="space-y-6">
                        {/* Prize Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prizes.map((prize) => (
                                <Card key={prize.id} className="hacker-card neon-border">
                                    <CardHeader>
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white">
                                                    {prize.title}
                                                </h3>
                                                <p className="text-sm text-fluorescent-cyan">
                                                    {prize.sponsorId ? "Sponsor Prize" : "General Prize"}
                                                </p>
                                            </div>
                                            <Chip
                                                color="success"
                                                variant="shadow"
                                                className="font-mono"
                                                size="sm"
                                            >
                                                {prize.value}
                                            </Chip>
                                        </div>
                                    </CardHeader>

                                    <CardBody className="space-y-4">
                                        <p className="text-sm text-outer-space">
                                            {prize.description}
                                        </p>

                                        <Divider />

                                        {/* Prize Criteria */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-hacker-green mb-2">
                                                EVALUATION CRITERIA
                                            </h4>
                                            <div className="text-xs text-outer-space space-y-1">
                                                <p>• Innovation and Creativity</p>
                                                <p>• Technical Implementation</p>
                                                <p>• Presentation Quality</p>
                                                <p>• Use of Sponsor Technologies</p>
                                            </div>
                                        </div>

                                        <Divider />

                                        {/* Potential Winners */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-hacker-green mb-2">
                                                TOP CONTENDERS
                                            </h4>
                                            <div className="space-y-1">
                                                {teamScores.slice(0, 3).map((teamScore, index) => (
                                                    <div key={teamScore.team.id} className="flex items-center gap-2 text-xs">
                                                        <span className="text-outer-space">#{index + 1}</span>
                                                        <span className="text-white">{teamScore.team.name}</span>
                                                        <span className="text-hacker-green font-mono">{teamScore.score}pts</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}

                            {prizes.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-outer-space text-lg mb-2">NO PRIZES ANNOUNCED</p>
                                    <p className="text-sm text-outer-space">Prize categories will be revealed by organizers</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
