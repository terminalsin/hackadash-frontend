import { NextRequest, NextResponse } from 'next/server';
import { DataStore, generatePinCode, populateHackathonData } from '@/lib/dataStore';
import { HackathonCreate } from '@/types';

export async function GET() {
    try {
        const hackathons = await DataStore.getHackathons();

        // Populate all hackathons with their related data
        const populatedHackathons = await Promise.all(
            hackathons.map(hackathon => populateHackathonData(hackathon))
        );

        return NextResponse.json(populatedHackathons);
    } catch (error) {
        console.error('Error fetching hackathons:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hackathons' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: HackathonCreate = await request.json();

        const hackathons = await DataStore.getHackathons();
        const id = await DataStore.generateId();

        const newHackathon = {
            id,
            title: body.title,
            description: body.description,
            image: body.image,
            location: body.location,
            start_time: new Date(body.start_time),
            end_time: new Date(body.end_time),
            pin_code: generatePinCode(),
            is_started: false,
            organisers: [],
            sponsors: [],
            teams: [],
            submissions: [],
            prizes: [],
            issues: [],
            created_at: new Date(),
            updated_at: new Date(),
        };

        hackathons.push(newHackathon);
        await DataStore.saveHackathons(hackathons);

        const populatedHackathon = await populateHackathonData(newHackathon);

        return NextResponse.json(populatedHackathon, { status: 201 });
    } catch (error) {
        console.error('Error creating hackathon:', error);
        return NextResponse.json(
            { error: 'Failed to create hackathon' },
            { status: 500 }
        );
    }
}
