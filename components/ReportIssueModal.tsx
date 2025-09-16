"use client";

import { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { IssueCreate } from "@/types";

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    hackathonId?: number;
    onIssueCreated?: () => void;
}

export function ReportIssueModal({
    isOpen,
    onClose,
    hackathonId,
    onIssueCreated,
}: ReportIssueModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            setError("Please fill in all fields");
            return;
        }

        if (!hackathonId) {
            setError("No hackathon context available");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const issueData: IssueCreate = {
                title: title.trim(),
                description: description.trim(),
            };

            const response = await fetch(`/api/hackathons/${hackathonId}/issues`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(issueData),
            });

            if (!response.ok) {
                throw new Error("Failed to create issue");
            }

            // Reset form
            setTitle("");
            setDescription("");
            onIssueCreated?.();
            onClose();
        } catch (err) {
            setError("Failed to submit issue. Please try again.");
            console.error("Error creating issue:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setError("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            placement="center"
            className="hacker-card"
            classNames={{
                backdrop: "bg-black/50 backdrop-blur-sm",
                base: "border border-hacker-green bg-black",
                header: "border-b border-hacker-green/20",
                body: "py-6",
                footer: "border-t border-hacker-green/20",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-hacker-green terminal-text">
                        REPORT ISSUE
                    </h2>
                    <p className="text-sm text-outer-space">
                        Submit a bug report or technical issue
                    </p>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <Input
                            label="Issue Title"
                            placeholder="Brief description of the issue"
                            value={title}
                            onValueChange={setTitle}
                            variant="bordered"
                            classNames={{
                                input: "text-hacker-green",
                                inputWrapper: "border-hacker-green/30 hover:border-hacker-green/60",
                                label: "text-outer-space",
                            }}
                            isRequired
                        />
                        <Textarea
                            label="Issue Description"
                            placeholder="Provide detailed information about the issue, including steps to reproduce, expected behavior, and actual behavior..."
                            value={description}
                            onValueChange={setDescription}
                            variant="bordered"
                            minRows={4}
                            maxRows={8}
                            classNames={{
                                input: "text-hacker-green",
                                inputWrapper: "border-hacker-green/30 hover:border-hacker-green/60",
                                label: "text-outer-space",
                            }}
                            isRequired
                        />
                        {error && (
                            <div className="text-warning-red text-sm font-mono">
                                ERROR: {error}
                            </div>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="bordered"
                        onPress={handleClose}
                        className="border-outer-space text-outer-space hover:border-hacker-green hover:text-hacker-green"
                        isDisabled={isSubmitting}
                    >
                        CANCEL
                    </Button>
                    <Button
                        className="cyber-button"
                        onPress={handleSubmit}
                        isLoading={isSubmitting}
                        isDisabled={!title.trim() || !description.trim()}
                    >
                        {isSubmitting ? "SUBMITTING..." : "SUBMIT ISSUE"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
