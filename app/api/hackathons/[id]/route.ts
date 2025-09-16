import { NextRequest, NextResponse } from 'next/server';
import { DataStore, populateHackathonData } from '@/lib/dataStore';
import { HackathonUpdate } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const hackathons = await DataStore.getHackathons();

        const hackathon = hackathons.find(h => h.id === id);
        if (!hackathon) {
            return NextResponse.json(
                { error: 'Hackathon not found' },
                { status: 404 }
            );
        }

        const populatedHackathon = await populateHackathonData(hackathon);
        return NextResponse.json(populatedHackathon);
    } catch (error) {
        console.error('Error fetching hackathon:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hackathon' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body: HackathonUpdate = await request.json();

        const hackathons = await DataStore.getHackathons();
        const index = hackathons.findIndex(h => h.id === id);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Hackathon not found' },
                { status: 404 }
            );
        }

        const updates: any = {
            updated_at: new Date(),
        };

        if (body.title) updates.title = body.title;
        if (body.description) updates.description = body.description;
        if (body.image) updates.image = body.image;
        if (body.location) updates.location = body.location;
        if (body.start_time) updates.start_time = new Date(body.start_time);
        if (body.end_time) updates.end_time = new Date(body.end_time);

        hackathons[index] = {
            ...hackathons[index],
            ...updates,
        };

        await DataStore.saveHackathons(hackathons);

        const populatedHackathon = await populateHackathonData(hackathons[index]);
        return NextResponse.json(populatedHackathon);
    } catch (error) {
        console.error('Error updating hackathon:', error);
        return NextResponse.json(
            { error: 'Failed to update hackathon' },
            { status: 500 }
        );
    }
}
