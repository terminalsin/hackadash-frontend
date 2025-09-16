import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { SubmissionCreate, SubmissionState } from '@/types';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const teamId = parseInt(params.id);
        const body: SubmissionCreate = await request.json();

        const teams = await DataStore.getTeams();
        const team = teams.find(t => t.id === teamId);

        if (!team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        const submissions = await DataStore.getSubmissions();
        const sponsors = await DataStore.getSponsors();
        const id = await DataStore.generateId();

        const sponsorsUsed = body.sponsor_ids
            ? sponsors.filter(s => body.sponsor_ids!.includes(s.id))
            : [];

        const newSubmission = {
            id,
            title: body.title,
            description: body.description,
            github_link: body.github_link,
            presentation_link: body.presentation_link,
            state: SubmissionState.DRAFT,
            sponsor_ids: body.sponsor_ids || [],
            sponsors_used: sponsorsUsed,
            team_id: teamId,
            created_at: new Date(),
            updated_at: new Date(),
        };

        submissions.push(newSubmission);
        await DataStore.saveSubmissions(submissions);

        return NextResponse.json(newSubmission, { status: 201 });
    } catch (error) {
        console.error('Error creating submission:', error);
        return NextResponse.json(
            { error: 'Failed to create submission' },
            { status: 500 }
        );
    }
}
