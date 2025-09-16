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
import { usePrizes } from "@/hooks/usePrizes";
import { useSponsors } from "@/hooks/useSponsors";
import { Prize } from "@/types";

export default function PrizesPage({
    params,
}: {
    params: { hackathonId: string };
}) {
    const { prizes, loading, createPrize, updatePrize, deletePrize } = usePrizes(params.hackathonId);
    const { sponsors } = useSponsors(params.hackathonId);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        value: "",
        sponsorId: "",
    });

    const handleCreatePrize = async () => {
        try {
            await createPrize({
                title: formData.title,
                description: formData.description,
                value: formData.value,
                sponsorId: formData.sponsorId || undefined,
                hackathonId: params.hackathonId,
            });
            setFormData({ title: "", description: "", value: "", sponsorId: "" });
            onClose();
        } catch (error) {
            console.error("Failed to create prize:", error);
        }
    };

    const handleUpdatePrize = async () => {
        if (!selectedPrize) return;

        try {
            await updatePrize(selectedPrize.id, {
                title: formData.title,
                description: formData.description,
                value: formData.value,
                sponsorId: formData.sponsorId || undefined,
            });
            setFormData({ title: "", description: "", value: "", sponsorId: "" });
            setSelectedPrize(null);
            onClose();
        } catch (error) {
            console.error("Failed to update prize:", error);
        }
    };

    const handleDeletePrize = async (prizeId: string) => {
        try {
            await deletePrize(prizeId);
        } catch (error) {
            console.error("Failed to delete prize:", error);
        }
    };

    const openCreateModal = () => {
        setSelectedPrize(null);
        setFormData({ title: "", description: "", value: "", sponsorId: "" });
        onOpen();
    };

    const openEditModal = (prize: Prize) => {
        setSelectedPrize(prize);
        setFormData({
            title: prize.title,
            description: prize.description,
            value: prize.value,
            sponsorId: prize.sponsorId || "",
        });
        onOpen();
    };

    const getSponsorName = (sponsorId?: string) => {
        if (!sponsorId) return "General Prize";
        const sponsor = sponsors.find(s => s.id === sponsorId);
        return sponsor?.name || "Unknown Sponsor";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">LOADING PRIZE POOL...</span>
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
                            PRIZE DISTRIBUTION
                        </h1>
                        <p className="text-outer-space">Manage rewards and recognition</p>
                    </div>
                    <Button
                        className="cyber-button"
                        onPress={openCreateModal}
                    >
                        ADD PRIZE
                    </Button>
                </div>

                {/* Prizes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prizes.map((prize) => (
                        <Card key={prize.id} className="hacker-card neon-border">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white">
                                            {prize.title}
                                        </h3>
                                        <p className="text-sm text-fluorescent-cyan">
                                            {getSponsorName(prize.sponsorId)}
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

                                {/* Prize Details */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-outer-space">VALUE:</span>
                                        <span className="text-hacker-green font-mono font-bold">
                                            {prize.value}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-outer-space">SPONSOR:</span>
                                        <span className="text-fluorescent-cyan">
                                            {getSponsorName(prize.sponsorId)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-outer-space">CREATED:</span>
                                        <span className="text-white">
                                            {new Date(prize.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <Divider />

                                <div className="flex gap-2">
                                    <Button
                                        className="cyber-button flex-1"
                                        variant="bordered"
                                        size="sm"
                                        onPress={() => openEditModal(prize)}
                                    >
                                        MODIFY
                                    </Button>
                                    <Button
                                        className="cyber-button flex-1"
                                        variant="bordered"
                                        size="sm"
                                        onPress={() => handleDeletePrize(prize.id)}
                                    >
                                        DELETE
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}

                    {prizes.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-outer-space mb-4">NO PRIZES CONFIGURED</p>
                            <Button
                                className="cyber-button"
                                onPress={openCreateModal}
                            >
                                CREATE FIRST PRIZE
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
                    size="2xl"
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    <h2 className="text-xl font-bold terminal-text text-hacker-green">
                                        {selectedPrize ? "MODIFY PRIZE" : "CREATE PRIZE"}
                                    </h2>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="space-y-4">
                                        <Input
                                            label="Prize Title"
                                            placeholder="Best Overall Project"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />

                                        <Textarea
                                            label="Prize Description"
                                            placeholder="Describe what this prize recognizes"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                            rows={3}
                                        />

                                        <Input
                                            label="Prize Value"
                                            placeholder="$5000, MacBook Pro, etc."
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        />

                                        <Select
                                            label="Sponsor (Optional)"
                                            placeholder="Select a sponsor"
                                            value={formData.sponsorId}
                                            onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}
                                            className="font-mono"
                                            variant="bordered"
                                        >
                                            <SelectItem key="" value="">
                                                General Prize (No Sponsor)
                                            </SelectItem>
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
                                        onPress={selectedPrize ? handleUpdatePrize : handleCreatePrize}
                                        disabled={!formData.title || !formData.description || !formData.value}
                                    >
                                        {selectedPrize ? "UPDATE" : "CREATE"}
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
