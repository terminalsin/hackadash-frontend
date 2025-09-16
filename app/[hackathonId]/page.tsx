"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useTeams } from "@/hooks/useTeams";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function HackathonPage({
    params,
}: {
    params: Promise<{ hackathonId: string }>;
}) {
    const { hackathonId } = use(params);
    const { teams, loading } = useTeams(parseInt(hackathonId));
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Check if user is in a team
            const userTeam = teams.find(team =>
                team.members.some(member =>
                    member.email === user.primaryEmailAddress?.emailAddress
                    || member.id === user.id
                )
            );

            if (userTeam) {
                router.replace(`/${hackathonId}/team-details`);
            } else {
                router.replace(`/${hackathonId}/teams`);
            }
        }
    }, [loading, teams, user, hackathonId, router]);

    // Show loading while redirecting
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="loading-matrix"></div>
            <span className="ml-4 terminal-text">INITIALIZING...</span>
        </div>
    );
}
