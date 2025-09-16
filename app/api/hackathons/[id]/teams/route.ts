import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { TeamCreate } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const hackathonId = await parseInt(params.id);
        const teams = await DataStore.getTeams();
        const users = await DataStore.getUsers();

        const hackathonTeams = teams
            .filter(t => t.hackathon_id === hackathonId)
            .map(team => ({
                ...team,
                members: users.filter(u => u.role === 'GUEST') // Simplified for now
            }));

        return NextResponse.json(hackathonTeams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const hackathonId = parseInt(params.id);
        const body: TeamCreate = await request.json();

        const teams = await DataStore.getTeams();
        const id = await DataStore.generateId();

        const newTeam = {
            id,
            name: body.name,
            description: body.description,
            members: [],
            hackathon_id: hackathonId,
            created_at: new Date(),
            updated_at: new Date(),
        };

        teams.push(newTeam);
        await DataStore.saveTeams(teams);

        return NextResponse.json(newTeam, { status: 201 });
    } catch (error) {
        console.error('Error creating team:', error);
        return NextResponse.json(
            { error: 'Failed to create team' },
            { status: 500 }
        );
    }
}
