"use client";

import { useState, use } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { useTeams } from "@/hooks/useTeams";
import { useRouter } from "next/navigation";
import { Team, UserRole } from "@/types";
import { useUser } from "@clerk/nextjs";

export default function TeamsPage({
    params,
}: {
    params: Promise<{ hackathonId: string }>;
}) {
    const resolvedParams = use(params);
    const { teams, loading, createTeam, updateTeam, joinTeam } = useTeams(parseInt(resolvedParams.hackathonId));
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isJoinOpen, onOpen: onJoinOpen, onClose: onJoinClose } = useDisclosure();
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [joinCode, setJoinCode] = useState("");
    const router = useRouter();
    const { user } = useUser();

    // Check if user is already in a team
    const userTeam = teams.find(team =>
        team.members.some(member =>
            member.email === user?.primaryEmailAddress?.emailAddress
        )
    );
    const isUserInTeam = !!userTeam;

    const handleCreateTeam = async () => {
        if (!user) return;

        try {
            const newTeam = await createTeam({
                name: formData.name,
                description: formData.description,
            });

            // TODO: Add the user to the team after creation
            // This would require a separate API call to add members
            setFormData({ name: "", description: "" });
            onClose();
            // Redirect to team details after creating
            router.push(`/${resolvedParams.hackathonId}/team-details`);
        } catch (error) {
            console.error("Failed to create team:", error);
        }
    };

    const handleJoinTeam = (team: Team) => {
        setSelectedTeam(team);
        setJoinCode("");
        onJoinOpen();
    };

    const handleSubmitJoin = async () => {
        if (selectedTeam && user) {
            try {
                // Use the real API to join the team
                await joinTeam(selectedTeam.id, {
                    join_code: joinCode || undefined
                });

                onJoinClose();
                router.push(`/${resolvedParams.hackathonId}/team-details`);
            } catch (error) {
                console.error("Failed to join team:", error);
                // You could add error handling UI here, like showing a toast notification
            }
        }
    };

    const openCreateModal = () => {
        setFormData({ name: "", description: "" });
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
                            TEAM SELECTION
                        </h1>
                        {isUserInTeam ? (
                            <p className="text-fluorescent-cyan">You are already in team: {userTeam?.name}</p>
                        ) : (
                            <p className="text-outer-space">Join an existing team or form your own squad</p>
                        )}
                    </div>
                    {!isUserInTeam && (
                        <Button
                            className="cyber-button"
                            onPress={openCreateModal}
                        >
                            CREATE TEAM
                        </Button>
                    )}
                    {isUserInTeam && (
                        <Button
                            className="cyber-button"
                            onPress={() => router.push(`/${resolvedParams.hackathonId}/team-details`)}
                        >
                            VIEW MY TEAM
                        </Button>
                    )}
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
                                            {team.members.length}/4 members
                                        </p>
                                    </div>
                                    <Chip
                                        color={team.members.length < 4 ? "success" : "warning"}
                                        variant="shadow"
                                        className="font-mono"
                                        size="sm"
                                    >
                                        {team.members.length < 4 ? "RECRUITING" : "FULL"}
                                    </Chip>
                                </div>
                            </CardHeader>

                            <CardBody className="space-y-4">
                                <p className="text-sm text-outer-space line-clamp-2">
                                    {team.description}
                                </p>

                                <Divider />

                                {/* Team Members */}
                                <div>
                                    <h4 className="text-sm font-semibold text-hacker-green mb-2">
                                        CURRENT MEMBERS
                                    </h4>
                                    {team.members.length > 0 ? (
                                        <div className="space-y-1 max-h-24 overflow-y-auto">
                                            {team.members.map((member) => (
                                                <div key={member.id} className="flex items-center gap-2">
                                                    <Avatar
                                                        size="sm"
                                                        name={member.name}
                                                        className="bg-hacker-green text-black"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-white truncate">{member.name}</p>
                                                    </div>
                                                    {member.role === UserRole.GUEST && (
                                                        <Chip size="sm" variant="flat" color="primary">
                                                            LEADER
                                                        </Chip>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-outer-space py-2 text-xs">
                                            NO MEMBERS YET
                                        </p>
                                    )}
                                </div>

                                <Divider />

                                {/* Team Stats */}
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-sm font-bold text-fluorescent-cyan">
                                            {new Date(team.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-outer-space">FORMED</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            {team.members.length}
                                        </p>
                                        <p className="text-xs text-outer-space">MEMBERS</p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full cyber-button"
                                    variant={team.members.length < 4 && !isUserInTeam ? "solid" : "bordered"}
                                    disabled={team.members.length >= 4 || isUserInTeam}
                                    onPress={() => handleJoinTeam(team)}
                                >
                                    {isUserInTeam ? "ALREADY IN TEAM" :
                                        team.members.length < 4 ? "JOIN TEAM" : "TEAM FULL"}
                                </Button>
                            </CardBody>
                        </Card>
                    ))}

                    {teams.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-outer-space text-lg mb-4">NO TEAMS AVAILABLE</p>
                            <p className="text-sm text-outer-space mb-4">Be the first to create a team!</p>
                            <Button
                                className="cyber-button"
                                onPress={openCreateModal}
                            >
                                CREATE FIRST TEAM
                            </Button>
                        </div>
                    )}
                </div>

                {/* Create Team Modal */}
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
                                        CREATE NEW TEAM
                                    </h2>
                                    <p className="text-sm text-outer-space">
                                        Form your squad for the hackathon
                                    </p>
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
                                            placeholder="Describe your team's mission and skills"
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
                                        onPress={handleCreateTeam}
                                        disabled={!formData.name || !formData.description}
                                    >
                                        CREATE TEAM
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                {/* Join Team Modal */}
                <Modal
                    isOpen={isJoinOpen}
                    onClose={onJoinClose}
                    className="hacker-card"
                    backdrop="blur"
                    size="lg"
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    <h2 className="text-xl font-bold terminal-text text-hacker-green">
                                        JOIN TEAM
                                    </h2>
                                    {selectedTeam && (
                                        <p className="text-sm text-outer-space">
                                            Request to join {selectedTeam.name}
                                        </p>
                                    )}
                                </ModalHeader>
                                <ModalBody>
                                    <div className="space-y-4">
                                        <p className="text-outer-space">
                                            Enter the team's join code or send a request to join.
                                        </p>
                                        <Input
                                            label="Join Code (Optional)"
                                            placeholder="Enter team join code"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value)}
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
                                        onPress={handleSubmitJoin}
                                    >
                                        JOIN TEAM
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
