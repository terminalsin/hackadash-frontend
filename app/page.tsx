"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { useHackathons } from "@/hooks/useHackathons";
import { useRouter } from "next/navigation";

export default function Home() {
  const { hackathons, loading } = useHackathons();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedHackathon, setSelectedHackathon] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState("");
  const router = useRouter();

  const handleJoinHackathon = (hackathonId: string) => {
    setSelectedHackathon(hackathonId);
    setPinCode("");
    onOpen();
  };

  const handleSubmitPin = () => {
    const hackathon = hackathons.find(h => h.id === selectedHackathon);
    if (hackathon && hackathon.pinCode === pinCode) {
      router.push(`/${selectedHackathon}/teams`);
    } else {
      alert("Invalid PIN code. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="matrix-bg min-h-screen flex items-center justify-center">
        <Card className="hacker-card neon-border max-w-md">
          <CardBody className="text-center space-y-6 py-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold terminal-text glitch text-hacker-green" data-text="HACKADASH">
                HACKADASH
              </h1>
              <p className="text-fluorescent-cyan">ELITE HACKATHON COMMAND CENTER</p>
              <div className="loading-matrix mx-auto"></div>
              <p className="text-outer-space text-sm">SCANNING FOR HACKATHONS...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="matrix-bg min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold terminal-text glitch text-hacker-green mb-4" data-text="HACKADASH">
            HACKADASH
          </h1>
          <p className="text-fluorescent-cyan text-xl mb-2">ELITE HACKATHON COMMAND CENTER</p>
          <p className="text-outer-space">Select a hackathon to join the digital warfare</p>
        </div>

        {/* Hackathons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <Card key={hackathon.id} className="hacker-card neon-border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start w-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {hackathon.title}
                    </h3>
                    <p className="text-sm text-fluorescent-cyan">
                      {hackathon.location}
                    </p>
                  </div>
                  <Chip
                    color={hackathon.isStarted ? "success" : "warning"}
                    variant="shadow"
                    className="font-mono"
                    size="sm"
                  >
                    {hackathon.isStarted ? "LIVE" : "UPCOMING"}
                  </Chip>
                </div>
              </CardHeader>

              <CardBody className="space-y-4">
                {hackathon.image && (
                  <Image
                    src={hackathon.image}
                    alt={hackathon.title}
                    className="w-full h-32 object-cover rounded"
                  />
                )}

                <p className="text-sm text-outer-space line-clamp-3">
                  {hackathon.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-outer-space">START:</span>
                    <span className="text-white font-mono">
                      {new Date(hackathon.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-outer-space">END:</span>
                    <span className="text-white font-mono">
                      {new Date(hackathon.endTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-fluorescent-cyan">
                      {hackathon.teams.length}
                    </p>
                    <p className="text-xs text-outer-space">TEAMS</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {hackathon.sponsors.length}
                    </p>
                    <p className="text-xs text-outer-space">SPONSORS</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-hacker-green">
                      {hackathon.prizes.length}
                    </p>
                    <p className="text-xs text-outer-space">PRIZES</p>
                  </div>
                </div>

                <Button
                  className="w-full cyber-button"
                  onPress={() => handleJoinHackathon(hackathon.id)}
                  disabled={!hackathon.isStarted}
                >
                  {hackathon.isStarted ? "JOIN HACKATHON" : "NOT STARTED"}
                </Button>
              </CardBody>
            </Card>
          ))}

          {hackathons.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-outer-space text-lg mb-4">NO HACKATHONS AVAILABLE</p>
              <p className="text-sm text-outer-space">Check back later for upcoming events</p>
            </div>
          )}
        </div>

        {/* Join Modal */}
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
                    ENTER ACCESS CODE
                  </h2>
                  <p className="text-sm text-outer-space">
                    Enter the 4-digit PIN to join the hackathon
                  </p>
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="PIN Code"
                    placeholder="Enter 4-digit code"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="font-mono"
                    variant="bordered"
                    maxLength={4}
                    size="lg"
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
                    onPress={handleSubmitPin}
                    disabled={pinCode.length !== 4}
                  >
                    JOIN
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
