"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { useIssues } from "@/hooks/useIssues";
import { Issue } from "@/types";

export default function IssuesPage({
    params,
}: {
    params: { hackathonId: string };
}) {
    const { issues, loading, createIssue, updateIssueStatus } = useIssues(parseInt(params.hackathonId));
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        reportedBy: "admin",
    });

    const handleCreateIssue = async () => {
        try {
            await createIssue({
                title: formData.title,
                description: formData.description,
            });
            setFormData({ title: "", description: "", reportedBy: "admin" });
            onClose();
        } catch (error) {
            console.error("Failed to create issue:", error);
        }
    };

    const handleStatusChange = async (issueId: number, newStatus: Issue["status"]) => {
        try {
            await updateIssueStatus(issueId, newStatus);
        } catch (error) {
            console.error("Failed to update issue status:", error);
        }
    };

    const openCreateModal = () => {
        setSelectedIssue(null);
        setFormData({ title: "", description: "", reportedBy: "admin" });
        onOpen();
    };

    const openViewModal = (issue: Issue) => {
        setSelectedIssue(issue);
        onOpen();
    };

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

    const getStatusIcon = (status: Issue["status"]) => {
        switch (status) {
            case "open":
                return "🔴";
            case "in_progress":
                return "🟡";
            case "resolved":
                return "🟢";
            default:
                return "⚫";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">SCANNING FOR ISSUES...</span>
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
                            ISSUE TRACKER
                        </h1>
                        <p className="text-outer-space">Monitor and resolve system anomalies</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="hidden sm:flex gap-2">
                            <Chip variant="flat" color="danger" size="sm">
                                OPEN: {issues.filter(i => i.status === "open").length}
                            </Chip>
                            <Chip variant="flat" color="warning" size="sm">
                                IN PROGRESS: {issues.filter(i => i.status === "in_progress").length}
                            </Chip>
                            <Chip variant="flat" color="success" size="sm">
                                RESOLVED: {issues.filter(i => i.status === "resolved").length}
                            </Chip>
                        </div>
                        <Button
                            className="cyber-button"
                            onPress={openCreateModal}
                        >
                            REPORT ISSUE
                        </Button>
                    </div>
                </div>

                {/* Issues List */}
                <div className="space-y-4">
                    {issues.map((issue) => (
                        <Card key={issue.id} className="hacker-card">
                            <CardBody>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{getStatusIcon(issue.status)}</span>
                                            <h3 className="text-lg font-bold text-white">
                                                {issue.title}
                                            </h3>
                                            <Chip
                                                color={getStatusColor(issue.status)}
                                                variant="flat"
                                                size="sm"
                                                className="font-mono"
                                            >
                                                {issue.status.replace('_', ' ').toUpperCase()}
                                            </Chip>
                                        </div>

                                        <p className="text-outer-space">
                                            {issue.description}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-fluorescent-cyan">
                                                Reported by: {issue.reporter_user_id}
                                            </span>
                                            <span className="text-outer-space">
                                                {new Date(issue.created_at).toLocaleString()}
                                            </span>
                                            {issue.updated_at !== issue.created_at && (
                                                <span className="text-outer-space">
                                                    Updated: {new Date(issue.updated_at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            className="cyber-button"
                                            size="sm"
                                            onPress={() => openViewModal(issue)}
                                        >
                                            VIEW
                                        </Button>

                                        {issue.status === "open" && (
                                            <Button
                                                className="cyber-button"
                                                variant="bordered"
                                                size="sm"
                                                onPress={() => handleStatusChange(issue.id, "in_progress")}
                                            >
                                                START
                                            </Button>
                                        )}

                                        {issue.status === "in_progress" && (
                                            <Button
                                                className="cyber-button"
                                                variant="bordered"
                                                size="sm"
                                                onPress={() => handleStatusChange(issue.id, "resolved")}
                                            >
                                                RESOLVE
                                            </Button>
                                        )}

                                        {issue.status === "resolved" && (
                                            <Button
                                                className="cyber-button"
                                                variant="bordered"
                                                size="sm"
                                                onPress={() => handleStatusChange(issue.id, "open")}
                                            >
                                                REOPEN
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}

                    {issues.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-hacker-green text-lg mb-2">🟢 ALL SYSTEMS OPERATIONAL</p>
                            <p className="text-outer-space">No issues detected</p>
                        </div>
                    )}
                </div>

                {/* Create Issue Modal */}
                <Modal
                    isOpen={isOpen && !selectedIssue}
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
                                        REPORT SYSTEM ISSUE
                                    </h2>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="space-y-4">
                                        <Input
                                            label="Issue Title"
                                            placeholder="Brief description of the problem"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />

                                        <Textarea
                                            label="Detailed Description"
                                            placeholder="Provide detailed information about the issue"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                            rows={4}
                                        />

                                        <Input
                                            label="Reported By"
                                            placeholder="Your name or ID"
                                            value={formData.reportedBy}
                                            onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
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
                                        onPress={handleCreateIssue}
                                        disabled={!formData.title || !formData.description || !formData.reportedBy}
                                    >
                                        REPORT
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                {/* View Issue Modal */}
                <Modal
                    isOpen={isOpen && !!selectedIssue}
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
                                        ISSUE ANALYSIS
                                    </h2>
                                    {selectedIssue && (
                                        <div className="flex items-center gap-2">
                                            <span>{getStatusIcon(selectedIssue.status)}</span>
                                            <p className="text-sm text-outer-space">
                                                {selectedIssue.title}
                                            </p>
                                        </div>
                                    )}
                                </ModalHeader>
                                <ModalBody>
                                    {selectedIssue && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">ISSUE DETAILS</h3>
                                                <p className="text-outer-space">{selectedIssue.description}</p>
                                            </div>

                                            <Divider />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-hacker-green mb-3">STATUS</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-outer-space">Current Status:</span>
                                                            <Chip
                                                                color={getStatusColor(selectedIssue.status)}
                                                                variant="flat"
                                                                size="sm"
                                                            >
                                                                {selectedIssue.status.replace('_', ' ').toUpperCase()}
                                                            </Chip>
                                                        </div>

                                                        <div>
                                                            <p className="text-sm text-outer-space">Reported By:</p>
                                                            <p className="text-white font-mono">{selectedIssue.reporter_user_id}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold text-hacker-green mb-3">TIMELINE</h3>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <p className="text-sm text-outer-space">Created:</p>
                                                            <p className="text-white font-mono">
                                                                {new Date(selectedIssue.created_at).toLocaleString()}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-sm text-outer-space">Last Updated:</p>
                                                            <p className="text-white font-mono">
                                                                {new Date(selectedIssue.updated_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
                                    {selectedIssue && selectedIssue.status !== "resolved" && (
                                        <Button
                                            className="cyber-button"
                                            onPress={() => {
                                                const nextStatus = selectedIssue.status === "open" ? "in_progress" : "resolved";
                                                handleStatusChange(selectedIssue.id, nextStatus);
                                                onClose();
                                            }}
                                        >
                                            {selectedIssue.status === "open" ? "START WORK" : "MARK RESOLVED"}
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
