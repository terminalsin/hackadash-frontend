import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { SponsorCreate } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const hackathonId = parseInt((await params).id);
        const sponsors = await DataStore.getSponsors();
        const users = await DataStore.getUsers();

        const hackathonSponsors = sponsors
            .filter(s => s.hackathon_id === hackathonId)
            .map(sponsor => ({
                ...sponsor,
                employees: users.filter(u => u.role === 'SPONSOR' && u.companyId === sponsor.id.toString())
            }));

        return NextResponse.json(hackathonSponsors);
    } catch (error) {
        console.error('Error fetching sponsors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sponsors' },
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
        const body: SponsorCreate = await request.json();

        const sponsors = await DataStore.getSponsors();
        const id = await DataStore.generateId();

        const newSponsor = {
            id,
            name: body.name,
            description: body.description,
            logo: body.logo,
            website: body.website,
            hackathon_id: hackathonId,
            employees: [],
            created_at: new Date(),
        };

        sponsors.push(newSponsor);
        await DataStore.saveSponsors(sponsors);

        return NextResponse.json(newSponsor, { status: 201 });
    } catch (error) {
        console.error('Error creating sponsor:', error);
        return NextResponse.json(
            { error: 'Failed to create sponsor' },
            { status: 500 }
        );
    }
}
