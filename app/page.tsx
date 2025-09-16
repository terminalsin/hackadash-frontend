"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { useHackathons } from "@/hooks/useHackathons";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { HackathonCreate } from "@/types";
import { useClerkIntegration } from "@/hooks/useClerkIntegration";
import { ClerkUserExample } from "@/components/ClerkUserExample";

export default function Home() {
  const { hackathons, loading, createHackathon } = useHackathons();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

  // Initialize Clerk integration to sync user data with mock API
  useClerkIntegration();
  const [selectedHackathon, setSelectedHackathon] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [hackathonForm, setHackathonForm] = useState<HackathonCreate>({
    title: "",
    description: "",
    image: "",
    location: "",
    start_time: "",
    end_time: "",
  });
  const router = useRouter();

  const handleJoinHackathon = (hackathonId: string) => {
    setSelectedHackathon(hackathonId);
    setPinCode("");
    onOpen();
  };

  const handleSubmitPin = () => {
    const hackathon = hackathons.find(h => h.id.toString() === selectedHackathon);
    if (hackathon && hackathon.pin_code === pinCode) {
      router.push(`/${selectedHackathon}/teams`);
    } else {
      alert("Invalid PIN code. Please try again.");
    }
  };

  const handleCreateHackathon = async () => {
    if (!hackathonForm.title || !hackathonForm.description || !hackathonForm.location ||
      !hackathonForm.start_time || !hackathonForm.end_time) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setCreateLoading(true);
      const newHackathon = await createHackathon(hackathonForm);
      onCreateClose();
      setHackathonForm({
        title: "",
        description: "",
        image: "",
        location: "",
        start_time: "",
        end_time: "",
      });
      alert(`Hackathon "${newHackathon.title}" created successfully! PIN: ${newHackathon.pin_code}`);
    } catch (error) {
      alert("Failed to create hackathon. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFormChange = (field: keyof HackathonCreate, value: string) => {
    setHackathonForm(prev => ({ ...prev, [field]: value }));
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
          <SignedIn>
            <p className="text-outer-space mb-4">Select a hackathon to join the digital warfare</p>
            <Button
              className="cyber-button mb-4"
              onPress={onCreateOpen}
              size="lg"
            >
              CREATE HACKATHON
            </Button>
          </SignedIn>
          <SignedOut>
            <p className="text-outer-space">Sign in to access hackathons and join the digital warfare</p>
          </SignedOut>
        </div>

        {/* Authentication-based content */}
        <SignedIn>
          {/* Clerk Integration Demo */}


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
                      color={hackathon.is_started ? "success" : "warning"}
                      variant="shadow"
                      className="font-mono"
                      size="sm"
                    >
                      {hackathon.is_started ? "LIVE" : "UPCOMING"}
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
                        {new Date(hackathon.start_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-outer-space">END:</span>
                      <span className="text-white font-mono">
                        {new Date(hackathon.end_time).toLocaleDateString()}
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

                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full cyber-button"
                      onPress={() => handleJoinHackathon(hackathon.id.toString())}
                      disabled={!hackathon.is_started}
                    >
                      {hackathon.is_started ? "JOIN HACKATHON" : "NOT STARTED"}
                    </Button>

                    <Button
                      className="w-full cyber-button"
                      variant="bordered"
                      size="sm"
                      onPress={() => router.push(`/sponsors/${hackathon.id}`)}
                    >
                      SPONSOR ACCESS
                    </Button>
                  </div>
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
        </SignedIn>

        <SignedOut>
          {/* Sign-in prompt */}
          <div className="flex justify-center">
            <Card className="hacker-card neon-border max-w-2xl">
              <CardBody className="text-center space-y-6 py-12">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold terminal-text text-hacker-green">
                    ACCESS RESTRICTED
                  </h2>
                  <p className="text-fluorescent-cyan text-lg">
                    Authentication required to access hackathon data
                  </p>
                  <p className="text-outer-space">
                    Sign in to view available hackathons, join teams, and participate in digital warfare competitions.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <SignInButton mode="modal">
                    <Button className="cyber-button" size="lg">
                      SIGN IN
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="cyber-button" variant="bordered" size="lg">
                      CREATE ACCOUNT
                    </Button>
                  </SignUpButton>
                </div>

                <div className="text-xs text-outer-space space-y-1">
                  <p>🔒 Secure authentication powered by Clerk</p>
                  <p>⚡ Quick setup with Google, GitHub, or email</p>
                  <p>🛡️ Your data is protected and encrypted</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </SignedOut>

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

        {/* Create Hackathon Modal */}
        <Modal
          isOpen={isCreateOpen}
          onClose={onCreateClose}
          className="hacker-card"
          backdrop="blur"
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold terminal-text text-hacker-green">
                    CREATE NEW HACKATHON
                  </h2>
                  <p className="text-sm text-outer-space">
                    Set up a new hackathon event for digital warriors
                  </p>
                </ModalHeader>
                <ModalBody className="space-y-4">
                  <Input
                    label="Hackathon Title"
                    placeholder="Enter hackathon name"
                    value={hackathonForm.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    variant="bordered"
                    isRequired
                  />

                  <Textarea
                    label="Description"
                    placeholder="Describe your hackathon..."
                    value={hackathonForm.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    variant="bordered"
                    minRows={3}
                    isRequired
                  />

                  <Input
                    label="Location"
                    placeholder="Enter location (e.g., San Francisco, CA or Virtual)"
                    value={hackathonForm.location}
                    onChange={(e) => handleFormChange("location", e.target.value)}
                    variant="bordered"
                    isRequired
                  />

                  <Input
                    label="Image URL (Optional)"
                    placeholder="https://example.com/image.jpg"
                    value={hackathonForm.image}
                    onChange={(e) => handleFormChange("image", e.target.value)}
                    variant="bordered"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Start Date & Time"
                      type="datetime-local"
                      value={hackathonForm.start_time}
                      onChange={(e) => handleFormChange("start_time", e.target.value)}
                      variant="bordered"
                      isRequired
                    />

                    <Input
                      label="End Date & Time"
                      type="datetime-local"
                      value={hackathonForm.end_time}
                      onChange={(e) => handleFormChange("end_time", e.target.value)}
                      variant="bordered"
                      isRequired
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    className="cyber-button"
                    variant="bordered"
                    onPress={onClose}
                    disabled={createLoading}
                  >
                    CANCEL
                  </Button>
                  <Button
                    className="cyber-button"
                    onPress={handleCreateHackathon}
                    isLoading={createLoading}
                    disabled={!hackathonForm.title || !hackathonForm.description ||
                      !hackathonForm.location || !hackathonForm.start_time ||
                      !hackathonForm.end_time}
                  >
                    CREATE HACKATHON
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
