"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useTeams } from "@/hooks/useTeams";
import { useSponsors } from "@/hooks/useSponsors";
import { Submission, SubmissionState } from "@/types";

export default function SubmissionsPage({
    params,
}: {
    params: { hackathonId: string };
}) {
    const { submissions, loading, updateSubmissionState } = useSubmissions(params.hackathonId);
    const { teams } = useTeams(params.hackathonId);
    const { sponsors } = useSponsors(params.hackathonId);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

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

    const getTeamName = (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        return team?.name || "Unknown Team";
    };

    const getSponsorName = (sponsorId: string) => {
        const sponsor = sponsors.find(s => s.id === sponsorId);
        return sponsor?.name || "Unknown Sponsor";
    };

    const handleStateChange = async (submissionId: string, newState: SubmissionState) => {
        try {
            await updateSubmissionState(submissionId, newState);
        } catch (error) {
            console.error("Failed to update submission state:", error);
        }
    };

    const openViewModal = (submission: Submission) => {
        setSelectedSubmission(submission);
        onOpen();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">ANALYZING SUBMISSIONS...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold terminal-text text-hacker-green">
                            SUBMISSION TRACKER
                        </h1>
                        <p className="text-outer-space">Monitor project submissions and demos</p>
                    </div>
                    <div className="flex gap-2">
                        <Chip variant="flat" color="warning" size="sm">
                            DRAFT: {submissions.filter(s => s.state === SubmissionState.DRAFT).length}
                        </Chip>
                        <Chip variant="flat" color="primary" size="sm">
                            READY: {submissions.filter(s => s.state === SubmissionState.READY_TO_DEMO).length}
                        </Chip>
                        <Chip variant="flat" color="success" size="sm">
                            PRESENTED: {submissions.filter(s => s.state === SubmissionState.PRESENTED).length}
                        </Chip>
                    </div>
                </div>

                {/* Submissions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submissions.map((submission) => (
                        <Card key={submission.id} className="hacker-card neon-border">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white truncate">
                                            {submission.title}
                                        </h3>
                                        <p className="text-sm text-fluorescent-cyan">
                                            {getTeamName(submission.teamId)}
                                        </p>
                                    </div>
                                    <Chip
                                        color={getStateColor(submission.state)}
                                        variant="shadow"
                                        className="font-mono ml-2"
                                        size="sm"
                                    >
                                        {submission.state.replace('_', ' ').toUpperCase()}
                                    </Chip>
                                </div>
                            </CardHeader>

                            <CardBody className="space-y-4">
                                <p className="text-sm text-outer-space line-clamp-3">
                                    {submission.description}
                                </p>

                                {/* Links */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-outer-space w-16">REPO:</span>
                                        <Link
                                            href={submission.githubLink}
                                            isExternal
                                            className="text-hacker-green text-sm font-mono truncate"
                                            size="sm"
                                        >
                                            {submission.githubLink.replace('https://github.com/', '')}
                                        </Link>
                                    </div>

                                    {submission.presentationLink && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-outer-space w-16">DEMO:</span>
                                            <Link
                                                href={submission.presentationLink}
                                                isExternal
                                                className="text-fluorescent-cyan text-sm font-mono truncate"
                                                size="sm"
                                            >
                                                View Presentation
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <Divider />

                                {/* Sponsors Used */}
                                {submission.sponsorsUsed.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-hacker-green mb-2">
                                            TECH STACK
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                            {submission.sponsorsUsed.map((sponsorId) => (
                                                <Chip
                                                    key={sponsorId}
                                                    size="sm"
                                                    variant="flat"
                                                    color="secondary"
                                                >
                                                    {getSponsorName(sponsorId)}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Divider />

                                {/* Timestamps */}
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            {new Date(submission.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-outer-space">CREATED</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-fluorescent-cyan">
                                            {new Date(submission.updatedAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-outer-space">UPDATED</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        className="cyber-button"
                                        size="sm"
                                        onPress={() => openViewModal(submission)}
                                    >
                                        INSPECT
                                    </Button>

                                    <div className="flex gap-2">
                                        {submission.state === SubmissionState.DRAFT && (
                                            <Button
                                                className="cyber-button flex-1"
                                                variant="bordered"
                                                size="sm"
                                                onPress={() => handleStateChange(submission.id, SubmissionState.READY_TO_DEMO)}
                                            >
                                                READY
                                            </Button>
                                        )}

                                        {submission.state === SubmissionState.READY_TO_DEMO && (
                                            <Button
                                                className="cyber-button flex-1"
                                                variant="bordered"
                                                size="sm"
                                                onPress={() => handleStateChange(submission.id, SubmissionState.PRESENTED)}
                                            >
                                                PRESENTED
                                            </Button>
                                        )}

                                        {submission.state === SubmissionState.PRESENTED && (
                                            <Button
                                                className="cyber-button flex-1"
                                                variant="bordered"
                                                size="sm"
                                                disabled
                                            >
                                                COMPLETE
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}

                    {submissions.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-outer-space mb-4">NO SUBMISSIONS DETECTED</p>
                            <p className="text-sm text-outer-space">Teams will upload their projects here</p>
                        </div>
                    )}
                </div>

                {/* View Submission Modal */}
                <Modal
                    isOpen={isOpen}
                    onClose={onClose}
                    className="hacker-card"
                    backdrop="blur"
                    size="3xl"
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    <h2 className="text-xl font-bold terminal-text text-hacker-green">
                                        SUBMISSION ANALYSIS
                                    </h2>
                                    {selectedSubmission && (
                                        <p className="text-sm text-outer-space">
                                            {selectedSubmission.title} - {getTeamName(selectedSubmission.teamId)}
                                        </p>
                                    )}
                                </ModalHeader>
                                <ModalBody>
                                    {selectedSubmission && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">PROJECT OVERVIEW</h3>
                                                <p className="text-outer-space">{selectedSubmission.description}</p>
                                            </div>

                                            <Divider />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-hacker-green mb-3">LINKS</h3>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <p className="text-sm text-outer-space">Repository:</p>
                                                            <Link
                                                                href={selectedSubmission.githubLink}
                                                                isExternal
                                                                className="text-hacker-green font-mono"
                                                            >
                                                                {selectedSubmission.githubLink}
                                                            </Link>
                                                        </div>

                                                        {selectedSubmission.presentationLink && (
                                                            <div>
                                                                <p className="text-sm text-outer-space">Presentation:</p>
                                                                <Link
                                                                    href={selectedSubmission.presentationLink}
                                                                    isExternal
                                                                    className="text-fluorescent-cyan font-mono"
                                                                >
                                                                    {selectedSubmission.presentationLink}
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold text-hacker-green mb-3">STATUS</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-outer-space">Current State:</span>
                                                            <Chip
                                                                color={getStateColor(selectedSubmission.state)}
                                                                variant="flat"
                                                                size="sm"
                                                            >
                                                                {selectedSubmission.state.replace('_', ' ').toUpperCase()}
                                                            </Chip>
                                                        </div>

                                                        <div>
                                                            <p className="text-sm text-outer-space">Created:</p>
                                                            <p className="text-white font-mono">
                                                                {new Date(selectedSubmission.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-sm text-outer-space">Last Updated:</p>
                                                            <p className="text-white font-mono">
                                                                {new Date(selectedSubmission.updatedAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedSubmission.sponsorsUsed.length > 0 && (
                                                <>
                                                    <Divider />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-hacker-green mb-3">
                                                            TECHNOLOGIES USED
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedSubmission.sponsorsUsed.map((sponsorId) => (
                                                                <Chip
                                                                    key={sponsorId}
                                                                    variant="flat"
                                                                    color="secondary"
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
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        className="cyber-button"
                                        variant="bordered"
                                        onPress={onClose}
                                    >
                                        CLOSE
                                    </Button>
                                    {selectedSubmission && selectedSubmission.state !== SubmissionState.PRESENTED && (
                                        <Button
                                            className="cyber-button"
                                            onPress={() => {
                                                const nextState = selectedSubmission.state === SubmissionState.DRAFT
                                                    ? SubmissionState.READY_TO_DEMO
                                                    : SubmissionState.PRESENTED;
                                                handleStateChange(selectedSubmission.id, nextState);
                                                onClose();
                                            }}
                                        >
                                            {selectedSubmission.state === SubmissionState.DRAFT ? "MARK READY" : "MARK PRESENTED"}
                                        </Button>
                                    )}
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}
