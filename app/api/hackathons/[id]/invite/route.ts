import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { InviteRequest } from '@/types';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const hackathonId = parseInt(params.id);
        const body: InviteRequest = await request.json();

        const hackathons = await DataStore.getHackathons();
        const hackathon = hackathons.find(h => h.id === hackathonId);

        if (!hackathon) {
            return NextResponse.json(
                { error: 'Hackathon not found' },
                { status: 404 }
            );
        }

        // In a real implementation, you would send an email invitation here
        return NextResponse.json({ message: 'User invited successfully' });
    } catch (error) {
        console.error('Error inviting user:', error);
        return NextResponse.json(
            { error: 'Failed to invite user' },
            { status: 500 }
        );
    }
}
