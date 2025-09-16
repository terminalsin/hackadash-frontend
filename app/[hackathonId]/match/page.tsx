"use client";

import { useState, use } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { useRouter } from "next/navigation";
import { useTeams } from "@/hooks/useTeams";
import { Team } from "@/types";
import { useUser } from "@clerk/nextjs";

interface GitHubProfile {
    login: string;
    name: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    avatar_url: string;
    html_url: string;
    languages?: string[];
}

export default function MatchPage({
    params,
}: {
    params: Promise<{ hackathonId: string }>;
}) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { teams, joinTeam } = useTeams(parseInt(resolvedParams.hackathonId));
    const { user } = useUser();

    const [githubUsername, setGithubUsername] = useState("");
    const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [matchedTeam, setMatchedTeam] = useState<Team | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [error, setError] = useState("");

    // Filter teams that have space and user is not already in
    const availableTeams = teams.filter(team =>
        team.members.length < 4 &&
        !team.members.some(member => member.email === user?.primaryEmailAddress?.emailAddress)
    );

    const fetchGitHubProfile = async () => {
        if (!githubUsername.trim()) {
            setError("Please enter a GitHub username");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`https://api.github.com/users/${githubUsername}`);
            if (!response.ok) {
                throw new Error("GitHub user not found");
            }

            const profileData = await response.json();

            // Fetch user's repositories to get language data
            const reposResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`);
            const repos = await reposResponse.json();

            // Extract languages from repositories
            const languages = new Set<string>();
            for (const repo of repos) {
                if (repo.language) {
                    languages.add(repo.language);
                }
            }

            const profile: GitHubProfile = {
                ...profileData,
                languages: Array.from(languages)
            };

            setGithubProfile(profile);
            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch GitHub profile");
            setIsLoading(false);
        }
    };

    const calculateTeamMatch = (team: Team, profile: GitHubProfile): number => {
        let score = 0;

        // Base score for team size (prefer teams with some members but not full)
        if (team.members.length === 1) score += 30;
        else if (team.members.length === 2) score += 50;
        else if (team.members.length === 3) score += 40;

        // Bonus for team description keywords matching common tech terms
        const techKeywords = profile.languages || [];
        const teamDesc = team.description.toLowerCase();

        techKeywords.forEach(lang => {
            if (teamDesc.includes(lang.toLowerCase())) {
                score += 20;
            }
        });

        // Bonus for active GitHub profile
        if (profile.public_repos > 10) score += 15;
        if (profile.followers > 5) score += 10;

        // Random factor to make it interesting
        score += Math.random() * 20;

        return Math.min(score, 100);
    };

    const startMatching = async () => {
        if (!githubProfile || availableTeams.length === 0) return;

        setIsMatching(true);
        setCurrentCardIndex(0);

        // Simulate Tinder-style card swiping animation
        const matchingDuration = 3000; // 3 seconds
        const cardInterval = matchingDuration / Math.min(availableTeams.length, 5);

        let cardIndex = 0;
        const cardTimer = setInterval(() => {
            if (cardIndex < Math.min(availableTeams.length - 1, 4)) {
                cardIndex++;
                setCurrentCardIndex(cardIndex);
            } else {
                clearInterval(cardTimer);

                // Find the best match
                const teamScores = availableTeams.map(team => ({
                    team,
                    score: calculateTeamMatch(team, githubProfile)
                }));

                teamScores.sort((a, b) => b.score - a.score);
                const bestMatch = teamScores[0]?.team;

                setTimeout(() => {
                    setMatchedTeam(bestMatch);
                    setIsMatching(false);
                }, 500);
            }
        }, cardInterval);
    };

    const handleJoinMatchedTeam = async () => {
        if (!matchedTeam) return;

        try {
            await joinTeam(matchedTeam.id, {});
            router.push(`/${resolvedParams.hackathonId}/team-details`);
        } catch (error) {
            console.error("Failed to join team:", error);
            setError("Failed to join team. Please try again.");
        }
    };

    const resetMatch = () => {
        setMatchedTeam(null);
        setCurrentCardIndex(0);
    };

    if (availableTeams.length === 0) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="hacker-card">
                        <CardBody className="text-center py-12">
                            <h2 className="text-2xl font-bold text-warning-red mb-4">NO TEAMS AVAILABLE</h2>
                            <p className="text-outer-space mb-4">All teams are currently full or you're already in a team.</p>
                            <Button
                                className="cyber-button"
                                onPress={() => router.push(`/${resolvedParams.hackathonId}/teams`)}
                            >
                                BACK TO TEAMS
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                {!matchedTeam && (
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold terminal-text text-hacker-green mb-2">
                            TEAM MATCHER
                        </h1>
                        <p className="text-outer-space">
                            Connect your GitHub profile to find the perfect team match
                        </p>
                    </div>
                )
                }


                {!githubProfile && !isLoading && (
                    <Card className="hacker-card neon-border">
                        <CardHeader>
                            <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                CONNECT GITHUB PROFILE
                            </h2>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <p className="text-outer-space">
                                Enter your GitHub username to analyze your coding profile and find compatible teams.
                            </p>

                            <div className="flex gap-3">
                                <Input
                                    placeholder="Enter GitHub username"
                                    value={githubUsername}
                                    onChange={(e) => setGithubUsername(e.target.value)}
                                    className="font-mono flex-1"
                                    variant="bordered"
                                    onKeyPress={(e) => e.key === 'Enter' && fetchGitHubProfile()}
                                />
                                <Button
                                    className="cyber-button"
                                    onPress={fetchGitHubProfile}
                                    disabled={!githubUsername.trim()}
                                >
                                    ANALYZE
                                </Button>
                            </div>

                            {error && (
                                <p className="text-warning-red text-sm">{error}</p>
                            )}
                        </CardBody>
                    </Card>
                )}

                {isLoading && (
                    <Card className="hacker-card">
                        <CardBody className="text-center py-12">
                            <div className="loading-matrix mb-4"></div>
                            <p className="terminal-text text-hacker-green">ANALYZING GITHUB PROFILE...</p>
                        </CardBody>
                    </Card>
                )}

                {githubProfile && !isMatching && !matchedTeam && (
                    <Card className="hacker-card neon-border">
                        <CardHeader>
                            <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                PROFILE ANALYSIS COMPLETE
                            </h2>
                        </CardHeader>
                        <CardBody className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar
                                    src={githubProfile.avatar_url}
                                    size="lg"
                                    className="border-2 border-hacker-green"
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">{githubProfile.name || githubProfile.login}</h3>
                                    <p className="text-outer-space">@{githubProfile.login}</p>
                                    {githubProfile.bio && (
                                        <p className="text-sm text-outer-space mt-1">{githubProfile.bio}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-fluorescent-cyan">{githubProfile.public_repos}</p>
                                    <p className="text-xs text-outer-space">REPOSITORIES</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-fluorescent-cyan">{githubProfile.followers}</p>
                                    <p className="text-xs text-outer-space">FOLLOWERS</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-fluorescent-cyan">{githubProfile.following}</p>
                                    <p className="text-xs text-outer-space">FOLLOWING</p>
                                </div>
                            </div>

                            {githubProfile.languages && githubProfile.languages.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-hacker-green mb-2">TOP LANGUAGES</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {githubProfile.languages.slice(0, 8).map((lang) => (
                                            <Chip key={lang} variant="flat" color="secondary" size="sm">
                                                {lang}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-center pt-4">
                                <Button
                                    className="cyber-button text-lg px-8"
                                    onPress={startMatching}
                                    size="lg"
                                >
                                    FIND MY TEAM MATCH
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {isMatching && (
                    <div className="text-center">
                        <Card className="hacker-card matrix-bg">
                            <CardBody className="py-12 relative overflow-hidden">
                                {/* Floating particles effect */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(20)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-1 h-1 bg-hacker-green rounded-full opacity-30"
                                            style={{
                                                left: `${Math.random() * 100}%`,
                                                top: `${Math.random() * 100}%`,
                                                animationDelay: `${Math.random() * 2}s`,
                                                animation: `float ${2 + Math.random() * 3}s ease-in-out infinite alternate`
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="relative h-64 flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="loading-matrix scale-150"></div>
                                        {/* Additional spinning rings */}
                                        <div className="absolute w-32 h-32 border border-fluorescent-cyan rounded-full opacity-30 animate-spin" style={{ animationDuration: '3s' }}></div>
                                        <div className="absolute w-24 h-24 border border-hacker-green rounded-full opacity-20 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                                    </div>

                                    {/* Tinder-style card stack */}
                                    <div className="relative w-64 h-40">
                                        {availableTeams.slice(0, 5).map((team, index) => (
                                            <div
                                                key={team.id}
                                                className={`absolute inset-0 bg-gradient-to-br from-gray-900 to-black border border-hacker-green rounded-lg p-4 transition-all duration-500 ${index < currentCardIndex
                                                    ? 'transform rotate-12 translate-x-32 opacity-0'
                                                    : index === currentCardIndex
                                                        ? 'transform scale-105 z-10 neon-border'
                                                        : 'transform scale-95 opacity-70'
                                                    }`}
                                                style={{
                                                    zIndex: availableTeams.length - index,
                                                    transform: index < currentCardIndex
                                                        ? 'rotate(12deg) translateX(200px)'
                                                        : index === currentCardIndex
                                                            ? 'scale(1.05)'
                                                            : `scale(0.95) translateY(${(index - currentCardIndex) * 8}px)`
                                                }}
                                            >
                                                <h3 className="text-white font-bold text-sm truncate">{team.name}</h3>
                                                <p className="text-outer-space text-xs mt-1 line-clamp-2">{team.description}</p>
                                                <div className="absolute bottom-2 right-2">
                                                    <Chip size="sm" color="success" variant="flat">
                                                        {team.members.length}/4
                                                    </Chip>
                                                </div>
                                                {index === currentCardIndex && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-hacker-green rounded-full animate-ping"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <p className="terminal-text text-hacker-green text-lg mt-4 animate-pulse">
                                    ANALYZING TEAM COMPATIBILITY...
                                </p>
                                <div className="flex justify-center mt-2">
                                    <div className="flex space-x-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-2 h-2 bg-hacker-green rounded-full animate-bounce"
                                                style={{ animationDelay: `${i * 0.2}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 w-64 mx-auto">
                                    <div className="w-full bg-gray-800 rounded-full h-1">
                                        <div
                                            className="bg-gradient-to-r from-hacker-green to-fluorescent-cyan h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${((currentCardIndex + 1) / Math.min(availableTeams.length, 5)) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-outer-space mt-1">
                                        Analyzing team {currentCardIndex + 1} of {Math.min(availableTeams.length, 5)}
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {matchedTeam && (
                    <div className="text-center">
                        <div className="mb-6 relative">
                            {/* Celebration particles */}
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(15)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-2 h-2 bg-hacker-green rounded-full animate-ping"
                                        style={{
                                            left: `${20 + Math.random() * 60}%`,
                                            top: `${20 + Math.random() * 60}%`,
                                            animationDelay: `${Math.random() * 2}s`,
                                            animationDuration: `${1 + Math.random()}s`
                                        }}
                                    />
                                ))}
                            </div>

                            <h2 className="text-4xl font-bold text-hacker-green terminal-text mb-2 glitch-text">
                                MATCH FOUND!
                            </h2>
                            <p className="text-fluorescent-cyan animate-pulse">Perfect compatibility detected</p>

                            {/* Success indicator */}
                            <div className="flex justify-center mt-4">
                                <div className="w-16 h-16 border-4 border-hacker-green rounded-full flex items-center justify-center animate-bounce">
                                    <div className="w-8 h-8 bg-hacker-green rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        <Card className="hacker-card neon-border match-found relative overflow-hidden">
                            {/* Background glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-hacker-green/10 via-transparent to-fluorescent-cyan/10 animate-pulse"></div>

                            <CardHeader className="relative z-10">
                                <div className="flex justify-between items-center w-full">
                                    <h3 className="text-xl font-bold text-white">{matchedTeam.name}</h3>
                                    <Chip
                                        color="success"
                                        variant="shadow"
                                        className="font-mono animate-pulse"
                                        style={{
                                            boxShadow: '0 0 20px rgba(68, 255, 0, 0.5)'
                                        }}
                                    >
                                        {Math.floor(calculateTeamMatch(matchedTeam, githubProfile!))}% MATCH
                                    </Chip>
                                </div>
                            </CardHeader>
                            <CardBody className="space-y-4 relative z-10">
                                <p className="text-outer-space">{matchedTeam.description}</p>

                                <div>
                                    <h4 className="text-sm font-semibold text-hacker-green mb-2">CURRENT MEMBERS</h4>
                                    <div className="space-y-2">
                                        {matchedTeam.members.map((member, index) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-3 animate-fade-in"
                                                style={{ animationDelay: `${index * 0.2}s` }}
                                            >
                                                <Avatar
                                                    size="sm"
                                                    name={member.name}
                                                    className="bg-hacker-green text-black"
                                                />
                                                <div className="flex-1 text-left">
                                                    <p className="text-white text-sm">{member.name}</p>
                                                    <p className="text-outer-space text-xs">{member.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        className="cyber-button flex-1"
                                        variant="bordered"
                                        onPress={resetMatch}
                                    >
                                        FIND ANOTHER
                                    </Button>
                                    <Button
                                        className="cyber-button flex-1 animate-pulse"
                                        onPress={handleJoinMatchedTeam}
                                        style={{
                                            boxShadow: '0 0 20px rgba(68, 255, 0, 0.3)'
                                        }}
                                    >
                                        JOIN TEAM
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* Back button */}
                <div className="text-center pt-6">
                    <Button
                        className="cyber-button"
                        variant="bordered"
                        onPress={() => router.push(`/${resolvedParams.hackathonId}/teams`)}
                    >
                        BACK TO TEAMS
                    </Button>
                </div>
            </div>
        </div>
    );
}
