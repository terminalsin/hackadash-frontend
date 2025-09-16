import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { PrizeCreate } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const hackathonId = parseInt(params.id);
        const prizes = await DataStore.getPrizes();

        const hackathonPrizes = prizes.filter(p => p.hackathon_id === hackathonId);
        return NextResponse.json(hackathonPrizes);
    } catch (error) {
        console.error('Error fetching prizes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prizes' },
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
        const body: PrizeCreate = await request.json();

        const prizes = await DataStore.getPrizes();
        const id = await DataStore.generateId();

        const newPrize = {
            id,
            title: body.title,
            description: body.description,
            value: body.value,
            sponsor_id: body.sponsor_id,
            hackathon_id: hackathonId,
            created_at: new Date(),
        };

        prizes.push(newPrize);
        await DataStore.savePrizes(prizes);

        return NextResponse.json(newPrize, { status: 201 });
    } catch (error) {
        console.error('Error creating prize:', error);
        return NextResponse.json(
            { error: 'Failed to create prize' },
            { status: 500 }
        );
    }
}
