"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { useTeams } from "@/hooks/useTeams";
import { Team } from "@/types";

export default function TeamsPage({
    params,
}: {
    params: { hackathonId: string };
}) {
    const { teams, loading, createTeam, updateTeam } = useTeams(params.hackathonId);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const handleCreateTeam = async () => {
        try {
            await createTeam({
                name: formData.name,
                description: formData.description,
                members: [],
                hackathonId: params.hackathonId,
            });
            setFormData({ name: "", description: "" });
            onClose();
        } catch (error) {
            console.error("Failed to create team:", error);
        }
    };

    const handleUpdateTeam = async () => {
        if (!selectedTeam) return;

        try {
            await updateTeam(selectedTeam.id, {
                name: formData.name,
                description: formData.description,
            });
            setFormData({ name: "", description: "" });
            setSelectedTeam(null);
            onClose();
        } catch (error) {
            console.error("Failed to update team:", error);
        }
    };

    const openCreateModal = () => {
        setSelectedTeam(null);
        setFormData({ name: "", description: "" });
        onOpen();
    };

    const openEditModal = (team: Team) => {
        setSelectedTeam(team);
        setFormData({
            name: team.name,
            description: team.description,
        });
        onOpen();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">SCANNING TEAMS...</span>
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
                            TEAM OPERATIONS
                        </h1>
                        <p className="text-outer-space">Coordinate digital warfare squads</p>
                    </div>
                    <Button
                        className="cyber-button"
                        onPress={openCreateModal}
                    >
                        FORM NEW TEAM
                    </Button>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <Card key={team.id} className="hacker-card neon-border">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white">
                                            {team.name}
                                        </h3>
                                        <p className="text-sm text-outer-space">
                                            {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <Chip
                                        color={team.members.length > 0 ? "success" : "warning"}
                                        variant="shadow"
                                        className="font-mono"
                                        size="sm"
                                    >
                                        {team.members.length > 0 ? "ACTIVE" : "RECRUITING"}
                                    </Chip>
                                </div>
                            </CardHeader>

                            <CardBody className="space-y-4">
                                <p className="text-sm text-outer-space">
                                    {team.description}
                                </p>

                                <Divider />

                                {/* Team Members */}
                                <div>
                                    <h4 className="text-sm font-semibold text-hacker-green mb-2">
                                        SQUAD MEMBERS
                                    </h4>
                                    {team.members.length > 0 ? (
                                        <div className="space-y-2">
                                            {team.members.map((member) => (
                                                <div key={member.id} className="flex items-center gap-2">
                                                    <Avatar
                                                        size="sm"
                                                        name={member.name}
                                                        className="bg-hacker-green text-black"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white truncate">{member.name}</p>
                                                        <p className="text-xs text-outer-space truncate">{member.email}</p>
                                                    </div>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color={
                                                            member.role === "organiser" ? "primary" :
                                                                member.role === "sponsor" ? "secondary" : "default"
                                                        }
                                                    >
                                                        {member.role.toUpperCase()}
                                                    </Chip>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-outer-space py-4 text-sm">
                                            NO MEMBERS RECRUITED
                                        </p>
                                    )}
                                </div>

                                <Divider />

                                {/* Team Stats */}
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-lg font-bold text-fluorescent-cyan">
                                            {new Date(team.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-outer-space">FORMED</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-white">
                                            {Math.floor((Date.now() - new Date(team.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                                        </p>
                                        <p className="text-xs text-outer-space">DAYS ACTIVE</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        className="cyber-button flex-1"
                                        variant="bordered"
                                        size="sm"
                                        onPress={() => openEditModal(team)}
                                    >
                                        MODIFY
                                    </Button>
                                    <Button
                                        className="cyber-button flex-1"
                                        variant="bordered"
                                        size="sm"
                                    >
                                        INVITE
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}

                    {teams.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-outer-space mb-4">NO TEAMS ASSEMBLED</p>
                            <Button
                                className="cyber-button"
                                onPress={openCreateModal}
                            >
                                FORM FIRST TEAM
                            </Button>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                <Modal
                    isOpen={isOpen}
                    onClose={onClose}
                    className="hacker-card"
                    backdrop="blur"
                    size="lg"
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    <h2 className="text-xl font-bold terminal-text text-hacker-green">
                                        {selectedTeam ? "MODIFY TEAM" : "FORM NEW TEAM"}
                                    </h2>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="space-y-4">
                                        <Input
                                            label="Team Name"
                                            placeholder="Enter team name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />

                                        <Textarea
                                            label="Team Description"
                                            placeholder="Describe your team's mission"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                            rows={4}
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
                                        onPress={selectedTeam ? handleUpdateTeam : handleCreateTeam}
                                        disabled={!formData.name || !formData.description}
                                    >
                                        {selectedTeam ? "UPDATE" : "CREATE"}
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

