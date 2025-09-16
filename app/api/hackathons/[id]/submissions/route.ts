import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const hackathonId = parseInt(params.id);
        const submissions = await DataStore.getSubmissions();
        const teams = await DataStore.getTeams();
        const sponsors = await DataStore.getSponsors();

        const hackathonSubmissions = submissions
            .filter(s => {
                const team = teams.find(t => t.id === s.team_id);
                return team && team.hackathon_id === hackathonId;
            })
            .map(submission => ({
                ...submission,
                sponsors_used: sponsors.filter(s =>
                    submission.sponsor_ids && submission.sponsor_ids.includes(s.id)
                )
            }));

        return NextResponse.json(hackathonSubmissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}
