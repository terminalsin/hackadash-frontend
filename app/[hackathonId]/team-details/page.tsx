"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { useTeams } from "@/hooks/useTeams";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useSponsors } from "@/hooks/useSponsors";
import { Team, Submission, SubmissionState } from "@/types";
import { useUser } from "@clerk/nextjs";

export default function TeamDetailsPage({
    params,
}: {
    params: { hackathonId: string };
}) {
    const { teams, loading: teamsLoading } = useTeams(params.hackathonId);
    const { submissions, loading: submissionsLoading, createSubmission, updateSubmission } = useSubmissions(params.hackathonId);
    const { sponsors } = useSponsors(params.hackathonId);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user } = useUser();

    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [teamSubmission, setTeamSubmission] = useState<Submission | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        githubLink: "",
        presentationLink: "",
        sponsorsUsed: [] as string[],
    });

    // Find user's team based on authenticated user
    useEffect(() => {
        if (teams.length > 0 && user) {
            // Find team where the user is a member (by email)
            const userTeam = teams.find(team => 
                team.members.some(member => 
                    member.email === user.primaryEmailAddress?.emailAddress
                )
            );
            
            if (userTeam) {
                setCurrentTeam(userTeam);

                // Find team's submission
                const submission = submissions.find(s => s.teamId === userTeam.id);
                setTeamSubmission(submission || null);

                if (submission) {
                    setFormData({
                        title: submission.title,
                        description: submission.description,
                        githubLink: submission.githubLink,
                        presentationLink: submission.presentationLink || "",
                        sponsorsUsed: submission.sponsorsUsed,
                    });
                }
            } else {
                // User is not part of any team yet
                setCurrentTeam(null);
                setTeamSubmission(null);
            }
        }
    }, [teams, submissions, user]);

    const handleCreateSubmission = async () => {
        if (!currentTeam) return;

        try {
            const newSubmission = await createSubmission({
                title: formData.title,
                description: formData.description,
                githubLink: formData.githubLink,
                presentationLink: formData.presentationLink || undefined,
                state: SubmissionState.DRAFT,
                sponsorsUsed: formData.sponsorsUsed,
                teamId: currentTeam.id,
                hackathonId: params.hackathonId,
            });
            setTeamSubmission(newSubmission);
            onClose();
        } catch (error) {
            console.error("Failed to create submission:", error);
        }
    };

    const handleUpdateSubmission = async () => {
        if (!teamSubmission) return;

        try {
            const updatedSubmission = await updateSubmission(teamSubmission.id, {
                title: formData.title,
                description: formData.description,
                githubLink: formData.githubLink,
                presentationLink: formData.presentationLink || undefined,
                sponsorsUsed: formData.sponsorsUsed,
            });
            setTeamSubmission(updatedSubmission);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update submission:", error);
        }
    };

    const openCreateModal = () => {
        setFormData({
            title: "",
            description: "",
            githubLink: "",
            presentationLink: "",
            sponsorsUsed: [],
        });
        setIsEditing(false);
        onOpen();
    };

    const openEditMode = () => {
        setIsEditing(true);
    };

    const getStateColor = (state: SubmissionState) => {
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

    const getSponsorName = (sponsorId: string) => {
        const sponsor = sponsors.find(s => s.id === sponsorId);
        return sponsor?.name || "Unknown Sponsor";
    };

    if (teamsLoading || submissionsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">LOADING TEAM DATA...</span>
            </div>
        );
    }

    if (!currentTeam) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="hacker-card">
                        <CardBody className="text-center py-12">
                            <h2 className="text-2xl font-bold text-warning-red mb-4">NO TEAM FOUND</h2>
                            <p className="text-outer-space mb-4">You need to join or create a team first.</p>
                            <Button
                                className="cyber-button"
                                onPress={() => window.location.href = `/${params.hackathonId}/teams`}
                            >
                                GO TO TEAMS
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Team Header */}
                <Card className="hacker-card neon-border">
                    <CardHeader>
                        <div className="flex justify-between items-start w-full">
                            <div>
                                <h1 className="text-2xl font-bold text-hacker-green terminal-text">
                                    {currentTeam.name}
                                </h1>
                                <p className="text-outer-space">{currentTeam.description}</p>
                            </div>
                            <Chip
                                color="success"
                                variant="shadow"
                                className="font-mono"
                            >
                                YOUR TEAM
                            </Chip>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Team Members */}
                            <div>
                                <h3 className="text-lg font-semibold text-hacker-green mb-3">TEAM MEMBERS</h3>
                                <div className="space-y-2">
                                    {currentTeam.members.map((member) => (
                                        <div key={member.id} className="flex items-center gap-3 p-2 border border-outer-space rounded">
                                            <Avatar
                                                size="sm"
                                                name={member.name}
                                                className="bg-hacker-green text-black"
                                            />
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{member.name}</p>
                                                <p className="text-xs text-outer-space">{member.email}</p>
                                            </div>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={member.role === "guest" ? "primary" : "default"}
                                            >
                                                {member.role === "guest" ? "LEADER" : member.role.toUpperCase()}
                                            </Chip>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team Stats */}
                            <div>
                                <h3 className="text-lg font-semibold text-hacker-green mb-3">TEAM STATS</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-outer-space">Members:</span>
                                        <span className="text-white font-mono">{currentTeam.members.length}/4</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-outer-space">Formed:</span>
                                        <span className="text-white font-mono">
                                            {new Date(currentTeam.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-outer-space">Submission:</span>
                                        <Chip
                                            size="sm"
                                            color={teamSubmission ? getStateColor(teamSubmission.state) : "danger"}
                                            variant="flat"
                                        >
                                            {teamSubmission ? teamSubmission.state.replace('_', ' ').toUpperCase() : "NOT STARTED"}
                                        </Chip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Submission Section */}
                <Card className="hacker-card neon-border">
                    <CardHeader>
                        <div className="flex justify-between items-center w-full">
                            <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                PROJECT SUBMISSION
                            </h2>
                            {teamSubmission ? (
                                <div className="flex gap-2">
                                    {!isEditing && (
                                        <Button
                                            className="cyber-button"
                                            variant="bordered"
                                            size="sm"
                                            onPress={openEditMode}
                                        >
                                            EDIT
                                        </Button>
                                    )}
                                    {isEditing && (
                                        <>
                                            <Button
                                                className="cyber-button"
                                                variant="bordered"
                                                size="sm"
                                                onPress={() => setIsEditing(false)}
                                            >
                                                CANCEL
                                            </Button>
                                            <Button
                                                className="cyber-button"
                                                size="sm"
                                                onPress={handleUpdateSubmission}
                                            >
                                                SAVE
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    className="cyber-button"
                                    onPress={openCreateModal}
                                >
                                    CREATE SUBMISSION
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardBody>
                        {teamSubmission ? (
                            <div className="space-y-6">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <Input
                                            label="Project Title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />
                                        <Textarea
                                            label="Project Description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                            rows={4}
                                        />
                                        <Input
                                            label="GitHub Repository"
                                            value={formData.githubLink}
                                            onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />
                                        <Input
                                            label="Presentation Link (Optional)"
                                            value={formData.presentationLink}
                                            onChange={(e) => setFormData({ ...formData, presentationLink: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />
                                        <Select
                                            label="Sponsors/Technologies Used"
                                            placeholder="Select sponsors"
                                            selectionMode="multiple"
                                            selectedKeys={formData.sponsorsUsed}
                                            onSelectionChange={(keys) => setFormData({ ...formData, sponsorsUsed: Array.from(keys) as string[] })}
                                            className="font-mono"
                                            variant="bordered"
                                        >
                                            {sponsors.map((sponsor) => (
                                                <SelectItem key={sponsor.id} value={sponsor.id}>
                                                    {sponsor.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-2">{teamSubmission.title}</h3>
                                            <p className="text-outer-space">{teamSubmission.description}</p>
                                        </div>

                                        <Divider />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-semibold text-hacker-green mb-2">LINKS</h4>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-outer-space">Repository:</p>
                                                        <Link
                                                            href={teamSubmission.githubLink}
                                                            isExternal
                                                            className="text-hacker-green font-mono text-sm"
                                                        >
                                                            {teamSubmission.githubLink}
                                                        </Link>
                                                    </div>
                                                    {teamSubmission.presentationLink && (
                                                        <div>
                                                            <p className="text-xs text-outer-space">Presentation:</p>
                                                            <Link
                                                                href={teamSubmission.presentationLink}
                                                                isExternal
                                                                className="text-fluorescent-cyan font-mono text-sm"
                                                            >
                                                                View Presentation
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-semibold text-hacker-green mb-2">STATUS</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-outer-space text-xs">Current State:</span>
                                                        <Chip
                                                            color={getStateColor(teamSubmission.state)}
                                                            variant="flat"
                                                            size="sm"
                                                        >
                                                            {teamSubmission.state.replace('_', ' ').toUpperCase()}
                                                        </Chip>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-outer-space">Last Updated:</p>
                                                        <p className="text-white font-mono text-sm">
                                                            {new Date(teamSubmission.updatedAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {teamSubmission.sponsorsUsed.length > 0 && (
                                            <>
                                                <Divider />
                                                <div>
                                                    <h4 className="text-sm font-semibold text-hacker-green mb-2">
                                                        TECHNOLOGIES USED
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {teamSubmission.sponsorsUsed.map((sponsorId) => (
                                                            <Chip
                                                                key={sponsorId}
                                                                variant="flat"
                                                                color="secondary"
                                                                size="sm"
                                                            >
                                                                {getSponsorName(sponsorId)}
                                                            </Chip>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-outer-space text-lg mb-4">NO SUBMISSION YET</p>
                                <p className="text-sm text-outer-space mb-4">Create your team's project submission to get started</p>
                                <Button
                                    className="cyber-button"
                                    onPress={openCreateModal}
                                >
                                    CREATE SUBMISSION
                                </Button>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Create Submission Modal */}
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
                                        CREATE PROJECT SUBMISSION
                                    </h2>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="space-y-4">
                                        <Input
                                            label="Project Title"
                                            placeholder="Enter your project name"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />

                                        <Textarea
                                            label="Project Description"
                                            placeholder="Describe what your project does"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                            rows={4}
                                        />

                                        <Input
                                            label="GitHub Repository"
                                            placeholder="https://github.com/username/repo"
                                            value={formData.githubLink}
                                            onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />

                                        <Input
                                            label="Presentation Link (Optional)"
                                            placeholder="Link to demo, slides, or video"
                                            value={formData.presentationLink}
                                            onChange={(e) => setFormData({ ...formData, presentationLink: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />

                                        <Select
                                            label="Sponsors/Technologies Used"
                                            placeholder="Select sponsors"
                                            selectionMode="multiple"
                                            selectedKeys={formData.sponsorsUsed}
                                            onSelectionChange={(keys) => setFormData({ ...formData, sponsorsUsed: Array.from(keys) as string[] })}
                                            className="font-mono"
                                            variant="bordered"
                                        >
                                            {sponsors.map((sponsor) => (
                                                <SelectItem key={sponsor.id} value={sponsor.id}>
                                                    {sponsor.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
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
                                        onPress={handleCreateSubmission}
                                        disabled={!formData.title || !formData.description || !formData.githubLink}
                                    >
                                        CREATE
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}
