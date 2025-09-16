import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { TeamUpdate } from '@/types';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const teamId = parseInt(params.id);
        const body: TeamUpdate = await request.json();

        const teams = await DataStore.getTeams();
        const index = teams.findIndex(t => t.id === teamId);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        const updates: any = {
            updated_at: new Date(),
        };

        if (body.name) updates.name = body.name;
        if (body.description) updates.description = body.description;

        teams[index] = {
            ...teams[index],
            ...updates,
        };

        await DataStore.saveTeams(teams);
        return NextResponse.json(teams[index]);
    } catch (error) {
        console.error('Error updating team:', error);
        return NextResponse.json(
            { error: 'Failed to update team' },
            { status: 500 }
        );
    }
}
