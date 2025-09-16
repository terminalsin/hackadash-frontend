"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { useSponsors } from "@/hooks/useSponsors";
import { Sponsor } from "@/types";

export default function SponsorsPage({
    params,
}: {
    params: { hackathonId: string };
}) {
    const { sponsors, loading, createSponsor, updateSponsor, inviteSponsorEmployee } = useSponsors(params.hackathonId);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        logo: "",
        website: "",
    });
    const [inviteEmail, setInviteEmail] = useState("");

    const handleCreateSponsor = async () => {
        try {
            await createSponsor({
                name: formData.name,
                description: formData.description,
                logo: formData.logo || undefined,
                website: formData.website || undefined,
                hackathonId: params.hackathonId,
            });
            setFormData({ name: "", description: "", logo: "", website: "" });
            onClose();
        } catch (error) {
            console.error("Failed to create sponsor:", error);
        }
    };

    const handleUpdateSponsor = async () => {
        if (!selectedSponsor) return;

        try {
            await updateSponsor(selectedSponsor.id, {
                name: formData.name,
                description: formData.description,
                logo: formData.logo || undefined,
                website: formData.website || undefined,
            });
            setFormData({ name: "", description: "", logo: "", website: "" });
            setSelectedSponsor(null);
            onClose();
        } catch (error) {
            console.error("Failed to update sponsor:", error);
        }
    };

    const handleInviteEmployee = async () => {
        if (!selectedSponsor || !inviteEmail) return;

        try {
            await inviteSponsorEmployee(selectedSponsor.id, inviteEmail);
            setInviteEmail("");
            onInviteClose();
        } catch (error) {
            console.error("Failed to invite employee:", error);
        }
    };

    const openCreateModal = () => {
        setSelectedSponsor(null);
        setFormData({ name: "", description: "", logo: "", website: "" });
        onOpen();
    };

    const openEditModal = (sponsor: Sponsor) => {
        setSelectedSponsor(sponsor);
        setFormData({
            name: sponsor.name,
            description: sponsor.description,
            logo: sponsor.logo || "",
            website: sponsor.website || "",
        });
        onOpen();
    };

    const openInviteModal = (sponsor: Sponsor) => {
        setSelectedSponsor(sponsor);
        setInviteEmail("");
        onInviteOpen();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">CONNECTING TO SPONSORS...</span>
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
                            SPONSOR NETWORK
                        </h1>
                        <p className="text-outer-space">Manage corporate partnerships and tech providers</p>
                    </div>
                    <Button
                        className="cyber-button"
                        onPress={openCreateModal}
                    >
                        ADD SPONSOR
                    </Button>
                </div>

                {/* Sponsors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sponsors.map((sponsor) => (
                        <Card key={sponsor.id} className="hacker-card neon-border">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex items-center gap-3 flex-1">
                                        {sponsor.logo ? (
                                            <Image
                                                src={sponsor.logo}
                                                alt={sponsor.name}
                                                className="w-12 h-12 object-contain rounded"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-hacker-green rounded flex items-center justify-center">
                                                <span className="text-black font-bold text-lg">
                                                    {sponsor.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white truncate">
                                                {sponsor.name}
                                            </h3>
                                            <p className="text-sm text-fluorescent-cyan">
                                                {sponsor.employees.length} employee{sponsor.employees.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <Chip
                                        color="success"
                                        variant="shadow"
                                        className="font-mono"
                                        size="sm"
                                    >
                                        ACTIVE
                                    </Chip>
                                </div>
                            </CardHeader>

                            <CardBody className="space-y-4">
                                <p className="text-sm text-outer-space line-clamp-3">
                                    {sponsor.description}
                                </p>

                                {sponsor.website && (
                                    <div>
                                        <Link
                                            href={sponsor.website}
                                            isExternal
                                            className="text-hacker-green text-sm font-mono"
                                            size="sm"
                                        >
                                            Visit Website
                                        </Link>
                                    </div>
                                )}

                                <Divider />

                                {/* Sponsor Employees */}
                                <div>
                                    <h4 className="text-sm font-semibold text-hacker-green mb-2">
                                        REPRESENTATIVES
                                    </h4>
                                    {sponsor.employees.length > 0 ? (
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {sponsor.employees.map((employee) => (
                                                <div key={employee.id} className="flex items-center gap-2">
                                                    <Avatar
                                                        size="sm"
                                                        name={employee.name}
                                                        className="bg-fluorescent-cyan text-black"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white truncate">{employee.name}</p>
                                                        <p className="text-xs text-outer-space truncate">{employee.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-outer-space py-2 text-sm">
                                            NO REPRESENTATIVES
                                        </p>
                                    )}
                                </div>

                                <Divider />

                                {/* Sponsor Stats */}
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-lg font-bold text-fluorescent-cyan">
                                            {new Date(sponsor.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-outer-space">JOINED</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-white">
                                            {Math.floor((Date.now() - new Date(sponsor.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                                        </p>
                                        <p className="text-xs text-outer-space">DAYS ACTIVE</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        className="cyber-button"
                                        size="sm"
                                        onPress={() => openInviteModal(sponsor)}
                                    >
                                        INVITE EMPLOYEE
                                    </Button>

                                    <div className="flex gap-2">
                                        <Button
                                            className="cyber-button flex-1"
                                            variant="bordered"
                                            size="sm"
                                            onPress={() => openEditModal(sponsor)}
                                        >
                                            MODIFY
                                        </Button>
                                        <Button
                                            className="cyber-button flex-1"
                                            variant="bordered"
                                            size="sm"
                                        >
                                            PRIZES
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}

                    {sponsors.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-outer-space mb-4">NO SPONSORS CONNECTED</p>
                            <Button
                                className="cyber-button"
                                onPress={openCreateModal}
                            >
                                ADD FIRST SPONSOR
                            </Button>
                        </div>
                    )}
                </div>

                {/* Create/Edit Sponsor Modal */}
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
                                        {selectedSponsor ? "MODIFY SPONSOR" : "ADD SPONSOR"}
                                    </h2>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="space-y-4">
                                        <Input
                                            label="Company Name"
                                            placeholder="Enter company name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />

                                        <Textarea
                                            label="Company Description"
                                            placeholder="Describe the company and what they provide"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                            rows={3}
                                        />

                                        <Input
                                            label="Logo URL (Optional)"
                                            placeholder="https://example.com/logo.png"
                                            value={formData.logo}
                                            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />

                                        <Input
                                            label="Website (Optional)"
                                            placeholder="https://example.com"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
                                        onPress={selectedSponsor ? handleUpdateSponsor : handleCreateSponsor}
                                        disabled={!formData.name || !formData.description}
                                    >
                                        {selectedSponsor ? "UPDATE" : "ADD"}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                {/* Invite Employee Modal */}
                <Modal
                    isOpen={isInviteOpen}
                    onClose={onInviteClose}
                    className="hacker-card"
                    backdrop="blur"
                    size="lg"
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    <h2 className="text-xl font-bold terminal-text text-hacker-green">
                                        INVITE EMPLOYEE
                                    </h2>
                                    {selectedSponsor && (
                                        <p className="text-sm text-outer-space">
                                            Invite representative from {selectedSponsor.name}
                                        </p>
                                    )}
                                </ModalHeader>
                                <ModalBody>
                                    <Input
                                        label="Employee Email"
                                        placeholder="employee@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="font-mono"
                                        variant="bordered"
                                        type="email"
                                    />
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
                                        onPress={handleInviteEmployee}
                                        disabled={!inviteEmail}
                                    >
                                        SEND INVITE
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
