import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { JoinRequest } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: JoinRequest = await request.json();

        const hackathons = await DataStore.getHackathons();
        const hackathon = hackathons.find(h => h.pin_code === body.pin_code);

        if (!hackathon) {
            return NextResponse.json(
                { error: 'Invalid pin code' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Successfully joined hackathon' });
    } catch (error) {
        console.error('Error joining hackathon:', error);
        return NextResponse.json(
            { error: 'Failed to join hackathon' },
            { status: 500 }
        );
    }
}
