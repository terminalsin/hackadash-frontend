import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { auth } from '@clerk/nextjs/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const teamId = parseInt((await params).id);
        const teams = await DataStore.getTeams();
        const teamIndex = teams.findIndex(t => t.id === teamId);

        if (teamIndex === -1) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        const team = teams[teamIndex];

        // Check if team has members array
        if (!team.members || team.members.length === 0) {
            return NextResponse.json(
                { error: 'Team is empty' },
                { status: 400 }
            );
        }

        // Find the user in the team
        const memberIndex = team.members.findIndex(member =>
            member.id.toString() === userId
        );

        if (memberIndex === -1) {
            return NextResponse.json(
                { error: 'User is not a member of this team' },
                { status: 400 }
            );
        }

        // Remove the user from the team
        team.members.splice(memberIndex, 1);
        team.updated_at = new Date();

        // If the team becomes empty, we could optionally delete it
        // For now, we'll keep empty teams

        await DataStore.saveTeams(teams);

        return NextResponse.json(
            {
                message: 'Successfully left the team',
                team: team
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error leaving team:', error);
        return NextResponse.json(
            { error: 'Failed to leave team' },
            { status: 500 }
        );
    }
}
