"use client";

import { useState, useEffect, use } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { useHackathon } from "@/hooks/useHackathons";
import { useSponsors } from "@/hooks/useSponsors";
import { Sponsor } from "@/types";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SponsorSelection({
    params,
}: {
    params: Promise<{ hackathonId: string }>;
}) {
    const resolvedParams = use(params);
    const { hackathon, loading: hackathonLoading } = useHackathon(parseInt(resolvedParams.hackathonId));
    const { sponsors, loading: sponsorsLoading } = useSponsors(parseInt(resolvedParams.hackathonId));
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user } = useUser();
    const router = useRouter();

    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
    const [accessCode, setAccessCode] = useState("");
    const [userSponsors, setUserSponsors] = useState<Sponsor[]>([]);

    // Find sponsors where user is an employee
    useEffect(() => {
        if (sponsors.length > 0 && user) {
            const userEmployeeSponsors = sponsors.filter(sponsor =>
                sponsor.employees.some(emp =>
                    emp.email === user.primaryEmailAddress?.emailAddress
                )
            );
            setUserSponsors(userEmployeeSponsors);
        }
    }, [sponsors, user]);

    const handleSponsorAccess = (sponsor: Sponsor) => {
        // If user is already an employee, go directly to dashboard
        const isEmployee = sponsor.employees.some(emp =>
            emp.email === user?.primaryEmailAddress?.emailAddress
        );

        if (isEmployee) {
            router.push(`/sponsors/${resolvedParams.hackathonId}/${sponsor.id}`);
        } else {
            setSelectedSponsor(sponsor);
            setAccessCode("");
            onOpen();
        }
    };

    const handleSubmitAccess = () => {
        // In a real implementation, this would verify the access code
        // For now, we'll just redirect if the code is not empty
        if (selectedSponsor && accessCode.length >= 4) {
            router.push(`/sponsors/${resolvedParams.hackathonId}/${selectedSponsor.id}`);
        } else {
            alert("Invalid access code. Please contact your sponsor representative.");
        }
    };

    if (hackathonLoading || sponsorsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-matrix"></div>
                <span className="ml-4 terminal-text">LOADING SPONSOR ACCESS...</span>
            </div>
        );
    }

    if (!hackathon) {
        return (
            <div className="matrix-bg min-h-screen flex items-center justify-center p-6">
                <Card className="hacker-card max-w-md">
                    <CardBody className="text-center space-y-4 py-8">
                        <h1 className="text-2xl font-bold text-warning-red">HACKATHON NOT FOUND</h1>
                        <p className="text-outer-space">The requested hackathon does not exist.</p>
                        <Button
                            className="cyber-button"
                            onPress={() => router.push('/')}
                        >
                            RETURN TO HOME
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="matrix-bg min-h-screen">
                {/* Header */}
                <div className="border-b border-hacker-green bg-black/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-hacker-green terminal-text">
                                    SPONSOR ACCESS
                                </h1>
                                <p className="text-outer-space text-sm">{hackathon.title}</p>
                            </div>
                            <Button
                                className="cyber-button"
                                variant="bordered"
                                onPress={() => router.push('/')}
                            >
                                BACK TO HOME
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* User's Sponsor Companies */}
                        {userSponsors.length > 0 && (
                            <Card className="hacker-card">
                                <CardHeader>
                                    <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                        YOUR COMPANIES
                                    </h2>
                                </CardHeader>
                                <CardBody>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {userSponsors.map((sponsor) => (
                                            <Card key={sponsor.id} className="hacker-card neon-border">
                                                <CardBody className="text-center space-y-4 py-6">
                                                    {sponsor.logo && (
                                                        <Image
                                                            src={sponsor.logo}
                                                            alt={sponsor.name}
                                                            className="w-16 h-16 object-contain mx-auto rounded"
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">
                                                            {sponsor.name}
                                                        </h3>
                                                        <p className="text-sm text-outer-space line-clamp-2">
                                                            {sponsor.description}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        className="cyber-button w-full"
                                                        onPress={() => handleSponsorAccess(sponsor)}
                                                    >
                                                        ACCESS DASHBOARD
                                                    </Button>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {/* All Sponsors */}
                        <Card className="hacker-card">
                            <CardHeader>
                                <h2 className="text-xl font-bold text-hacker-green terminal-text">
                                    ALL SPONSORS
                                </h2>
                            </CardHeader>
                            <CardBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sponsors.map((sponsor) => {
                                        const isUserEmployee = sponsor.employees.some(emp =>
                                            emp.email === user?.primaryEmailAddress?.emailAddress
                                        );

                                        return (
                                            <Card key={sponsor.id} className="hacker-card neon-border">
                                                <CardHeader className="pb-2">
                                                    <div className="flex justify-between items-start w-full">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            {sponsor.logo && (
                                                                <Image
                                                                    src={sponsor.logo}
                                                                    alt={sponsor.name}
                                                                    className="w-12 h-12 object-contain rounded"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-bold text-white">
                                                                    {sponsor.name}
                                                                </h3>
                                                                <p className="text-sm text-fluorescent-cyan">
                                                                    {sponsor.employees.length} representative{sponsor.employees.length !== 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isUserEmployee && (
                                                            <Chip
                                                                color="success"
                                                                variant="shadow"
                                                                className="font-mono"
                                                                size="sm"
                                                            >
                                                                EMPLOYEE
                                                            </Chip>
                                                        )}
                                                    </div>
                                                </CardHeader>

                                                <CardBody className="space-y-4">
                                                    <p className="text-sm text-outer-space line-clamp-3">
                                                        {sponsor.description}
                                                    </p>

                                                    {sponsor.website && (
                                                        <div className="text-center">
                                                            <a
                                                                href={sponsor.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-hacker-green text-sm font-mono hover:text-fluorescent-cyan transition-colors"
                                                            >
                                                                Visit Website
                                                            </a>
                                                        </div>
                                                    )}

                                                    <Button
                                                        className="w-full cyber-button"
                                                        variant={isUserEmployee ? "solid" : "bordered"}
                                                        onPress={() => handleSponsorAccess(sponsor)}
                                                    >
                                                        {isUserEmployee ? "ACCESS DASHBOARD" : "REQUEST ACCESS"}
                                                    </Button>
                                                </CardBody>
                                            </Card>
                                        );
                                    })}

                                    {sponsors.length === 0 && (
                                        <div className="col-span-full text-center py-12">
                                            <p className="text-outer-space text-lg mb-2">NO SPONSORS AVAILABLE</p>
                                            <p className="text-sm text-outer-space">
                                                Sponsors will appear here once they join the hackathon
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Access Code Modal */}
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
                                                SPONSOR ACCESS REQUEST
                                            </h2>
                                            {selectedSponsor && (
                                                <p className="text-sm text-outer-space">
                                                    Requesting access to {selectedSponsor.name} dashboard
                                                </p>
                                            )}
                                        </ModalHeader>
                                        <ModalBody>
                                            <div className="space-y-4">
                                                <p className="text-outer-space">
                                                    Enter the access code provided by your sponsor representative to access the dashboard.
                                                </p>
                                                <Input
                                                    label="Access Code"
                                                    placeholder="Enter sponsor access code"
                                                    value={accessCode}
                                                    onChange={(e) => setAccessCode(e.target.value)}
                                                    className="font-mono"
                                                    variant="bordered"
                                                    size="lg"
                                                />
                                                <div className="text-xs text-outer-space space-y-1">
                                                    <p>• Contact your sponsor representative for the access code</p>
                                                    <p>• Access codes are unique per sponsor and hackathon</p>
                                                    <p>• Once verified, you'll have full dashboard access</p>
                                                </div>
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
                                                onPress={handleSubmitAccess}
                                                disabled={accessCode.length < 4}
                                            >
                                                REQUEST ACCESS
                                            </Button>
                                        </ModalFooter>
                                    </>
                                )}
                            </ModalContent>
                        </Modal>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
