import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { TeamJoinRequest } from '@/types';
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

        const teamId = parseInt(params.id);
        const body: TeamJoinRequest = await request.json();

        const teams = await DataStore.getTeams();
        const users = await DataStore.getUsers();

        const team = teams.find(t => t.id === teamId);
        if (!team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        // Check if team is full (max 4 members)
        if (team.members && team.members.length >= 4) {
            return NextResponse.json(
                { error: 'Team is full' },
                { status: 400 }
            );
        }

        // Find the user in the users database
        let user = users.find(u => u.id === userId);

        // If user doesn't exist in our database, we need to create them
        // This would typically be handled by a webhook from Clerk
        if (!user) {
            // For now, we'll create a basic user entry
            // In a real app, this should be handled by Clerk webhooks
            user = {
                id: userId,
                firstName: null,
                lastName: null,
                fullName: null,
                emailAddress: 'unknown@example.com', // This should come from Clerk
                role: 'GUEST' as any,
                createdAt: new Date()
            };
            users.push(user);
            await DataStore.saveUsers(users);
        }

        // Check if user is already in any team for this hackathon
        const userTeam = teams.find(t =>
            t.hackathon_id === team.hackathon_id &&
            t.members && t.members.some(m => m.id.toString() === userId)
        );

        if (userTeam) {
            return NextResponse.json(
                { error: 'User is already in a team for this hackathon' },
                { status: 400 }
            );
        }

        // TODO: Validate join_code if provided
        // For now, we'll allow anyone to join without a code

        // Add user to team
        if (!team.members) {
            team.members = [];
        }

        // Convert User to the format expected by Team.members
        const teamMember = {
            id: user.id,
            name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            email: user.emailAddress,
            role: user.role
        };

        team.members.push(teamMember);
        team.updated_at = new Date();

        // Update the team in the database
        const teamIndex = teams.findIndex(t => t.id === teamId);
        teams[teamIndex] = team;
        await DataStore.saveTeams(teams);

        return NextResponse.json({
            message: 'Successfully joined team',
            team: team
        });
    } catch (error) {
        console.error('Error joining team:', error);
        return NextResponse.json(
            { error: 'Failed to join team' },
            { status: 500 }
        );
    }
}
